const generateQuotationNumber = async (req, res) => {
    try {
        const db = req.db;
        const { client_id } = req.body;

        if (!client_id || isNaN(client_id)) {
            return res.status(400).json({ success: false, message: 'Valid client_id is required' });
        }

        // Fetch client details including primary contact, currency, and payment terms
        const [clientRows] = await db.query(
            `SELECT c.id, c.company_name, c.currency, c.payment_terms,
                    c.billing_address_line1, c.billing_address_line2,
                    c.billing_city, c.billing_state, c.billing_postal_code, c.billing_country,
                    cc.first_name AS contact_first_name,
                    cc.last_name AS contact_last_name,
                    cc.email AS contact_email,
                    cc.mobile AS contact_phone
             FROM clients c
             LEFT JOIN client_contacts cc ON c.id = cc.client_id AND cc.is_primary = 1
             WHERE c.id = ?`,
            [client_id]
        );
        if (clientRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        const client = clientRows[0];

        // Build billing address string
        const billingAddress = [
            client.billing_address_line1,
            client.billing_address_line2,
            client.billing_city,
            client.billing_state,
            client.billing_postal_code,
            client.billing_country
        ].filter(Boolean).join(', ');

        // Build contact full name
        const contactName = `${client.contact_first_name || ''} ${client.contact_last_name || ''}`.trim();

        // Generate quotation number (same logic as before)
        const companyName = client.company_name;
        let prefix = companyName.substring(0, 2).toUpperCase();
        if (prefix.length < 2) prefix = prefix.padEnd(2, 'X');

        const pattern = `^${prefix}-[0-9]{6}$`;
        const [maxRow] = await db.query(
            `SELECT MAX(CAST(SUBSTRING(quotation_number, LOCATE('-', quotation_number) + 1) AS UNSIGNED)) as max_num
             FROM quotations
             WHERE client_id = ? AND quotation_number REGEXP ?`,
            [client_id, pattern]
        );

        let nextNumber = (maxRow[0].max_num || 0) + 1;
        if (nextNumber > 999999) {
            return res.status(400).json({
                success: false,
                message: 'Maximum quotation number limit reached for this client'
            });
        }

        const paddedNumber = nextNumber.toString().padStart(6, '0');
        const quotationNumber = `${prefix}-${paddedNumber}`;

        // Uniqueness fallback
        const [existing] = await db.query(
            'SELECT id FROM quotations WHERE quotation_number = ?',
            [quotationNumber]
        );
        if (existing.length > 0) {
            const timestamp = Date.now().toString().slice(-6);
            const fallbackNumber = `${prefix}-${timestamp}`;
            return res.json({
                success: true,
                data: {
                    quotation_number: fallbackNumber,
                    sequence: nextNumber,
                    prefix,
                    customer_name: client.company_name,
                    customer_contact: contactName,
                    customer_email: client.contact_email,
                    customer_phone: client.contact_phone,
                    currency: client.currency || 'PKR',
                    payment_terms: client.payment_terms || 'Net 30',
                    billing_address: billingAddress,
                    note: 'Used timestamp as fallback due to duplicate'
                }
            });
        }

        res.json({
            success: true,
            data: {
                quotation_number: quotationNumber,
                sequence: nextNumber,
                prefix,
                customer_name: client.company_name,
                customer_contact: contactName,
                customer_email: client.contact_email,
                customer_phone: client.contact_phone,
                currency: client.currency || 'PKR',
                payment_terms: client.payment_terms || 'Net 30',
                billing_address: billingAddress
            }
        });

    } catch (error) {
        console.error('Error generating quotation number:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createQuotation = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        connection = await db.getConnection();
        await connection.beginTransaction();

        const {
            quotation_number,
            quote_date,
            valid_until,
            revision_number,
            client_id,
            customer_name,
            customer_contact,
            customer_email,
            customer_phone,
            billing_address,
            shipping_address,
            project_id,
            sales_person_type,
            sales_person_id,
            currency,
            exchange_rate,
            payment_terms,
            delivery_terms,
            status,
            private_notes,
            terms_conditions,
            items               // JSON string of items array
        } = req.body;

        // Parse items (if provided)
        let itemsArray = [];
        if (items) {
            try {
                itemsArray = JSON.parse(items);
            } catch (e) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid items format' });
            }
        }

        // Handle attachments files
        const files = req.files || {};
        const attachmentFiles = files.attachments || [];
        const attachmentsArray = attachmentFiles.map(file => `/uploads/quotations/${file.filename}`);
        const attachmentsJSON = attachmentsArray.length > 0 ? JSON.stringify(attachmentsArray) : null;

        // Insert quotation master
        const [quoteResult] = await connection.query(
            `INSERT INTO quotations (
                quotation_number, quote_date, valid_until, revision_number,
                client_id, customer_name, customer_contact, customer_email, customer_phone,
                billing_address, shipping_address, project_id,
                sales_person_type, sales_person_id,
                currency, exchange_rate, payment_terms, delivery_terms,
                status, private_notes, terms_conditions, attachments
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                quotation_number, quote_date, valid_until, revision_number || 0,
                client_id, customer_name, customer_contact, customer_email, customer_phone,
                billing_address, shipping_address, project_id || null,
                sales_person_type || null, sales_person_id || null,
                currency, exchange_rate, payment_terms, delivery_terms,
                status, private_notes, terms_conditions, attachmentsJSON
            ]
        );

        const quotationId = quoteResult.insertId;

        // Insert quotation items
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

                // Calculate line total if not provided (fallback)
                let lineTotal = total;
                if (!lineTotal && quantity && Unit_Price) {
                    let subtotal = parseFloat(quantity) * parseFloat(Unit_Price);
                    let discount = discount_percent ? subtotal * (discount_percent / 100) : (discount_amount || 0);
                    lineTotal = subtotal - discount;
                }

                await connection.query(
                    `INSERT INTO quotation_items (
                        quotation_id, product_id, description, quantity, unit_price,
                        discount_percent, discount_amount, tax_rate, tax_amount,
                        line_total, uom
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        quotationId,
                        product_id || null,
                        description,
                        quantity,
                        Unit_Price,
                        discount_percent || 0,
                        discount_amount || 0,
                        tax_rate || 0,
                        tax_amount || 0,
                        lineTotal || 0,
                        item.sort_order || 0,
                        uom || null
                    ]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Quotation created successfully',
            data: { id: quotationId, quotation_number }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating quotation:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

const getAllQuotations = async (req, res) => {
    try {
        const db = req.db;
        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = "";
        let values = [];

        if (search) {
            whereClause = `WHERE q.quotation_number LIKE ? OR q.customer_name LIKE ?`;
            values = [`%${search}%`, `%${search}%`];
        }

        // Count total records
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM quotations q ${whereClause}`,
            values
        );
        const total = countResult[0].total;

        // Fetch paginated data
        const [rows] = await db.query(
            `SELECT q.id, q.quotation_number, q.quote_date, q.valid_until,
                    q.revision_number, q.client_id, q.customer_name, q.status,
                    q.currency, q.payment_terms, q.created_at,
                    (SELECT COALESCE(SUM(line_total), 0) FROM quotation_items WHERE quotation_id = q.id) as total_amount
             FROM quotations q
             ${whereClause}
             ORDER BY q.id DESC
             LIMIT ? OFFSET ?`,
            [...values, Number(limit), Number(offset)]
        );

        // Parse attachments if needed (optional, can be heavy)
        // For simplicity, we return without attachments. If needed, add another query or JSON parse.

        res.json({
            success: true,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data: rows
        });
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getQuotationById = async (req, res) => {
    try {
        const db = req.db;
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid quotation ID' });
        }

        // Fetch quotation master
        const [quotationRows] = await db.query(
            `SELECT * FROM quotations WHERE id = ?`,
            [id]
        );

        if (quotationRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        const quotation = quotationRows[0];

        // Parse attachments if present
        if (quotation.attachments) {
            try {
                quotation.attachments = JSON.parse(quotation.attachments);
            } catch (e) {
                quotation.attachments = [];
            }
        } else {
            quotation.attachments = [];
        }

        // Fetch quotation items
        const [items] = await db.query(
            `SELECT id, product_id, description, quantity, unit_price,
                    discount_percent, discount_amount, tax_rate, tax_amount, line_total, uom
             FROM quotation_items
             WHERE quotation_id = ?`,
            [id]
        );

        // // Optionally fetch sales person details (if needed)
        // let salesPerson = null;
        // if (quotation.sales_person_type && quotation.sales_person_id) {
        //     const table = quotation.sales_person_type === 'super_admin' ? 'super_admin' : 'employee_info';
        //     const [personRows] = await db.query(
        //         `SELECT id, first_name, last_name, email FROM ${table} WHERE id = ?`,
        //         [quotation.sales_person_id]
        //     );
        //     if (personRows.length > 0) {
        //         salesPerson = personRows[0];
        //     }
        // }

        res.json({
            success: true,
            data: {
                ...quotation,
                items,
            }
        });
    } catch (error) {
        console.error('Error fetching quotation by ID:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateQuotation = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid quotation ID' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Check if quotation exists
        const [existing] = await connection.query(
            'SELECT id FROM quotations WHERE id = ?',
            [id]
        );
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        // Destructure fields from body
        const {
            quotation_number,
            quote_date,
            valid_until,
            revision_number,
            client_id,
            customer_name,
            customer_contact,
            customer_email,
            customer_phone,
            billing_address,
            shipping_address,
            project_id,
            sales_person_type,
            sales_person_id,
            currency,
            exchange_rate,
            payment_terms,
            delivery_terms,
            status,
            private_notes,
            terms_conditions,
            items               // JSON string of items array
        } = req.body;

        // Parse items
        let itemsArray = [];
        if (items) {
            try {
                itemsArray = JSON.parse(items);
            } catch (e) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid items format' });
            }
        }

        // Handle attachments files
        const files = req.files || {};
        const attachmentFiles = Array.isArray(files) ? files : (files.attachments || []);
        let attachmentsArray = [];

        // If new files are uploaded, save them
        if (attachmentFiles.length > 0) {
            attachmentsArray = attachmentFiles.map(file => `/uploads/quotations/${file.filename}`);
        } else {
            // If no new files, keep existing attachments (optional – you can fetch and keep)
            const [oldQuotation] = await connection.query(
                'SELECT attachments FROM quotations WHERE id = ?',
                [id]
            );
            if (oldQuotation[0].attachments) {
                try {
                    attachmentsArray = JSON.parse(oldQuotation[0].attachments);
                } catch (e) {
                    attachmentsArray = [];
                }
            }
        }
        const attachmentsJSON = attachmentsArray.length > 0 ? JSON.stringify(attachmentsArray) : null;

        // Update quotation master
        await connection.query(
            `UPDATE quotations SET
                quotation_number = ?,
                quote_date = ?,
                valid_until = ?,
                revision_number = ?,
                client_id = ?,
                customer_name = ?,
                customer_contact = ?,
                customer_email = ?,
                customer_phone = ?,
                billing_address = ?,
                shipping_address = ?,
                project_id = ?,
                sales_person_type = ?,
                sales_person_id = ?,
                currency = ?,
                exchange_rate = ?,
                payment_terms = ?,
                delivery_terms = ?,
                status = ?,
                private_notes = ?,
                terms_conditions = ?,
                attachments = ?
            WHERE id = ?`,
            [
                quotation_number, quote_date, valid_until, revision_number || 0,
                client_id, customer_name, customer_contact, customer_email, customer_phone,
                billing_address, shipping_address, project_id || null,
                sales_person_type || null, sales_person_id || null,
                currency || 'PKR', exchange_rate || 1, payment_terms, delivery_terms,
                status || 'Draft', private_notes, terms_conditions,
                attachmentsJSON, id
            ]
        );

        // Delete old items
        await connection.query('DELETE FROM quotation_items WHERE quotation_id = ?', [id]);

        // Insert new items
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

                // Calculate line total if not provided
                let lineTotal = total;
                if (!lineTotal && quantity && Unit_Price) {
                    let subtotal = parseFloat(quantity) * parseFloat(Unit_Price);
                    let discount = discount_percent ? subtotal * (discount_percent / 100) : (discount_amount || 0);
                    lineTotal = subtotal - discount;
                }

                await connection.query(
                    `INSERT INTO quotation_items (
                        quotation_id, product_id, description, quantity, unit_price,
                        discount_percent, discount_amount, tax_rate, tax_amount,
                        line_total, uom
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id,
                        product_id || null,
                        description,
                        quantity,
                        Unit_Price,
                        discount_percent || 0,
                        discount_amount || 0,
                        tax_rate || 0,
                        tax_amount || 0,
                        lineTotal || 0,
                        uom || null
                    ]
                );
            }
        }

        await connection.commit();

        res.json({
            success: true,
            message: 'Quotation updated successfully',
            data: { id }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating quotation:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    generateQuotationNumber,
    createQuotation,
    getAllQuotations,
    getQuotationById,
    updateQuotation
}