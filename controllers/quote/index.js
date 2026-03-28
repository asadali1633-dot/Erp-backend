const generateQuotationNumber = async (req, res) => {
    try {
        const db = req.db;
        const { client_id } = req.body;

        if (!client_id || isNaN(client_id)) {
            return res.status(400).json({ success: false, message: 'Valid client_id is required' });
        }

        // Fetch client details including primary contact
        const [clientRows] = await db.query(
            `SELECT c.id, c.company_name,
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
                billing_address: billingAddress
            }
        });

    } catch (error) {
        console.error('Error generating quotation number:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
module.exports = {
   generateQuotationNumber
}