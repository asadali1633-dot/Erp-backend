

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

        const {
            client_id, client_type, company_name, trading_name, registration_number,
            ntn, strn, website, industry, client_since, status, client_source,
            parent_client, language, currency,
            billing_address_line1, billing_address_line2, billing_city, state,
            billing_postal_code, country,
            payment_terms, credit_limit, credit_currency, credit_risk_rating,
            credit_check_date, credit_check_reference, payment_method, bank_account_details,
            invoicing_delivery_method, invoice_emails, dunning_contact,
            msa_reference, msa_start_date, msa_end_date,
            nda_signed, nda_date, nda_expiry, preferred_status,
            total_lifetime_revenue, number_of_quotes, number_of_projects,
            number_of_service_orders, number_of_assets,
            last_quote_date, last_invoice_date, last_project_date,
            last_service_date, next_followup_date,
            account_manager_id, account_manager_type,               // new: type + id
            secondary_account_manager_id, secondary_account_manager_type,
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

        const [existingClient] = await connection.query(
            'SELECT id FROM clients WHERE client_code = ?',
            [client_id]
        );
        if (existingClient.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: 'Client ID already exists. Please use a different code.'
            });
        }

        // Account manager (primary) – just use type and id as they are
        const account_manager_type_col = account_manager_type || null;
        const account_manager_id_col = account_manager_id || null;

        // Secondary account manager
        const secondary_account_manager_type_col = secondary_account_manager_type || null;
        const secondary_account_manager_id_col = secondary_account_manager_id || null;

        // Created by (current user)
        const currentUser = req.user;
        let created_by_type = null;
        let created_by_id = null;
        if (currentUser) {
            if (currentUser?.user_type === "Super_admin") {
                created_by_type = currentUser?.user_type;
                created_by_id = currentUser?.id;
            } else {
                created_by_type = currentUser?.user_type;
                created_by_id = currentUser?.id;
            }
        }

        // ---------- Columns list (matching new table structure) ----------
        const columns = [
            'client_code',
            'client_type',
            'company_name',
            'trading_name',
            'registration_number',
            'ntn',
            'strn',
            'website',
            'industry',
            'client_since',
            'status',
            'client_source',
            'parent_client_id',
            'language',
            'currency',
            'billing_address_line1',
            'billing_address_line2',
            'billing_city',
            'billing_state',
            'billing_postal_code',
            'billing_country',
            'payment_terms',
            'credit_limit',
            'credit_currency',
            'outstanding_balance',
            'available_credit',
            'credit_risk_rating',
            'credit_check_date',
            'credit_check_reference',
            'payment_method',
            'bank_account_details',
            'tax_exemption_certificate',
            'invoicing_delivery_method',
            'invoice_emails',
            'dunning_contact',
            'msa_reference',
            'msa_start_date',
            'msa_end_date',
            'msa_document',
            'nda_signed',
            'nda_date',
            'nda_expiry',
            'preferred_status',
            'total_lifetime_revenue',
            'number_of_quotes',
            'number_of_projects',
            'number_of_service_orders',
            'number_of_assets',
            'last_quote_date',
            'last_invoice_date',
            'last_project_date',
            'last_service_date',
            'next_followup_date',
            'account_manager_type',
            'account_manager_id',
            'secondary_account_manager_type',
            'secondary_account_manager_id',
            'internal_notes',
            'gdpr_consent_date',
            'marketing_opt_out',
            'attachments',
            'created_by_type',
            'created_by_id'
        ];

        const values = [
            client_id, client_type, company_name, trading_name, registration_number,
            ntn, strn, website, industry, client_since, status, client_source,
            parent_client, language, currency,
            billing_address_line1, billing_address_line2, billing_city, state,
            billing_postal_code, country,
            payment_terms, credit_limit, credit_currency,
            outstanding_balance || 0, available_credit || null,
            credit_risk_rating,
            credit_check_date, credit_check_reference, payment_method, bank_account_details,
            tax_exemption_certificate, invoicing_delivery_method, invoice_emails, dunning_contact,
            msa_reference, msa_start_date, msa_end_date, msa_document,
            nda_signed, nda_date, nda_expiry, preferred_status,
            total_lifetime_revenue || 0, number_of_quotes || 0, number_of_projects || 0,
            number_of_service_orders || 0, number_of_assets || 0,
            last_quote_date, last_invoice_date, last_project_date,
            last_service_date, next_followup_date,
            account_manager_type_col, account_manager_id_col,
            secondary_account_manager_type_col, secondary_account_manager_id_col,
            internal_notes, gdpr_consent_date, marketing_opt_out,
            attachmentsJSON,
            created_by_type, created_by_id
        ];

        if (columns.length !== values.length) {
            await connection.rollback();
            return res.status(500).json({ success: false, message: 'Internal error: column/value count mismatch' });
        }

        const placeholders = columns.map(() => '?').join(', ');
        const insertQuery = `INSERT INTO clients (${columns.join(', ')}) VALUES (${placeholders})`;

        const [clientResult] = await connection.query(insertQuery, values);
        const clientId = clientResult.insertId;

        let contactsArray = [];
        if (contacts) {
            try {
                const parsed = JSON.parse(contacts);
                contactsArray = parsed.filter(contact =>
                    contact.first_name?.trim() ||
                    contact.last_name?.trim() ||
                    contact.email?.trim() ||
                    contact.mobile?.trim()
                );
            } catch (e) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid contacts format' });
            }
        }
        if (contactsArray.length > 0) {
            for (const contact of contactsArray) {
                const { first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary } = contact;
                await connection.query(
                    `INSERT INTO client_contacts 
                (client_id, first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [clientId, first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary || 0]
                );
            }
        }

        let shippingArray = [];
        if (shipping_addresses) {
            try {
                const parsed = JSON.parse(shipping_addresses);
                shippingArray = parsed.filter(addr =>
                    addr.address_line1?.trim() ||
                    addr.city?.trim() ||
                    addr.country?.trim()
                );
            } catch (e) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid shipping addresses format' });
            }
        }
        if (shippingArray.length > 0) {
            for (const addr of shippingArray) {
                const { address_name, address_line1, address_line2, city, state_province,
                    postal_code, country, default_shipping, contact_person, phone_location, notes } = addr;
                await connection.query(
                    `INSERT INTO client_shipping_addresses 
                (client_id, address_name, address_line1, address_line2, city, state_province,
                 postal_code, country, default_shipping, contact_person, phone_location, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [clientId, address_name, address_line1, address_line2, city, state_province,
                        postal_code, country, default_shipping || 'No', contact_person, phone_location, notes]
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
        console.error('Error creating client:', error.message);
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

        const userId = req.user.id;
        const userType = req.user.user_type;
        const companyId = req.user.company;

        // Check if user has full access
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
                   AND p.slug = 'Client_view'
                   AND ep.assigned = 1
                 LIMIT 1`,
                [companyId, userId]
            );
            if (permRows.length > 0) hasFullAccess = true;
        }

        let whereClause = "";
        let values = [];

        if (search) {
            whereClause = `WHERE (company_name LIKE ? OR client_code LIKE ?)`;
            values = [`%${search}%`, `%${search}%`];
        } else {
            whereClause = "WHERE 1=1";
        }

        if (!hasFullAccess) {
            const userTypeValue = userType === "Super_admin" ? "Super_admin" : userType;
            whereClause += ` AND (
                (created_by_type = ? AND created_by_id = ?) OR
                (account_manager_type = ? AND account_manager_id = ?) OR
                (secondary_account_manager_type = ? AND secondary_account_manager_id = ?)
            )`;
            values.push(
                userTypeValue, userId,
                userTypeValue, userId,
                userTypeValue, userId
            );
        }

        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM clients ${whereClause}`,
            values
        );
        const total = countResult[0].total;

        const [rows] = await db.query(
            `SELECT id, client_code, company_name, trading_name, client_type, status,
                    billing_city, billing_country, tax_exemption_certificate, msa_document,
                    attachments, currency, created_at
             FROM clients
             ${whereClause}
             ORDER BY id DESC
             LIMIT ? OFFSET ?`,
            [...values, Number(limit), Number(offset)]
        );

        // ✅ Parse attachments JSON string to array
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
        console.error("Get clients paginated error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getClientById = async (req, res) => {
    try {
        const db = req.db;
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid client ID' });
        }

        // Fetch client
        const [clients] = await db.query(
            `SELECT * FROM clients WHERE id = ?`,
            [id]
        );

        if (clients.length === 0) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        const client = clients[0];

        // Parse attachments JSON
        if (client.attachments) {
            try {
                client.attachments = JSON.parse(client.attachments);
            } catch (e) {
                client.attachments = [];
            }
        } else {
            client.attachments = [];
        }

        // Fetch contacts
        const [contacts] = await db.query(
            `SELECT id, first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary
             FROM client_contacts
             WHERE client_id = ?
             ORDER BY is_primary DESC, id ASC`,
            [id]
        );

        // Fetch shipping addresses
        const [shippingAddresses] = await db.query(
            `SELECT id, address_name, address_line1, address_line2, city, state_province, postal_code, country, default_shipping, contact_person, phone_location, notes
             FROM client_shipping_addresses
             WHERE client_id = ?
             ORDER BY default_shipping DESC, id ASC`,
            [id]
        );

        // Optionally, fetch account manager names (if needed)
        // For simplicity, we return IDs and types; frontend can resolve names from its user list

        res.json({
            success: true,
            data: {
                ...client,
                contacts,
                shipping_addresses: shippingAddresses
            }
        });
    } catch (error) {
        console.error('Error getting client by ID:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateClient = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid client ID' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Fetch existing file paths (optional)
        const [existing] = await connection.query(
            'SELECT tax_exemption_certificate, msa_document, attachments FROM clients WHERE id = ?',
            [id]
        );
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        const existingFilePaths = existing[0];

        // Destructure body
        const {
            client_id, client_type, company_name, trading_name, registration_number,
            ntn, strn, website, industry, client_since, status, client_source,
            parent_client, language, currency,
            billing_address_line1, billing_address_line2, billing_city, state,
            billing_postal_code, country,
            payment_terms, credit_limit, credit_currency, credit_risk_rating,
            credit_check_date, credit_check_reference, payment_method, bank_account_details,
            invoicing_delivery_method, invoice_emails, dunning_contact,
            msa_reference, msa_start_date, msa_end_date,
            nda_signed, nda_date, nda_expiry, preferred_status,
            total_lifetime_revenue, number_of_quotes, number_of_projects,
            number_of_service_orders, number_of_assets,
            last_quote_date, last_invoice_date, last_project_date,
            last_service_date, next_followup_date,
            account_manager_id, account_manager_type,
            secondary_account_manager_id, secondary_account_manager_type,
            internal_notes, gdpr_consent_date, marketing_opt_out,
            outstanding_balance, available_credit,
            contacts,              // JSON string
            shipping_addresses     // JSON string
        } = req.body;

        // ---------- File handling ----------
        const files = req.files || {};
        const taxExemptionFile = files.tax_exemption_certificate?.[0] || null;
        const msaDocumentFile = files.msa_document?.[0] || null;
        const attachmentFiles = files.attachments || [];

        const tax_exemption_certificate = taxExemptionFile
            ? `/uploads/client_documents/${taxExemptionFile.filename}`
            : existingFilePaths.tax_exemption_certificate || null;

        const msa_document = msaDocumentFile
            ? `/uploads/client_documents/${msaDocumentFile.filename}`
            : existingFilePaths.msa_document || null;

        let attachmentsJSON = null;
        if (attachmentFiles.length > 0) {
            attachmentsJSON = JSON.stringify(attachmentFiles.map(f => `/uploads/client_documents/${f.filename}`));
        } else {
            attachmentsJSON = existingFilePaths.attachments;
        }

        // Account managers
        const account_manager_type_col = account_manager_type;
        const account_manager_id_col = account_manager_id;
        const secondary_account_manager_type_col = secondary_account_manager_type;
        const secondary_account_manager_id_col = secondary_account_manager_id;

        // Update client fields
        const updateFields = [];
        const values = [];

        const addField = (field, value) => {
            if (value !== undefined) {
                updateFields.push(`${field} = ?`);
                values.push(value);
            }
        };

        addField('client_code', client_id);
        addField('client_type', client_type);
        addField('company_name', company_name);
        addField('trading_name', trading_name);
        addField('registration_number', registration_number);
        addField('ntn', ntn);
        addField('strn', strn);
        addField('website', website);
        addField('industry', industry);
        addField('client_since', client_since);
        addField('status', status);
        addField('client_source', client_source);
        addField('parent_client_id', parent_client);
        addField('language', language);
        addField('currency', currency);
        addField('billing_address_line1', billing_address_line1);
        addField('billing_address_line2', billing_address_line2);
        addField('billing_city', billing_city);
        addField('billing_state', state);
        addField('billing_postal_code', billing_postal_code);
        addField('billing_country', country);
        addField('payment_terms', payment_terms);
        addField('credit_limit', credit_limit);
        addField('credit_currency', credit_currency);
        addField('credit_risk_rating', credit_risk_rating);
        addField('credit_check_date', credit_check_date);
        addField('credit_check_reference', credit_check_reference);
        addField('payment_method', payment_method);
        addField('bank_account_details', bank_account_details);
        addField('tax_exemption_certificate', tax_exemption_certificate);
        addField('invoicing_delivery_method', invoicing_delivery_method);
        addField('invoice_emails', invoice_emails);
        addField('dunning_contact', dunning_contact);
        addField('msa_reference', msa_reference);
        addField('msa_start_date', msa_start_date);
        addField('msa_end_date', msa_end_date);
        addField('msa_document', msa_document);
        addField('nda_signed', nda_signed);
        addField('nda_date', nda_date);
        addField('nda_expiry', nda_expiry);
        addField('preferred_status', preferred_status);
        addField('total_lifetime_revenue', total_lifetime_revenue);
        addField('number_of_quotes', number_of_quotes);
        addField('number_of_projects', number_of_projects);
        addField('number_of_service_orders', number_of_service_orders);
        addField('number_of_assets', number_of_assets);
        addField('last_quote_date', last_quote_date);
        addField('last_invoice_date', last_invoice_date);
        addField('last_project_date', last_project_date);
        addField('last_service_date', last_service_date);
        addField('next_followup_date', next_followup_date);
        addField('account_manager_type', account_manager_type_col);
        addField('account_manager_id', account_manager_id_col);
        addField('secondary_account_manager_type', secondary_account_manager_type_col);
        addField('secondary_account_manager_id', secondary_account_manager_id_col);
        addField('internal_notes', internal_notes);
        addField('gdpr_consent_date', gdpr_consent_date);
        addField('marketing_opt_out', marketing_opt_out);
        addField('outstanding_balance', outstanding_balance);
        addField('available_credit', available_credit);
        addField('attachments', attachmentsJSON);

        if (updateFields.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        updateFields.push('updated_at = NOW()');
        const updateQuery = `UPDATE clients SET ${updateFields.join(', ')} WHERE id = ?`;
        values.push(id);
        await connection.query(updateQuery, values);

        // ========== UPSERT CONTACTS (update + insert, no delete) ==========
        if (contacts) {
            let contactsArray = [];
            try {
                contactsArray = JSON.parse(contacts);
            } catch (e) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid contacts format' });
            }

            for (const contact of contactsArray) {
                const { id: contactId, first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary } = contact;
                if (contactId) {
                    // Update existing
                    await connection.query(
                        `UPDATE client_contacts SET 
                            first_name = ?, last_name = ?, job_title = ?, department = ?, 
                            email = ?, phone_direct = ?, mobile = ?, is_primary = ?
                        WHERE id = ? AND client_id = ?`,
                        [first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary || 0, contactId, id]
                    );
                } else {
                    // Insert new
                    await connection.query(
                        `INSERT INTO client_contacts 
                            (client_id, first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [id, first_name, last_name, job_title, department, email, phone_direct, mobile, is_primary]
                    );
                }
            }
        }

        // ========== UPSERT SHIPPING ADDRESSES ==========
        if (shipping_addresses) {
            let shippingArray = [];
            try {
                shippingArray = JSON.parse(shipping_addresses);
            } catch (e) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid shipping addresses format' });
            }

            for (const addr of shippingArray) {
                const { id: addrId, address_name, address_line1, address_line2, city, state_province,
                    postal_code, country, default_shipping, contact_person, phone_location, notes } = addr;
                if (addrId) {
                    // Update existing
                    await connection.query(
                        `UPDATE client_shipping_addresses SET 
                            address_name = ?, address_line1 = ?, address_line2 = ?, city = ?, state_province = ?,
                            postal_code = ?, country = ?, default_shipping = ?, contact_person = ?, phone_location = ?, notes = ?
                        WHERE id = ? AND client_id = ?`,
                        [address_name, address_line1, address_line2, city, state_province,
                            postal_code, country, default_shipping || 'No', contact_person, phone_location, notes, addrId, id]
                    );
                } else {
                    // Insert new
                    await connection.query(
                        `INSERT INTO client_shipping_addresses 
                            (client_id, address_name, address_line1, address_line2, city, state_province,
                             postal_code, country, default_shipping, contact_person, phone_location, notes)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [id, address_name, address_line1, address_line2, city, state_province,
                            postal_code, country, default_shipping, contact_person, phone_location, notes]
                    );
                }
            }
        }

        await connection.commit();

        const [updated] = await connection.query('SELECT * FROM clients WHERE id = ?', [id]);
        if (updated[0].attachments) {
            try {
                updated[0].attachments = JSON.parse(updated[0].attachments);
            } catch (e) {
                updated[0].attachments = [];
            }
        }

        res.json({
            success: true,
            message: 'Client updated successfully',
            data: updated[0]
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating client:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

const updateClientFile = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        const { id, field } = req.params;
        const files = req.files || [];
        const { index } = req.body;

        const allowedFields = ['attachments', 'msa_document', 'tax_exemption_certificate'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid field name' });
        }

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid client ID' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        let existingAttachments = null;
        if (field === 'attachments') {
            const [clientRows] = await connection.query(
                'SELECT attachments FROM clients WHERE id = ?',
                [id]
            );
            if (clientRows.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Client not found' });
            }
            if (clientRows[0].attachments) {
                try {
                    existingAttachments = JSON.parse(clientRows[0].attachments);
                } catch (e) {
                    existingAttachments = [];
                }
            } else {
                existingAttachments = [];
            }
        }

        let updateValue = null;
        if (field === 'attachments') {
            if (files.length === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            if (index === undefined || index === null) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Index is required for attachments update' });
            }

            const newFilePath = `/uploads/client_documents/${files[0].filename}`;
            if (index >= 0 && index < existingAttachments.length) {
                existingAttachments[index] = newFilePath;
            } else {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid index' });
            }
            updateValue = JSON.stringify(existingAttachments);
        } else {
            // For msa_document or tax_exemption_certificate: replace entire field
            if (files.length === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            if (files.length > 1) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Only one file allowed for this field' });
            }
            updateValue = `/uploads/client_documents/${files[0].filename}`;
        }

        await connection.query(
            `UPDATE clients SET ${field} = ? WHERE id = ?`,
            [updateValue, id]
        );

        await connection.commit();

        let responseData = updateValue;
        if (field === 'attachments' && updateValue) {
            responseData = JSON.parse(updateValue);
        }

        res.json({
            success: true,
            message: `${field} updated successfully`,
            data: { [field]: responseData }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating client file:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

const deleteClientFile = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        const { id, field } = req.params;

        const allowedFields = ['attachments', 'msa_document', 'tax_exemption_certificate'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ success: false, message: 'Invalid field name' });
        }

        if (!id || isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Invalid client ID' });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        // Fetch existing data
        const [clientRows] = await connection.query(
            `SELECT ${field} FROM clients WHERE id = ?`,
            [id]
        );
        if (clientRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        let updateValue = null;

        if (field === 'attachments') {
            // ✅ Index sirf attachments ke liye chahiye
            const { index } = req.body;
            if (index === undefined || index === null) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Index required for attachments' });
            }
            let attachmentsArray = [];
            if (clientRows[0].attachments) {
                try {
                    attachmentsArray = JSON.parse(clientRows[0].attachments);
                } catch (e) {
                    attachmentsArray = [];
                }
            }
            if (index >= 0 && index < attachmentsArray.length) {
                attachmentsArray.splice(index, 1);
                updateValue = attachmentsArray.length > 0 ? JSON.stringify(attachmentsArray) : null;
            } else {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Invalid index' });
            }
        } else {
            // ✅ MSA document ya Tax certificate: seedha null set karo
            updateValue = null;
        }

        await connection.query(
            `UPDATE clients SET ${field} = ? WHERE id = ?`,
            [updateValue, id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: `${field} deleted successfully`,
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error deleting client file:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (connection) connection.release();
    }
};

const deleteClients = async (req, res) => {
    let connection;
    try {
        const db = req.db;
        let { ids } = req.body;

        if (!ids) {
            return res.status(400).json({
                success: false,
                message: "No client IDs provided"
            });
        }
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        if (ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No client IDs provided"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const placeholders = ids.map(() => "?").join(",");
        const sql = `DELETE FROM clients WHERE id IN (${placeholders})`;

        const [result] = await connection.query(sql, ids);

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Client(s) deleted successfully",
            deletedCount: result.affectedRows
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Delete Clients Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    generateClientCode,
    createClient,
    getClientsList,
    getClientsWithPagination,
    getClientById,
    updateClient,
    updateClientFile,
    deleteClientFile,
    deleteClients
}