

const generateClientCode = async (req, res) => {
    try {
        const db = req.db;

        // Find maximum numeric client_code (like '000001')
        const [result] = await db.query(
            `SELECT client_code FROM clients 
             WHERE client_code REGEXP '^[0-9]{6}$' 
             ORDER BY CAST(client_code AS UNSIGNED) DESC 
             LIMIT 1`
        );

        let nextNumber = 1;
        if (result.length > 0) {
            nextNumber = parseInt(result[0].client_code, 10) + 1;
            if (nextNumber > 999999) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum client code limit reached (999999)'
                });
            }
        }
        const clientCode = nextNumber.toString().padStart(6, '0');

        // uniqueness check
        const [existing] = await db.query(
            'SELECT id FROM clients WHERE client_code = ?',
            [clientCode]
        );
        if (existing.length > 0) {
            const timestamp = Date.now().toString().slice(-6);
            return res.json({
                success: true,
                data: {
                    client_code: timestamp,
                    note: 'Used timestamp as fallback'
                }
            });
        }

        res.json({
            success: true,
            data: {
                client_code: clientCode,
                sequence: nextNumber
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getClientsList = async (req, res) => {
    try {
        const db = req.db;
        const [rows] = await db.query(
            `SELECT id, client_code, company_name, status, created_at
             FROM clients
             ORDER BY id DESC`
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error("Get clients error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createClient = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        connection = await db.getConnection();
        await connection.beginTransaction();

        // JSON fields from body
        const {
            client_id, client_type, company_name, trading_name, registration_number,
            ntn, strn, website, industry, client_since, status, client_source,
            parent_client, language, currency,
            billing_address_line1, billing_address_line2, billing_city, state,
            billing_postal_code, country,
            payment_terms, credit_limit, credit_currency, credit_risk_rating,
            credit_check_date, credit_check_reference, payment_method, bank_account_details,
            // tax_exemption_certificate, msa_document files se aayenge
            invoicing_delivery_method, invoice_emails, dunning_contact,
            msa_reference, msa_start_date, msa_end_date,
            nda_signed, nda_date, nda_expiry, preferred_status,
            total_lifetime_revenue, number_of_quotes, number_of_projects,
            number_of_service_orders, number_of_assets,
            last_quote_date, last_invoice_date, last_project_date,
            last_service_date, next_followup_date,
            account_manager, secondary_account_manager,
            internal_notes, gdpr_consent_date, marketing_opt_out,
            contacts, shipping_addresses,
            outstanding_balance, available_credit
        } = req.body;

        const files = req.files || {};
        const taxExemptionFile = files.tax_exemption_certificate ? files.tax_exemption_certificate[0] : null;
        const msaDocumentFile = files.msa_document ? files.msa_document[0] : null;
        const attachmentFiles = files.attachments || [];

        const tax_exemption_certificate = taxExemptionFile ? `/uploads/client_documents/${taxExemptionFile.filename}` : null;
        const msa_document = msaDocumentFile ? `/uploads/client_documents/${msaDocumentFile.filename}` : null;

        let attachmentsArray = [];
        for (const file of attachmentFiles) {
            attachmentsArray.push(`/uploads/client_documents/${file.filename}`);
        }
        const attachmentsJSON = attachmentsArray.length > 0 ? JSON.stringify(attachmentsArray) : null;

        if (!client_id || !company_name) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'client_code and company_name are required' });
        }

        let account_manager_type = null,
            super_admin_account_manager_id = null,
            employee_account_manager_id = null;
        if (account_manager && account_manager.id) {
            account_manager_type = account_manager.type;
            if (account_manager.type === 'super_admin')
                super_admin_account_manager_id = account_manager.id;
            else if (account_manager.type === 'employee')
                employee_account_manager_id = account_manager.id;
        }

        let secondary_account_manager_type = null,
            super_admin_secondary_account_manager_id = null,
            employee_secondary_account_manager_id = null;
        if (secondary_account_manager && secondary_account_manager.id) {
            secondary_account_manager_type = secondary_account_manager.type;
            if (secondary_account_manager.type === 'super_admin')
                super_admin_secondary_account_manager_id = secondary_account_manager.id;
            else if (secondary_account_manager.type === 'employee')
                employee_secondary_account_manager_id = secondary_account_manager.id;
        }

        const columns = [
            'client_code', 'client_type', 'company_name', 'trading_name', 'registration_number',
            'ntn', 'strn', 'website', 'industry', 'client_since', 'status', 'client_source',
            'parent_client_id', 'language', 'currency',
            'billing_address_line1', 'billing_address_line2', 'billing_city', 'billing_state',
            'billing_postal_code', 'billing_country',
            'payment_terms', 'credit_limit', 'credit_currency', 'credit_risk_rating',
            'credit_check_date', 'credit_check_reference', 'payment_method', 'bank_account_details',
            'tax_exemption_certificate', 'invoicing_delivery_method', 'invoice_emails', 'dunning_contact',
            'msa_reference', 'msa_start_date', 'msa_end_date', 'msa_document',
            'nda_signed', 'nda_date', 'nda_expiry', 'preferred_status',
            'total_lifetime_revenue', 'number_of_quotes', 'number_of_projects',
            'number_of_service_orders', 'number_of_assets',
            'last_quote_date', 'last_invoice_date', 'last_project_date',
            'last_service_date', 'next_followup_date',
            'account_manager_type', 'super_admin_account_manager_id', 'employee_account_manager_id',
            'secondary_account_manager_type', 'super_admin_secondary_account_manager_id',
            'employee_secondary_account_manager_id',
            'internal_notes', 'gdpr_consent_date', 'marketing_opt_out',
            'outstanding_balance', 'available_credit',
            'attachments'
        ];

        const values = [
            client_id, client_type, company_name, trading_name, registration_number,
            ntn, strn, website, industry, client_since, status, client_source,
            parent_client, language, currency,
            billing_address_line1, billing_address_line2, billing_city, state,
            billing_postal_code, country,
            payment_terms, credit_limit, credit_currency, credit_risk_rating,
            credit_check_date, credit_check_reference, payment_method, bank_account_details,
            tax_exemption_certificate, invoicing_delivery_method, invoice_emails, dunning_contact,
            msa_reference, msa_start_date, msa_end_date, msa_document,
            nda_signed, nda_date, nda_expiry, preferred_status,
            total_lifetime_revenue || 0, number_of_quotes || 0, number_of_projects || 0,
            number_of_service_orders || 0, number_of_assets || 0,
            last_quote_date, last_invoice_date, last_project_date,
            last_service_date, next_followup_date,
            account_manager_type, super_admin_account_manager_id, employee_account_manager_id,
            secondary_account_manager_type, super_admin_secondary_account_manager_id,
            employee_secondary_account_manager_id,
            internal_notes, gdpr_consent_date, marketing_opt_out,
            outstanding_balance || 0, available_credit || null,
            attachmentsJSON
        ];

        const placeholders = columns.map(() => '?').join(', ');
        const insertQuery = `INSERT INTO clients (${columns.join(', ')}) VALUES (${placeholders})`;

        const [clientResult] = await connection.query(insertQuery, values);
        const clientId = clientResult.insertId;

        if (contacts && contacts.length > 0) {
            for (const contact of contacts) {
                const { first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary } = contact;
                await connection.query(
                    `INSERT INTO client_contacts (client_id, first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [clientId, first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary || 0]
                );
            }
        }

        if (shipping_addresses && shipping_addresses.length > 0) {
            for (const addr of shipping_addresses) {
                const { address_name, address_line1, address_line2, city, state_province, postal_code, country, default_shipping, contact_person, phone_location, notes } = addr;
                await connection.query(
                    `INSERT INTO client_shipping_addresses (client_id, address_name, address_line1, address_line2, city, state_province, postal_code, country, default_shipping, contact_person, phone_location, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [clientId, address_name, address_line1, address_line2, city, state_province, postal_code, country, default_shipping || 'No', contact_person, phone_location, notes]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            data: { client_id: clientId, client_code: client_id }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating client:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

const getClientsWithPagination = async (req, res) => {
    try {
        const db = req.db;
        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * limit;

        // Base query
        let whereClause = "";
        let values = [];

        if (search) {
            whereClause = `WHERE company_name LIKE ? OR client_code LIKE ?`;
            values = [`%${search}%`, `%${search}%`];
        }

        // Count total records
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM clients ${whereClause}`,
            values
        );
        const total = countResult[0].total;

        // Fetch paginated data
        const [rows] = await db.query(
            `SELECT id, client_code, company_name, trading_name, client_type, status,
                    billing_city, billing_country, currency, created_at
             FROM clients
             ${whereClause}
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [...values, Number(limit), Number(offset)]
        );

        res.json({
            success: true,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            data: rows
        });
    } catch (error) {
        console.error("Get clients paginated error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    generateClientCode,
    createClient,
    getClientsList,
    getClientsWithPagination
}