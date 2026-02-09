const { isEmployeeLevel } = require("../userType/index");



// SUPER ADMIN EDUCATION =======================

const saveSuperAdminEducation = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const superAdminId = req.user.id;
        const {
            level,
            institute_name,
            board,
            completed_year,
            city
        } = req.body;

        // 🔒 Required validation
        if (!level || !institute_name || !completed_year) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            });
        }

        // ❗ duplicate check (same level allow nahi)
        const [exists] = await db.query(
            `SELECT id FROM super_admin_education 
             WHERE company_id=? AND super_admin_id=? AND level=?`,
            [companyId, superAdminId, level]
        );

        if (exists.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Education level already exists"
            });
        }

        const certificate = req.file
            ? `/uploads/edu_certificates/${req.file.filename}`
            : null;

        // ✅ Insert
        const [result] = await db.query(
            `INSERT INTO super_admin_education
            (company_id, super_admin_id, level, institute_name, board, completed_year, city, certificate_file)
            VALUES (?,?,?,?,?,?,?,?)`,
            [
                companyId,
                superAdminId,
                level,
                institute_name,
                board,
                completed_year,
                city,
                certificate
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Super admin education saved successfully",
            id: result.insertId
        });

    } catch (error) {
        console.error("Save Super Admin Education Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getSuperAdminEducation = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const [rows] = await db.query(
            `SELECT 
                id,
                level,
                institute_name,
                board,
                completed_year,
                city,
                certificate_file,
                created_at
            FROM super_admin_education
            WHERE company_id = ? 
              AND super_admin_id = ?
            ORDER BY completed_year DESC`,
            [companyId, superAdminId]
        );

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get Super Admin Education Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getSuperAdminEducationById = async (req, res) => {
    try {
        const db = req.db;
        const educationId = req.params.id;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const [rows] = await db.query(
            `SELECT 
                id,
                level,
                institute_name,
                board,
                completed_year,
                city,
                certificate_file,
                created_at,
                updated_at
            FROM super_admin_education
            WHERE id = ?
              AND company_id = ?
              AND super_admin_id = ?
            LIMIT 1`,
            [educationId, companyId, superAdminId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Education record not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get Super Admin Education By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateSuperAdminEducation = async (req, res) => {
    try {

        const db = req.db;
        const educationId = req.params.id;
        const companyId = req.user.company;
        const superAdminId = req.user.id;
        console.log("educationId", educationId)

        const {
            level,
            institute_name,
            board,
            completed_year,
            city
        } = req.body;

        const [existing] = await db.query(
            `SELECT id FROM super_admin_education
             WHERE id = ? AND company_id = ? AND super_admin_id = ?`,
            [educationId, companyId, superAdminId]
        );

        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Education record not found"
            });
        }

        if (level) {
            const [duplicate] = await db.query(
                `SELECT id FROM super_admin_education
                 WHERE company_id = ?
                   AND super_admin_id = ?
                   AND level = ?
                   AND id != ?`,
                [companyId, superAdminId, level, educationId]
            );

            if (duplicate.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Education level already exists"
                });
            }
        }

        const certificate = req.file
            ? `/uploads/edu_certificates/${req.file.filename}`
            : null;
        await db.query(
            `UPDATE super_admin_education SET
                level = ?,
                institute_name = ?,
                board = ?,
                completed_year = ?,
                city = ?,
                certificate_file = ?
            WHERE id = ?
              AND company_id = ?
              AND super_admin_id = ?`,
            [
                level,
                institute_name,
                board,
                completed_year,
                city,
                certificate,
                educationId,
                companyId,
                superAdminId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Super admin education updated successfully"
        });

    } catch (error) {
        console.error("Update Super Admin Education Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// EMPLOYEE EDUCATION ==================

const saveEmployeeEducation = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const loginUserId = req.user.id;
        const loginUserType = req.user.user_type;
        let employeeId;

        if (loginUserType === "Super_admin" || loginUserType === "HR") {
            employeeId = req.body.user_id;
            if (!employeeId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID is required"
                });
            }
        } else {
            employeeId = loginUserId;
        }

        const {
            level,
            institute_name,
            board,
            completed_year,
            city
        } = req.body;

        const certificate = req.file
            ? `/uploads/edu_certificates/${req.file.filename}`
            : null;

        // 🔒 Validation
        if (!level || !institute_name || !completed_year) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            });
        }

        // ❗ Duplicate education level check
        const [exists] = await db.query(
            `SELECT id FROM employee_education
             WHERE company_id=? AND user_id=? AND level=?`,
            [companyId, employeeId, level]
        );

        if (exists.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Education level already exists"
            });
        }

        // ✅ INSERT
        await db.query(
            `INSERT INTO employee_education
            (company_id, user_id, level, institute_name, board, completed_year, city, certificate_file)
            VALUES (?,?,?,?,?,?,?,?)`,
            [
                companyId,
                employeeId,
                level,
                institute_name,
                board,
                completed_year,
                city,
                certificate
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Employee education saved successfully"
        });

    } catch (error) {
        console.error("Save Employee Education Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getEmployeeEducation = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const loginUserId = req.user.id;
        const loginUserType = req.user.user_type;
        let employeeId;

        if (loginUserType === "Super_admin" || loginUserType === "HR") {
            employeeId = req.params.id;
            if (!employeeId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID (user_id) is required"
                });
            }
        } else {
            employeeId = loginUserId;
        }
        const [rows] = await db.query(
            `SELECT 
                id,
                level,
                institute_name,
                board,
                completed_year,
                city,
                certificate_file,
                created_at
            FROM employee_education
            WHERE company_id = ?
              AND user_id = ?
            ORDER BY completed_year DESC`,
            [companyId, employeeId]
        );

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get Employee Education Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getEmployeeEducationById = async (req, res) => {
    try {
        const db = req.db;
        const educationId = req.params.id;
        const companyId = req.user.company;

        const [rows] = await db.query(
            `SELECT 
                id,
                user_id,
                level,
                institute_name,
                board,
                completed_year,
                city,
                certificate_file,
                created_at,
                updated_at
            FROM employee_education
            WHERE id = ? AND company_id = ?
            LIMIT 1`,
            [educationId, companyId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Education record not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get Employee Education By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateEmployeeEducation = async (req, res) => {
    try {
        const db = req.db;
        const educationId = req.params.id;
        const companyId = req.user.company;
        const { level, institute_name, board, completed_year, city } = req.body;
        const certificate = req.file ? `/uploads/edu_certificates/${req.file.filename}` : null;

        // 🔹 check record exists
        const [existingRows] = await db.query(
            `SELECT * FROM employee_education
             WHERE id = ? AND company_id = ?`,
            [educationId, companyId]
        );

        if (!existingRows.length) {
            return res.status(404).json({ success: false, message: "Education record not found" });
        }

        const existing = existingRows[0];

        // 🔹 duplicate level check
        if (level) {
            const [dup] = await db.query(
                `SELECT id FROM employee_education
                 WHERE company_id = ? AND user_id = ? AND level = ? AND id != ?`,
                [companyId, existing?.user_id, level, educationId]
            );
            if (dup.length) {
                return res.status(409).json({ success: false, message: "Education level already exists" });
            }
        }

        // 🔹 update all fields safely
        await db.query(
            `UPDATE employee_education SET
                level = ?,
                institute_name = ?,
                board = ?,
                completed_year = ?,
                city = ?,
                certificate_file = IFNULL(?, certificate_file)
             WHERE id = ? AND company_id = ?`,
            [
                level,
                institute_name,
                board,
                completed_year,
                city,
                certificate,
                educationId,
                companyId
            ]
        );

        return res.status(200).json({ success: true, message: "Employee education updated successfully" });

    } catch (error) {
        console.error("Update Employee Education Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};





module.exports = {
    saveSuperAdminEducation,
    getSuperAdminEducation,
    getSuperAdminEducationById,
    updateSuperAdminEducation,
    // ============================
    saveEmployeeEducation,
    getEmployeeEducation,
    getEmployeeEducationById,
    updateEmployeeEducation,
    // ============================
};