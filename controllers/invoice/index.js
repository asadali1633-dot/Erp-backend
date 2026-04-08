

const generateInvoiceNumber = async (req, res) => {
    try {
        const db = req.db;
        const { client_id, custom_invoice_number } = req.body;

        // ---------- CUSTOM INVOICE NUMBER (manual entry) ----------
        if (custom_invoice_number && custom_invoice_number.trim() !== "") {
            // Check globally (across all customers)
            const [existing] = await db.query(
                `SELECT id FROM invoices WHERE invoice_number = ?`,
                [custom_invoice_number]
            );
            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Invoice number already exists. Please use a different number.'
                });
            }
            return res.json({
                success: true,
                data: {
                    invoice_number: custom_invoice_number,
                    sequence: null,
                    note: 'Manual entry'
                }
            });
        }

        // ---------- FETCH CUSTOMER DETAILS (if customer_id provided) ----------
        let customerDetails = null;
        if (client_id && !isNaN(parseInt(client_id))) {
            const [clientRows] = await db.query(
                `SELECT company_name,
                        billing_address_line1,currency
                 FROM clients WHERE id = ?`,
                [client_id]
            );
            if (clientRows.length > 0) {
                const client = clientRows[0];
                const billingAddress = [
                    client.billing_address_line1
                ].filter(Boolean).join(', ');

                let shippingAddress = '';
                const [shippingRows] = await db.query(
                    `SELECT address_line1
                     FROM client_shipping_addresses
                     WHERE client_id = ?
                     ORDER BY default_shipping = 'Yes' DESC, id ASC
                     LIMIT 1`,
                    [client_id]
                );
                if (shippingRows.length > 0) {
                    const ship = shippingRows[0];
                    shippingAddress = [
                        ship.address_line1,
                    ].filter(Boolean).join(', ');
                }

                let contactFirstName = '', contactLastName = '', contactFullName = '', contactEmail = '';
                const [contactRows] = await db.query(
                    `SELECT first_name, last_name, email
                     FROM client_contacts
                     WHERE client_id = ?
                     ORDER BY is_primary DESC, id ASC
                     LIMIT 1`,
                    [client_id]
                );
                if (contactRows.length > 0) {
                    contactFirstName = contactRows[0].first_name || '';
                    contactLastName = contactRows[0].last_name || '';
                    contactFullName = `${contactFirstName} ${contactLastName}`.trim();
                    contactEmail = contactRows[0].email || '';
                }

                customerDetails = {
                    company_name: client.company_name || '',
                    billing_address: billingAddress,
                    shipping_address: shippingAddress,
                    contact_first_name: contactFirstName,
                    contact_last_name: contactLastName,
                    contact_name: contactFullName,
                    contact_email: contactEmail,
                    currency: client?.currency
                };
            }
        }

        // ---------- AUTO-GENERATE SEQUENTIAL NUMBER (without sequences table) ----------
        // Find the maximum numeric invoice number (like '000001')
        const [maxRow] = await db.query(
            `SELECT invoice_number FROM invoices 
             WHERE invoice_number REGEXP '^[0-9]{6}$' 
             ORDER BY CAST(invoice_number AS UNSIGNED) DESC 
             LIMIT 1`
        );

        let nextNumber = 1;
        if (maxRow.length > 0) {
            nextNumber = parseInt(maxRow[0].invoice_number, 10) + 1;
            if (nextNumber > 999999) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum invoice number limit reached (999999)'
                });
            }
        }
        const invoiceNumber = nextNumber.toString().padStart(6, '0');

        // Double-check uniqueness (avoid race condition)
        const [existing] = await db.query(
            `SELECT id FROM invoices WHERE invoice_number = ?`,
            [invoiceNumber]
        );
        if (existing.length > 0) {
            // Fallback to timestamp if duplicate (extremely rare)
            const timestamp = Date.now().toString().slice(-6);
            return res.json({
                success: true,
                data: {
                    invoice_number: timestamp,
                    sequence: nextNumber,
                    note: 'Used timestamp as fallback due to collision',
                    customer_details: customerDetails
                }
            });
        }

        res.json({
            success: true,
            data: {
                invoice_number: invoiceNumber,
                sequence: nextNumber,
                customer_details: customerDetails
            }
        });
    } catch (error) {
        console.error('Error generating invoice number:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createInvoice = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        connection = await db.getConnection();
        await connection.beginTransaction();
        const {
            invoice_number,
            invoice_date,
            due_date,
            client_id,
            customer_name,
            contact_person,
            contact_email,
            billing_address,
            shipping_address,
            customer_po_reference,
            sales_order_id,
            project_id,
            service_order_ids,
            currency,
            exchange_rate,
            acc_holder_name,
            bank_account_details,
            status,
            payment_references,
            payment_dates,
            payment_method,
            payment_status,
            dunning_level,
            last_reminder_date,
            write_off_date,
            private_notes,
            terms_conditions,
            items
        } = req.body;


        // Validate required fields
        if (!invoice_number || !invoice_date || !due_date || !client_id || !customer_name || !billing_address) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Parse items (if provided)
        let itemsArray = Array.isArray(items) ? items : [];

        // Optional: validate each item (remove this if not needed)
        for (const item of itemsArray) {
            if (!item.description || !item.quantity || !item.Unit_Price) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Each item must have description, quantity, and unit price' });
            }
        }

        // Parse service_order_ids and payment_dates (JSON arrays)
        let serviceOrderIdsJSON = null;
        if (service_order_ids) {
            try {
                serviceOrderIdsJSON = JSON.stringify(JSON.parse(service_order_ids));
            } catch (e) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid service_order_ids' });
            }
        }

        let paymentDatesJSON = null;
        if (payment_dates) {
            if (Array.isArray(payment_dates)) {
                paymentDatesJSON = JSON.stringify(payment_dates);
            } else if (typeof payment_dates === 'string') {
                try {
                    paymentDatesJSON = JSON.stringify(JSON.parse(payment_dates));
                } catch (e) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, message: 'Invalid payment_dates' });
                }
            }
        }

        // Insert invoice master
        const [result] = await connection.query(
            `INSERT INTO invoices (
                invoice_number, invoice_date, due_date,
                client_id, customer_name, contact_person, contact_email,
                billing_address, shipping_address,
                customer_po_reference, sales_order_id, project_id, service_order_ids,
                currency, exchange_rate,
                acc_holder_name, bank_account_details,
                status, payment_references, payment_dates, payment_method, payment_status,
                dunning_level, last_reminder_date, write_off_date,
                private_notes, terms_conditions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                invoice_number, invoice_date, due_date,
                client_id, customer_name, contact_person, contact_email,
                billing_address, shipping_address,
                customer_po_reference, sales_order_id, project_id, serviceOrderIdsJSON,
                currency, exchange_rate,
                acc_holder_name, bank_account_details,
                status, payment_references, paymentDatesJSON, payment_method, payment_status,
                dunning_level, last_reminder_date, write_off_date,
                private_notes, terms_conditions
            ]
        );

        const invoiceId = result.insertId;

        // Insert invoice items (same as before)
        if (itemsArray.length > 0) {
            for (const item of itemsArray) {
                const {
                    product_id,
                    description,
                    quantity,
                    uom,
                    Unit_Price,
                    discount_percent,
                    discount_amount,
                    tax_rate,
                    tax_amount,
                    total
                } = item;

                let lineTotal = total;
                if (!lineTotal && quantity && Unit_Price) {
                    let subtotal = parseFloat(quantity) * parseFloat(Unit_Price);
                    let discount = discount_percent ? subtotal * (discount_percent / 100) : (discount_amount || 0);
                    lineTotal = subtotal - discount;
                }

                await connection.query(
                    `INSERT INTO invoice_items (
                        invoice_id, product_id, description, quantity, unit_price, uom,
                        discount_percent, discount_amount, tax_rate, tax_amount, line_total
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        invoiceId,
                        product_id || null,
                        description,
                        quantity,
                        Unit_Price,
                        uom || null,
                        discount_percent || 0,
                        discount_amount || 0,
                        tax_rate || 0,
                        tax_amount || 0,
                        lineTotal || 0
                    ]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: { id: invoiceId, invoice_number }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating invoice:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

const getAllInvoices = async (req, res) => {
    try {
        const db = req.db;
        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = "";
        let values = [];

        if (search) {
            whereClause = `WHERE i.invoice_number LIKE ? OR i.customer_name LIKE ?`;
            values = [`%${search}%`, `%${search}%`];
        } else {
            whereClause = "WHERE 1=1";
        }

        // Count total invoices
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM invoices i ${whereClause}`,
            values
        );
        const total = countResult[0].total;

        // Fetch paginated invoices with total amount (sum of line_total)
        const [rows] = await db.query(
            `SELECT i.id, i.invoice_number, i.invoice_date, i.due_date,
                    i.customer_name, i.status, i.currency, i.attachments, i.created_at,
                    (SELECT COALESCE(SUM(line_total), 0) 
                     FROM invoice_items 
                     WHERE invoice_id = i.id) as total_amount
             FROM invoices i
             ${whereClause}
             ORDER BY i.id DESC
             LIMIT ? OFFSET ?`,
            [...values, Number(limit), Number(offset)]
        );

        // Parse attachments JSON to array
        const data = rows.map(row => {
            if (row.attachments) {
                try {
                    row.attachments = JSON.parse(row.attachments);
                } catch (e) {
                    row.attachments = [];
                }
            } else {
                row.attachments = [];
            }
            return row;
        });

        res.json({
            success: true,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data: data
        });
    } catch (error) {
        console.error("Get invoices paginated error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const db = req.db;
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid invoice ID' });
        }

        // Fetch invoice master
        const [invoiceRows] = await db.query(
            `SELECT * FROM invoices WHERE id = ?`,
            [id]
        );
        if (invoiceRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const invoice = invoiceRows[0];

        // Parse JSON fields
        if (invoice.attachments) {
            try {
                invoice.attachments = JSON.parse(invoice.attachments);
            } catch (e) {
                invoice.attachments = [];
            }
        } else {
            invoice.attachments = [];
        }

        if (invoice.service_order_ids) {
            try {
                invoice.service_order_ids = JSON.parse(invoice.service_order_ids);
            } catch (e) {
                invoice.service_order_ids = [];
            }
        } else {
            invoice.service_order_ids = [];
        }

        if (invoice.payment_dates) {
            try {
                invoice.payment_dates = JSON.parse(invoice.payment_dates);
            } catch (e) {
                invoice.payment_dates = [];
            }
        } else {
            invoice.payment_dates = [];
        }

        // Fetch invoice items
        const [items] = await db.query(
            `SELECT id, product_id, description, quantity, unit_price, uom,
                    discount_percent, discount_amount, tax_rate, tax_amount, line_total
             FROM invoice_items
             WHERE invoice_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...invoice,
                items
            }
        });
    } catch (error) {
        console.error('Error fetching invoice by ID:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    generateInvoiceNumber,
    createInvoice,
    getAllInvoices,
    getInvoiceById
}