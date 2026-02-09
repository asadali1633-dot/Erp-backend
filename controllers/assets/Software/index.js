const dbHelper = require("../../../db/dbhelper");

const CreateSoftware = async (req, res) => {
    try {
        const db = req.db; 
        const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;
        const {
            software_name,
            package_name,
            vendor_name,
            no_of_license_purchased,
            license_type,
            renewal_date_1,
            renewal_date_2,
            license_expiry,
            deployment_method,
            license_cost_per_user,
            po_number,
            record_date
        } = req.body;

        const sql = `
      INSERT INTO software (
        admin_id, software_name, package_name, vendor_name,
        no_of_license_purchased, license_type, renewal_date_1, renewal_date_2, license_expiry,
        deployment_method, license_cost_per_user, po_number, record_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        await db.execute(sql, [
            admin_id,
            software_name,
            package_name,
            vendor_name,
            no_of_license_purchased,
            license_type,
            renewal_date_1,
            renewal_date_2,
            license_expiry,
            deployment_method,
            license_cost_per_user,
            po_number,
            record_date
        ]);

        res.status(200).json({
            success: true,
            message: "Software asset added successfully",
        });
    } catch (error) {
        console.error("CreateSoftware Error:", error);
        res.status(500).json({
            failed: true,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const GetAllSoftware = async (req, res) => {
    try {
        const db = req.db; 
        const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;
        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = "WHERE admin_id = ?";
        let values = [admin_id];

        if (search) {
            whereClause += `AND (
            id = ? OR
            software_name LIKE ? OR
            package_name LIKE ? OR
            vendor_name LIKE ? OR
            license_type LIKE ?
            )
        `;
            values.push(search, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        const [countResult] = await db.execute(
            `SELECT COUNT(*) as total FROM software ${whereClause}`,
            values
        );
        const total = countResult[0].total;

        const [rows] = await db.execute(
            `
      SELECT 
        id,
        software_name,
        package_name,
        vendor_name,
        no_of_license_purchased,
        license_type,
        renewal_date_1,
        renewal_date_2,
        license_expiry,
        deployment_method,
        license_cost_per_user,
        po_number,
        record_date,
        created_at,
        updated_at
      FROM software
      ${whereClause}
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
      `,
            [...values, Number(limit), Number(offset)]
        );

        return res.status(200).json({
            success: true,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
            software: rows,
        });

    } catch (error) {
        console.error("GetAllSoftware Error:", error);
        return res.status(500).json({
            failed: true,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const GetSoftwareById = async (req, res) => {
    try {
        const db = req.db; 
        const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;
        const { id } = req.params;

        const [rows] = await db.execute(
            `
            SELECT 
                id,
                admin_id,
                software_name,
                package_name,
                vendor_name,
                no_of_license_purchased,
                license_type,
                renewal_date_1,
                renewal_date_2,
                license_expiry,
                deployment_method,
                license_cost_per_user,
                po_number,
                record_date,
                created_at,
                updated_at
            FROM software
            WHERE id = ? AND admin_id = ?
      `,
            [id, admin_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                failed: true,
                message: "Software record not found or unauthorized access",
            });
        }

        return res.status(200).json({
            success: true,
            software: rows[0],
        });
    } catch (error) {
        console.error("GetSoftwareById Error:", error);
        return res.status(500).json({
            failed: true,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const UpdateSoftware = async (req, res) => {
    try {
        const db = req.db; 
        const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;
        const { id } = req.params;

        const {
            software_name,
            package_name,
            vendor_name,
            no_of_license_purchased,
            license_type,
            renewal_date_1,
            renewal_date_2,
            license_expiry,
            deployment_method,
            license_cost_per_user,
            po_number,
            record_date,
        } = req.body;

        const [check] = await db.execute(
            `SELECT id FROM software WHERE id = ? AND admin_id = ?`,
            [id, admin_id]
        );

        if (check.length === 0) {
            return res.status(404).json({
                failed: true,
                message: "Software record not found or unauthorized access",
            });
        }

        const sql = `
      UPDATE software 
      SET
        software_name = ?,
        package_name = ?,
        vendor_name = ?,
        no_of_license_purchased = ?,
        license_type = ?,
        renewal_date_1 = ?,
        renewal_date_2 = ?,
        license_expiry = ?,
        deployment_method = ?,
        license_cost_per_user = ?,
        po_number = ?,
        record_date = ?,
        updated_at = NOW()
      WHERE id = ? AND admin_id = ?
    `;

        await db.execute(sql, [
            software_name,
            package_name,
            vendor_name,
            no_of_license_purchased,
            license_type,
            renewal_date_1,
            renewal_date_2,
            license_expiry,
            deployment_method,
            license_cost_per_user,
            po_number,
            record_date,
            id,
            admin_id,
        ]);

        return res.status(200).json({
            success: true,
            message: "Software record updated successfully",
        });
    } catch (error) {
        console.error("UpdateSoftware Error:", error);
        return res.status(500).json({
            failed: true,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const DeleteSoftware = async (req, res) => {
    try {
        const db = req.db; 
        const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;
        let { ids } = req.body;

        if (!Array.isArray(ids)) {
            ids = [ids];
        }

        if (!ids.length) {
            return res.status(400).json({
                success: false,
                message: "No software IDs provided",
            });
        }

        const placeholders = ids.map(() => "?").join(",");
        const sql = `DELETE FROM software WHERE id IN (${placeholders}) AND admin_id = ?`;

        const [result] = await db.execute(sql, [...ids, admin_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                failed: true,
                message: "No matching software found or unauthorized access",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Software record(s) deleted successfully",
        });

    } catch (error) {
        console.error("DeleteSoftware Error:", error);
        return res.status(500).json({
            failed: true,
            message: "Something went wrong",
            error: error.message,
        });
    }
};


module.exports = {
    CreateSoftware,
    GetAllSoftware,
    GetSoftwareById,
    UpdateSoftware,
    DeleteSoftware
}