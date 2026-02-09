const dbHelper = require("../../../db/dbhelper");


const CreateHardware = async (req, res) => {
    try {
   const db = req.db; 
      const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;

        const {
            name,
            record_date,
            asset_type,
            brand_manufacturer,
            model,
            service_tag,
            purchase_date,
            warranty_expire,
            purchase_cost,
            vendor_supplier,
            status,
            assigned_to_depart,
            purchase_date_2,
            location,
            assigned_to_emp,
            custodian_owner,
        } = req.body;

        const [result] = await db.execute(
            `INSERT INTO hardware 
                (admin_id, name, record_date, asset_type, brand_manufacturer, model, service_tag, 
                purchase_date, warranty_expire, purchase_cost, vendor_supplier, status, 
                assigned_to_depart, purchase_date_2, location, assigned_to_emp, custodian_owner)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                admin_id,
                name,
                record_date,
                asset_type,
                brand_manufacturer,
                model,
                service_tag,
                purchase_date,
                warranty_expire,
                purchase_cost,
                vendor_supplier,
                status,
                assigned_to_depart,
                purchase_date_2,
                location,
                assigned_to_emp,
                custodian_owner,
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Hardware asset created successfully",
            hardwareId: result.insertId,
        });
    } catch (error) {
        console.error("CreateHardware Error:", error);
        return res.status(500).json({
            failed: false,
            message: "Something went wrong",
            error,
        });
    }
};

const GetAllHardware = async (req, res) => {
    try {
        const db = req.db; 
        const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;

        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * limit;

        // WHERE CLAUSE
        let whereClause = "WHERE h.admin_id = ?";
        let values = [admin_id];

        if (search) {
            whereClause +=
                " AND (h.id = ? OR h.name LIKE ? OR h.model LIKE ? OR h.service_tag LIKE ?)";
            values.push(search, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        // 🔹 COUNT QUERY
        const [countResult] = await db.execute(
            `SELECT COUNT(*) AS total 
             FROM hardware h 
             ${whereClause}`,
            values
        );

        const total = countResult[0].total;
        const [rows] = await db.execute(
            `SELECT 
                h.id,
                h.name,
                h.record_date,
                h.asset_type,
                h.brand_manufacturer,
                h.model,
                h.service_tag,
                h.purchase_date,
                h.warranty_expire,
                h.purchase_cost,
                h.vendor_supplier,
                h.status,
                h.purchase_date_2,
                h.location,
                h.assigned_to_emp,
                h.custodian_owner,
                h.created_at,
                h.updated_at,
                h.brand_manufacturer AS brand_id,
                bm.brand_manufacturer AS brand_manufacturer,
                h.assigned_to_depart,
                d.department AS department_name,
                h.assigned_to_emp AS employee_id,
                u.first_name AS assigned_to_emp
            FROM hardware h
            LEFT JOIN brand_manufacturer bm ON h.brand_manufacturer = bm.id
            LEFT JOIN departments d ON h.assigned_to_depart = d.id
            LEFT JOIN employee_info u ON h.assigned_to_emp = u.id
            ${whereClause}
            ORDER BY h.created_at ASC
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
            hardware: rows
        });

    } catch (error) {
        console.error("GetHardware Error:", error);
        return res.status(500).json({
            failed: false,
            message: "Something went wrong",
            error
        });
    }
};

const UpdateHardware = async (req, res) => {
    try {
         const db = req.db; 
         const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;

        const { id } = req.params;
        const {
            name,
            record_date,
            asset_type,
            brand_manufacturer,
            model,
            service_tag,
            purchase_date,
            warranty_expire,
            purchase_cost,
            vendor_supplier,
            status,
            assigned_to_depart,
            purchase_date_2,
            location,
            assigned_to_emp,
            custodian_owner,
        } = req.body;
        const [result] = await db.execute(
            `UPDATE hardware 
             SET name = ?, record_date = ?, asset_type = ?, brand_manufacturer = ?, model = ?, 
                 service_tag = ?, purchase_date = ?, warranty_expire = ?, purchase_cost = ?, 
                 vendor_supplier = ?, status = ?, assigned_to_depart = ?, purchase_date_2 = ?, 
                 location = ?, assigned_to_emp = ?, custodian_owner = ?
             WHERE id = ? AND admin_id = ?`,
            [
                name,
                record_date,
                asset_type,
                brand_manufacturer,
                model,
                service_tag,
                purchase_date,
                warranty_expire,
                purchase_cost,
                vendor_supplier,
                status,
                assigned_to_depart,
                purchase_date_2,
                location,
                assigned_to_emp,
                custodian_owner,
                id,
                admin_id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                failed: true,
                message: "No record found or unauthorized to update",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Hardware asset updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            failed: true,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const GetHardwareById = async (req, res) => {
    try {
         const db = req.db; 
       const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;
        const { id } = req.params;

        const [rows] = await db.execute(
            `SELECT 
                h.id,
                h.name,
                h.record_date,
                h.asset_type,
                h.model,
                h.service_tag,
                h.purchase_date,
                h.warranty_expire,
                h.purchase_cost,
                h.vendor_supplier,
                h.status,
                h.purchase_date_2,
                h.location,
                h.custodian_owner,
                h.brand_manufacturer AS brand_id,
                bm.brand_manufacturer AS brand_manufacturer,
                h.assigned_to_depart AS department_id,
                d.department AS assigned_to_depart,
                h.assigned_to_emp AS employee_id,
                u.first_name AS assigned_to_emp
            FROM hardware h
            LEFT JOIN brand_manufacturer bm ON h.brand_manufacturer = bm.id
            LEFT JOIN departments d ON h.assigned_to_depart = d.id
            LEFT JOIN employee_info u ON h.assigned_to_emp = u.id
            WHERE h.id = ? AND h.admin_id = ?`,
            [id, admin_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                failed: true,
                message: "Hardware record not found or unauthorized access",
            });
        }

        return res.status(200).json({
            success: true,
            hardware: rows[0],
        });
    } catch (error) {
        console.error("GetHardwareById Error:", error);
        return res.status(500).json({
            failed: true,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const DeleteHardware = async (req, res) => {
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
        message: "No hardware IDs provided",
      });
    }

    const placeholders = ids.map(() => "?").join(",");
    const sql = `DELETE FROM hardware WHERE id IN (${placeholders}) AND admin_id = ?`;
    const [result] = await db.execute(sql, [...ids, admin_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        failed: true,
        message: "No matching hardware found or unauthorized access",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hardware record(s) deleted successfully",
    });
  } catch (error) {
    console.error("DeleteHardware Error:", error);
    return res.status(500).json({
      failed: true,
      message: "Something went wrong",
      error: error.message,
    });
  }
};



module.exports = {
    CreateHardware,
    GetAllHardware,
    UpdateHardware,
    GetHardwareById,
    DeleteHardware
}