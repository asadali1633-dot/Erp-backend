const generateQuotationNumber = async (req, res) => {
    try {
        const db = req.db;
        const { client_id } = req.body;

        if (!client_id || isNaN(client_id)) {
            return res.status(400).json({ success: false, message: 'Valid client_id is required' });
        }

        const [clientRows] = await db.query(
            `SELECT c.id, c.company_name, c.currency,
                c.billing_address_line1,
                c.registration_number AS strn,
                c.ntn,
                cc.first_name AS contact_first_name,
                cc.last_name AS contact_last_name,
                cc.email AS contact_email,
                cc.mobile AS contact_phone,
                sa.address_line1
            FROM clients c
            LEFT JOIN client_contacts cc ON c.id = cc.client_id AND cc.is_primary = 1
            LEFT JOIN client_shipping_addresses sa ON c.id = sa.client_id AND sa.default_shipping = 'Yes'
            WHERE c.id = ?`,
            [client_id]
        );
        if (clientRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        const client = clientRows[0];

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
                    currency: client.currency,
                    billing_address: client?.billing_address_line1,
                    shiping_address: client?.address_line1,
                    strn_no: client?.strn,
                    ntn_none: client?.ntn
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
                currency: client.currency,
                billing_address: client?.billing_address_line1,
                shiping_address: client?.address_line1,
                strn_no: client?.strn,
                ntn_no: client?.ntn
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

        const attachmentFiles = req.files || [];
        let attachmentsArray = [];
        for (const file of attachmentFiles) {
            attachmentsArray.push(`/uploads/quotations/${file.filename}`);
        }
        const attachmentsJSON = attachmentsArray.length > 0 ? JSON.stringify(attachmentsArray) : null;

        // Insert quotation master
        const [quoteResult] = await connection.query(
            `INSERT INTO quotations (
                quotation_number, quote_date, valid_until, revision_number,
                client_id, customer_name, customer_contact, customer_email, customer_phone,
                billing_address, shipping_address, project_id,
                sales_person_type, sales_person_id,
                currency, exchange_rate,
                status, private_notes, terms_conditions, attachments
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                quotation_number, quote_date, valid_until, revision_number || 0,
                client_id, customer_name, customer_contact, customer_email, customer_phone,
                billing_address, shipping_address, project_id || null,
                sales_person_type || null, sales_person_id || null,
                currency, exchange_rate,
                status, private_notes, terms_conditions, attachmentsJSON
            ]
        );

        const quotationId = quoteResult.insertId;

        // Insert quotation items
        if (itemsArray.length > 0) {
            for (const item of itemsArray) {
                const {
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
                        quotation_id, description, quantity, unit_price,
                        discount_percent, discount_amount, tax_rate, tax_amount,
                        line_total, uom
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, ?)`,
                    [
                        quotationId,
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

const getAllQuotationsSimple = async (req, res) => {
    try {
        const db = req.db;
        const [rows] = await db.query(
            `SELECT id, quotation_number, customer_name 
             FROM quotations
             ORDER BY id DESC`
        );
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllQuotations = async (req, res) => {
    try {
        const db = req.db;
        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * limit;

        const userId = req.user.id;
        const userType = req.user.user_type;
        const companyId = req.user.company;

        // Check if user has full access (Super_admin or Quotation_view permission)
        let hasFullAccess = false;
        if (userType === "Super_admin") {
            hasFullAccess = true;
        } else {
            const [permRows] = await db.query(
                `SELECT 1
                 FROM employee_permissions ep
                 INNER JOIN permissions p ON p.id = ep.permission_id
                 WHERE ep.company_id = ?
                   AND ep.employee_id = ?
                   AND p.slug = 'Quotation_view'
                   AND ep.assigned = 1
                 LIMIT 1`,
                [companyId, userId]
            );
            if (permRows.length > 0) hasFullAccess = true;
        }

        let whereClause = "";
        let values = [];

        // Search condition
        if (search) {
            whereClause = `WHERE (q.quotation_number LIKE ? OR q.customer_name LIKE ?)`;
            values = [`%${search}%`, `%${search}%`];
        } else {
            whereClause = "WHERE 1=1";
        }

        // If not full access, filter by sales_person (type + id)
        if (!hasFullAccess) {
            const userTypeValue = userType === "Super_admin" ? "Super_admin" : userType;
            whereClause += ` AND q.sales_person_type = ? AND q.sales_person_id = ?`;
            values.push(userTypeValue, userId);
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
                    q.revision_number, q.client_id, q.customer_name, q.attachments, q.status,
                    q.currency, q.created_at,
                    (SELECT COALESCE(SUM(line_total), 0) FROM quotation_items WHERE quotation_id = q.id) as total_amount
             FROM quotations q
             ${whereClause}
             ORDER BY q.id DESC
             LIMIT ? OFFSET ?`,
            [...values, Number(limit), Number(offset)]
        );

        // Parse attachments JSON string to array
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

        const [quotationRows] = await db.query(
            `SELECT * FROM quotations WHERE id = ?`,
            [id]
        );

        if (quotationRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        const quotation = quotationRows[0];

        if (quotation.attachments) {
            try {
                quotation.attachments = JSON.parse(quotation.attachments);
            } catch (e) {
                quotation.attachments = [];
            }
        } else {
            quotation.attachments = [];
        }

        let clientDetails = {};
        if (quotation.client_id) {
            const [clientRows] = await db.query(
                `SELECT registration_number, ntn FROM clients WHERE id = ?`,
                [quotation.client_id]
            );
            if (clientRows.length > 0) {
                clientDetails = clientRows[0];
            }
        }

        const [items] = await db.query(
            `SELECT id, description, quantity, unit_price,
                    discount_percent, discount_amount, tax_rate, tax_amount, line_total, uom
             FROM quotation_items
             WHERE quotation_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...quotation,
                registration_number: clientDetails.registration_number || null,
                ntn: clientDetails.ntn || null,
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

        // Handle attachments files (same as before)
        const files = req.files || {};
        const attachmentFiles = Array.isArray(files) ? files : (files.attachments || []);
        let attachmentsArray = [];
        if (attachmentFiles.length > 0) {
            attachmentsArray = attachmentFiles.map(file => `/uploads/quotations/${file.filename}`);
        } else {
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
                quotation_number = ?, quote_date = ?, valid_until = ?, revision_number = ?,
                client_id = ?, customer_name = ?, customer_contact = ?, customer_email = ?, customer_phone = ?,
                billing_address = ?, shipping_address = ?, project_id = ?,
                sales_person_type = ?, sales_person_id = ?,
                currency = ?, exchange_rate = ?,
                status = ?, private_notes = ?, terms_conditions = ?,
                attachments = ?
            WHERE id = ?`,
            [
                quotation_number, quote_date, valid_until, revision_number,
                client_id, customer_name, customer_contact, customer_email, customer_phone,
                billing_address, shipping_address, project_id || null,
                sales_person_type || null, sales_person_id || null,
                currency, exchange_rate,
                status, private_notes, terms_conditions,
                attachmentsJSON, id
            ]
        );

        // ========== UPSERT ITEMS (no delete, update or insert based on id or matching fields) ==========
        for (const item of itemsArray) {
            const {
                id: itemId,
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

            // Calculate line total
            let lineTotal = total;
            if (!lineTotal && quantity && Unit_Price) {
                let subtotal = parseFloat(quantity) * parseFloat(Unit_Price);
                let discount = discount_percent ? subtotal * (discount_percent / 100) : (discount_amount || 0);
                lineTotal = subtotal - discount;
            }

            // Helper to find existing item
            let existingItemId = null;
            if (itemId) {
                existingItemId = itemId;
            } else {
                // Try to find by matching description, quantity, and unit_price (case-insensitive trim)
                const [match] = await connection.query(
                    `SELECT id FROM quotation_items
                     WHERE quotation_id = ?
                       AND TRIM(description) = TRIM(?)
                       AND quantity = ?
                       AND unit_price = ?
                     LIMIT 1`,
                    [id, description, quantity, Unit_Price]
                );
                if (match.length > 0) {
                    existingItemId = match[0].id;
                }
            }

            if (existingItemId) {
                // Update existing item
                await connection.query(
                    `UPDATE quotation_items SET
                        description = ?, quantity = ?, unit_price = ?,
                        discount_percent = ?, discount_amount = ?, tax_rate = ?, tax_amount = ?,
                        line_total = ?, uom = ?
                    WHERE id = ? AND quotation_id = ?`,
                    [
                        description, quantity, Unit_Price,
                        discount_percent || 0, discount_amount || 0, tax_rate || 0, tax_amount || 0,
                        lineTotal || 0, uom || null,
                        existingItemId, id
                    ]
                );
            } else {
                // Insert new item
                await connection.query(
                    `INSERT INTO quotation_items (
                        quotation_id, description, quantity, unit_price,
                        discount_percent, discount_amount, tax_rate, tax_amount,
                        line_total, uom
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id, description, quantity, Unit_Price,
                        discount_percent || 0, discount_amount || 0, tax_rate || 0, tax_amount || 0,
                        lineTotal || 0, uom || null
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

const updateQuotationFile = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        const { id, field } = req.params;
        const files = req.files || [];
        const { index } = req.body;

        const allowedFields = ['attachments'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid field name' });
        }

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid quotation ID' });
        }

        if (files.length === 0) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Fetch existing attachments
        const [quotationRows] = await connection.query(
            'SELECT attachments FROM quotations WHERE id = ?',
            [id]
        );
        if (quotationRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        let attachmentsArray = [];
        if (quotationRows[0].attachments) {
            try {
                attachmentsArray = JSON.parse(quotationRows[0].attachments);
            } catch (e) {
                attachmentsArray = [];
            }
        }

        let updateValue = null;

        if (field === 'attachments') {
            if (index === undefined || index === null) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Index is required for attachments update' });
            }

            const newFilePath = `/uploads/quotations/${files[0].filename}`;
            if (index >= 0 && index < attachmentsArray.length) {
                attachmentsArray[index] = newFilePath;
            } else {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid index' });
            }
            updateValue = JSON.stringify(attachmentsArray);
        }

        await connection.query(
            `UPDATE quotations SET ${field} = ? WHERE id = ?`,
            [updateValue, id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: `${field} updated successfully`,
            data: { [field]: JSON.parse(updateValue) }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating quotation file:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

const deleteQuotationFile = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        const { id, field } = req.params;
        const { index } = req.body;

        const allowedFields = ['attachments'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid field name' });
        }

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid quotation ID' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Fetch existing attachments
        const [quotationRows] = await connection.query(
            `SELECT attachments FROM quotations WHERE id = ?`,
            [id]
        );
        if (quotationRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }

        let attachmentsArray = [];
        if (quotationRows[0].attachments) {
            try {
                attachmentsArray = JSON.parse(quotationRows[0].attachments);
            } catch (e) {
                attachmentsArray = [];
            }
        }

        let updateValue = null;

        if (field === 'attachments') {
            if (index === undefined || index === null) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Index required for attachments' });
            }
            if (index >= 0 && index < attachmentsArray.length) {
                attachmentsArray.splice(index, 1);
                updateValue = attachmentsArray.length > 0 ? JSON.stringify(attachmentsArray) : null;
            } else {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid index' });
            }
        }

        await connection.query(
            `UPDATE quotations SET ${field} = ? WHERE id = ?`,
            [updateValue, id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: `${field} deleted successfully`
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error deleting quotation file:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

const deleteQuotations = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        let { ids } = req.body;

        if (!ids) {
            return res.status(400).json({ success: false, message: 'No quotation IDs provided' });
        }
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        if (ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No quotation IDs provided' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const placeholders = ids.map(() => '?').join(',');
        const [result] = await connection.query(
            `DELETE FROM quotations WHERE id IN (${placeholders})`,
            ids
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Quotation(s) deleted successfully',
            deletedCount: result.affectedRows
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Delete quotations error:', error);
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
    updateQuotation,
    updateQuotationFile,
    deleteQuotationFile,
    deleteQuotations,
    getAllQuotationsSimple
}