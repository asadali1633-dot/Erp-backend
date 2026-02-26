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
    // try {
    //     const db = req.db; 
    //     const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;

    //     const { page = 1, limit = 10, search = "" } = req.query;
    //     const offset = (page - 1) * limit;

    //     // WHERE CLAUSE
    //     let whereClause = "WHERE h.admin_id = ?";
    //     let values = [admin_id];

    //     if (search) {
    //         whereClause +=
    //             " AND (h.id = ? OR h.name LIKE ? OR h.model LIKE ? OR h.service_tag LIKE ?)";
    //         values.push(search, `%${search}%`, `%${search}%`, `%${search}%`);
    //     }

    //     // 🔹 COUNT QUERY
    //     const [countResult] = await db.execute(
    //         `SELECT COUNT(*) AS total 
    //          FROM hardware h 
    //          ${whereClause}`,
    //         values
    //     );

    //     const total = countResult[0].total;
    //     const [rows] = await db.execute(
    //         `SELECT 
    //             h.id,
    //             h.name,
    //             h.record_date,
    //             h.asset_type,
    //             h.brand_manufacturer,
    //             h.model,
    //             h.service_tag,
    //             h.purchase_date,
    //             h.warranty_expire,
    //             h.purchase_cost,
    //             h.vendor_supplier,
    //             h.status,
    //             h.purchase_date_2,
    //             h.location,
    //             h.assigned_to_emp,
    //             h.custodian_owner,
    //             h.created_at,
    //             h.updated_at,
    //             h.brand_manufacturer AS brand_id,
    //             bm.brand_manufacturer AS brand_manufacturer,
    //             h.assigned_to_depart,
    //             d.department AS department_name,
    //             h.assigned_to_emp AS employee_id,
    //             u.first_name AS assigned_to_emp
    //         FROM hardware h
    //         LEFT JOIN brand_manufacturer bm ON h.brand_manufacturer = bm.id
    //         LEFT JOIN departments d ON h.assigned_to_depart = d.id
    //         LEFT JOIN employee_info u ON h.assigned_to_emp = u.id
    //         ${whereClause}
    //         ORDER BY h.created_at ASC
    //         LIMIT ? OFFSET ?
    //         `,
    //         [...values, Number(limit), Number(offset)]
    //     );

    //     return res.status(200).json({
    //         success: true,
    //         page: Number(page),
    //         limit: Number(limit),
    //         total,
    //         totalPages: Math.ceil(total / limit),
    //         hardware: rows
    //     });

    // } catch (error) {
    //     console.error("GetHardware Error:", error);
    //     return res.status(500).json({
    //         failed: false,
    //         message: "Something went wrong",
    //         error
    //     });
    // }
};

const UpdateHardware = async (req, res) => {
    // try {
    //      const db = req.db; 
    //      const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;

    //     const { id } = req.params;
    //     const {
    //         name,
    //         record_date,
    //         asset_type,
    //         brand_manufacturer,
    //         model,
    //         service_tag,
    //         purchase_date,
    //         warranty_expire,
    //         purchase_cost,
    //         vendor_supplier,
    //         status,
    //         assigned_to_depart,
    //         purchase_date_2,
    //         location,
    //         assigned_to_emp,
    //         custodian_owner,
    //     } = req.body;
    //     const [result] = await db.execute(
    //         `UPDATE hardware 
    //          SET name = ?, record_date = ?, asset_type = ?, brand_manufacturer = ?, model = ?, 
    //              service_tag = ?, purchase_date = ?, warranty_expire = ?, purchase_cost = ?, 
    //              vendor_supplier = ?, status = ?, assigned_to_depart = ?, purchase_date_2 = ?, 
    //              location = ?, assigned_to_emp = ?, custodian_owner = ?
    //          WHERE id = ? AND admin_id = ?`,
    //         [
    //             name,
    //             record_date,
    //             asset_type,
    //             brand_manufacturer,
    //             model,
    //             service_tag,
    //             purchase_date,
    //             warranty_expire,
    //             purchase_cost,
    //             vendor_supplier,
    //             status,
    //             assigned_to_depart,
    //             purchase_date_2,
    //             location,
    //             assigned_to_emp,
    //             custodian_owner,
    //             id,
    //             admin_id,
    //         ]
    //     );

    //     if (result.affectedRows === 0) {
    //         return res.status(404).json({
    //             failed: true,
    //             message: "No record found or unauthorized to update",
    //         });
    //     }

    //     return res.status(200).json({
    //         success: true,
    //         message: "Hardware asset updated successfully",
    //     });
    // } catch (error) {
    //     return res.status(500).json({
    //         failed: true,
    //         message: "Something went wrong",
    //         error: error.message,
    //     });
    // }
};

const GetHardwareById = async (req, res) => {
    // try {
    //      const db = req.db; 
    //    const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;
    //     const { id } = req.params;

    //     const [rows] = await db.execute(
    //         `SELECT 
    //             h.id,
    //             h.name,
    //             h.record_date,
    //             h.asset_type,
    //             h.model,
    //             h.service_tag,
    //             h.purchase_date,
    //             h.warranty_expire,
    //             h.purchase_cost,
    //             h.vendor_supplier,
    //             h.status,
    //             h.purchase_date_2,
    //             h.location,
    //             h.custodian_owner,
    //             h.brand_manufacturer AS brand_id,
    //             bm.brand_manufacturer AS brand_manufacturer,
    //             h.assigned_to_depart AS department_id,
    //             d.department AS assigned_to_depart,
    //             h.assigned_to_emp AS employee_id,
    //             u.first_name AS assigned_to_emp
    //         FROM hardware h
    //         LEFT JOIN brand_manufacturer bm ON h.brand_manufacturer = bm.id
    //         LEFT JOIN departments d ON h.assigned_to_depart = d.id
    //         LEFT JOIN employee_info u ON h.assigned_to_emp = u.id
    //         WHERE h.id = ? AND h.admin_id = ?`,
    //         [id, admin_id]
    //     );

    //     if (rows.length === 0) {
    //         return res.status(404).json({
    //             failed: true,
    //             message: "Hardware record not found or unauthorized access",
    //         });
    //     }

    //     return res.status(200).json({
    //         success: true,
    //         hardware: rows[0],
    //     });
    // } catch (error) {
    //     console.error("GetHardwareById Error:", error);
    //     return res.status(500).json({
    //         failed: true,
    //         message: "Something went wrong",
    //         error: error.message,
    //     });
    // }
};

const DeleteHardware = async (req, res) => {
    //   try {
    //      const db = req.db; 
    //     const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;
    //     let { ids } = req.body;

    //     if (!Array.isArray(ids)) {
    //       ids = [ids];
    //     }

    //     if (!ids.length) {
    //       return res.status(400).json({
    //         success: false,
    //         message: "No hardware IDs provided",
    //       });
    //     }

    //     const placeholders = ids.map(() => "?").join(",");
    //     const sql = `DELETE FROM hardware WHERE id IN (${placeholders}) AND admin_id = ?`;
    //     const [result] = await db.execute(sql, [...ids, admin_id]);
    //     if (result.affectedRows === 0) {
    //       return res.status(404).json({
    //         failed: true,
    //         message: "No matching hardware found or unauthorized access",
    //       });
    //     }

    //     return res.status(200).json({
    //       success: true,
    //       message: "Hardware record(s) deleted successfully",
    //     });
    //   } catch (error) {
    //     console.error("DeleteHardware Error:", error);
    //     return res.status(500).json({
    //       failed: true,
    //       message: "Something went wrong",
    //       error: error.message,
    //     });
    //   }
};

// BARCODE API OF ASSEST ===================
// const generateUniqueBarcode = async (req, res) => {
//     try {
//         const db = req.db; 
//         const timestamp = Date.now().toString().slice(-6);
//         const random = Math.floor(10 + Math.random() * 89);
//         const uniqueNumber = timestamp + random.toString().padStart(2, '0')
//         const finalNumber = uniqueNumber.slice(0, 6);
//         const barcode = `${finalNumber}`;

//         const [existing] = await db.query(
//             'SELECT id FROM assets WHERE asset_tag = ?',
//             [barcode]
//         );

//         if (existing.length > 0) {
//             const microtime = process.hrtime.bigint().toString().slice(-6);
//             const newBarcode = `LAP-${microtime}`;
//             return res.json({
//                 success: true,
//                 data: {
//                     barcode: newBarcode,
//                     number: microtime
//                 }
//             });
//         }
//         res.json({
//             success: true,
//             data: {
//                 barcode: barcode,
//                 number: finalNumber
//             }
//         });

//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

const generateUniqueBarcode = async (req, res) => {
    try {
        const db = req.db;
        const [result] = await db.query(
            `SELECT asset_tag FROM assets 
             WHERE asset_tag REGEXP '^[0-9]{6}$' 
             ORDER BY CAST(asset_tag AS UNSIGNED) DESC 
             LIMIT 1`
        );

        let nextNumber = 1;
        if (result.length > 0) {
            const lastBarcode = parseInt(result[0].asset_tag, 10);
            nextNumber = lastBarcode + 1;
            if (nextNumber > 999999) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum barcode limit reached (999999)'
                });
            }
        }
        const barcode = nextNumber.toString().padStart(6, '0');
        const [existing] = await db.query(
            'SELECT id FROM assets WHERE asset_tag = ?',
            [barcode]
        );

        if (existing.length > 0) {
            const timestamp = Date.now().toString().slice(-6);
            return res.json({
                success: true,
                data: {
                    barcode: timestamp,
                    number: timestamp,
                    note: 'Used timestamp as fallback'
                }
            });
        }
        res.json({
            success: true,
            data: {
                barcode: barcode,
                number: barcode,
                sequence: nextNumber
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createAssets = async (req, res) => {
    try {
        const db = req.db;
        const created_by = req.user.id;
        const {
            asset_tag,
            asset_type,
            assign_to,
            field_values,
        } = req.body;

        if (!asset_tag) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: asset_tag, name'
            });
        }

        const [existing] = await db.query(
            'SELECT id FROM assets WHERE asset_tag = ?',
            [asset_tag]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Asset tag already exists'
            });
        }

        const [category] = await db.query(
            'SELECT id, name, fields_definition FROM asset_categories WHERE name = ?',
            [asset_type]
        );

        if (category.length === 0) {
            return res.status(400).json({
                success: false,
                message: `${asset_type} category not found in database`
            });
        }

        const uploadedFiles = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                const fileInfo = {
                    filename: file.filename,
                    originalName: file.originalname,
                    path: file.path,
                    size: file.size,
                    mimetype: file.mimetype,
                    url: `/uploads/assets/${req.file.filename}`
                };
                uploadedFiles.push(fileInfo);
            });
        } else if (req.file) {
            const fileInfo = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype,
                url: `/uploads/assets/${req.file.filename}`
            };
            uploadedFiles.push(fileInfo);
        }

        if (uploadedFiles.length > 0) {
            parsedFieldValues.attachments = uploadedFiles;
            parsedFieldValues.has_attachments = true;
            parsedFieldValues.attachment_count = uploadedFiles.length;
        }

        let assigned_to_emp_id = null;
        let assigned_to_admin_id = null;
        let assignmentError = null;

        if (assign_to) {
            const [employee] = await db.query(
                'SELECT id, first_name, last_name FROM employee_info WHERE id = ?',
                [assign_to]
            );

            if (employee.length > 0) {
                assigned_to_emp_id = assign_to;
            } else {
                const [admin] = await db.query(
                    'SELECT id, first_name, last_name FROM super_admin WHERE id = ?',
                    [assign_to]
                );

                if (admin.length > 0) {
                    assigned_to_admin_id = assign_to;
                } else {
                    assignmentError = `User with ID ${assign_to} not found in employee or super admin records`;
                }
            }
        }

        const category_id = category[0].id;

        const [result] = await db.query(
            `INSERT INTO assets 
            (asset_tag, category_id, name, field_values,assigned_to_emp_id, assigned_to_admin_id) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                asset_tag,
                category_id,
                asset_type,
                JSON.stringify(field_values || {}),
                assigned_to_emp_id,
                assigned_to_admin_id
            ]
        );

        const [assets] = await db.query(
            `SELECT a.*, ac.name as category_name 
             FROM assets a
             JOIN asset_categories ac ON a.category_id = ac.id
             WHERE a.id = ?`,
            [result.insertId]
        );

        if (assets[0].field_values) {
            assets[0].field_values = JSON.parse(assets[0].field_values);
        }

        res.status(201).json({
            success: true,
            message: `${asset_type} created successfully`,
            data: {
                id: assets[0].id,
                asset_tag: assets[0].asset_tag,
                type: asset_type,
                name: assets[0].name,
                status: assets[0].status,
                details: assets[0].field_values,
                created_at: assets[0].created_at
            }
        });

    } catch (error) {
        console.error('Error creating laptop:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllAssets = async (req, res) => {
    try {
        const db = req.db;

        const [assets] = await db.query(`
            SELECT 
                a.*, 
                ac.name as category_name,
                e.id as employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.email as employee_email,
                sa.id as super_admin_id,
                CONCAT(sa.first_name, ' ', sa.last_name) as super_admin_name,
                sa.email as super_admin_email
            FROM assets a
            JOIN asset_categories ac ON a.category_id = ac.id
            LEFT JOIN employee_info e ON a.assigned_to_emp_id = e.id
            LEFT JOIN super_admin sa ON a.assigned_to_admin_id = sa.id
            ORDER BY a.created_at DESC
        `);

        assets.forEach(asset => {
            if (asset.field_values && typeof asset.field_values === 'string') {
                try {
                    asset.field_values = JSON.parse(asset.field_values);
                } catch (e) {
                    asset.field_values = {};
                }
            }
        });

        res.json({
            success: true,
            count: assets.length,
            data: assets
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAssetById = async (req, res) => {
    try {
        const db = req.db;
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid asset ID'
            });
        }

        // Simple query - sirf basic info
        const [assets] = await db.query(`
            SELECT 
                a.*, 
                ac.name as category_name
            FROM assets a
            JOIN asset_categories ac ON a.category_id = ac.id
            WHERE a.id = ?
        `, [id]);

        if (assets.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        const asset = assets[0];

        let fieldValues = {};
        if (asset.field_values && typeof asset.field_values === 'string') {
            try {
                fieldValues = JSON.parse(asset.field_values);
            } catch (e) {
                console.error('Error parsing field_values:', e);
                fieldValues = {};
            }
        }

        let assignedTo = null;
        if (asset.assigned_to_emp_id) {
            const [employee] = await db.query(
                `SELECT 
                    id, 
                    CONCAT(first_name, ' ', last_name) as name,
                    email
                FROM employee_info 
                WHERE id = ?`,
                [asset.assigned_to_emp_id]
            );

            if (employee.length > 0) {
                assignedTo = {
                    ...employee[0]
                };
            }
        }
        else if (asset.assigned_to_admin_id) {
            const [admin] = await db.query(
                `SELECT 
                    id, 
                    CONCAT(first_name, ' ', last_name) as name,
                    email
                FROM super_admin 
                WHERE id = ?`,
                [asset.assigned_to_admin_id]
            );

            if (admin.length > 0) {
                assignedTo = {
                    ...admin[0]
                };
            }
        }

        

        res.json({
            success: true,
            data: {
                id: asset.id,
                asset_tag: asset.asset_tag,
                category_id: asset.category_id,
                category_name: asset.category_name,
                name: asset.name,
                status: asset.status,
                field_values: fieldValues,
                assigned_to: assignedTo,
            }
        });

    } catch (error) {
        console.error('Error in getAssetById:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


module.exports = {
    generateUniqueBarcode,
    createAssets,
    getAllAssets,
    getAssetById
}