

const saveSuperAdminQualification = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const {
            certification_no,
            institute_name,
            completed_date,
            city
        } = req.body;

        const certificate = req.file
            ? `/uploads/qua_certificates/${req.file.filename}`
            : null;

        // 🔁 duplicate check
        const [dup] = await db.query(
            `SELECT id FROM super_admin_qualification
             WHERE company_id = ? AND super_admin_id = ? AND certification_no = ?`,
            [companyId, superAdminId, certification_no]
        );

        if (dup.length) {
            return res.status(409).json({
                success: false,
                message: "Certification already exists"
            });
        }

        await db.query(
            `INSERT INTO super_admin_qualification
            (company_id, super_admin_id, certification_no, institute_name, completed_date, city, certificate_file)
            VALUES (?,?,?,?,?,?,?)`,
            [
                companyId,
                superAdminId,
                certification_no,
                institute_name,
                completed_date,
                city,
                certificate
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Qualification added successfully"
        });

    } catch (error) {
        console.error("Add Super Admin Qualification Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getSuperAdminQualifications = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const [rows] = await db.query(
            `SELECT *
             FROM super_admin_qualification
             WHERE company_id = ? AND super_admin_id = ?
             ORDER BY completed_date DESC`,
            [companyId, superAdminId]
        );

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get Super Admin Qualifications Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getSuperAdminQualificationById = async (req, res) => {
    try {
        const db = req.db;
        const qualificationId = req.params.id;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const [rows] = await db.query(
            `SELECT *
             FROM super_admin_qualification
             WHERE id = ? AND company_id = ? AND super_admin_id = ?
             LIMIT 1`,
            [qualificationId, companyId, superAdminId]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Qualification not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get Super Admin Qualification By ID Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateSuperAdminQualification = async (req, res) => {
    try {
        const db = req.db;
        const qualificationId = req.params.id;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const {
            certification_no,
            institute_name,
            completed_date,
            city
        } = req.body;

        const certificate = req.file
            ? `/uploads/qua_certificates/${req.file.filename}`
            : null;

        const [existingRows] = await db.query(
            `SELECT * FROM super_admin_qualification
             WHERE id = ? AND company_id = ? AND super_admin_id = ?`,
            [qualificationId, companyId, superAdminId]
        );

        if (!existingRows.length) {
            return res.status(404).json({
                success: false,
                message: "Qualification not found"
            });
        }

        const existing = existingRows[0];

        // 🔁 duplicate certification check
        if (certification_no) {
            const [dup] = await db.query(
                `SELECT id FROM super_admin_qualification
                 WHERE company_id = ? AND super_admin_id = ?
                 AND certification_no = ? AND id != ?`,
                [companyId, superAdminId, certification_no, qualificationId]
            );

            if (dup.length) {
                return res.status(409).json({
                    success: false,
                    message: "Certification already exists"
                });
            }
        }

        await db.query(
            `UPDATE super_admin_qualification SET
                certification_no = ?,
                institute_name = ?,
                completed_date = ?,
                city = ?,
                certificate_file = IFNULL(?, certificate_file)
             WHERE id = ? AND company_id = ? AND super_admin_id = ?`,
            [
                certification_no,
                institute_name,
                completed_date,
                city,
                certificate,
                qualificationId,
                companyId,
                superAdminId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Qualification updated successfully"
        });

    } catch (error) {
        console.error("Update Super Admin Qualification Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==================================================================

const saveEmployeeQualification = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const loginUserId = req.user.id;
        const loginUserType = req.user.user_type;

        let employeeId;

        // 🔐 role-based employee selection
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
            certification_no,
            institute_name,
            completed_date,
            city
        } = req.body;

        const certificate = req.file
            ? `/uploads/qualification_certificates/${req.file.filename}`
            : null;

        // 🔒 Validation
        if (!certification_no || !institute_name || !completed_date) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing"
            });
        }

        // ❗ Duplicate certification check
        const [exists] = await db.query(
            `SELECT id FROM employee_qualification
             WHERE company_id = ? AND user_id = ? AND certification_no = ?`,
            [companyId, employeeId, certification_no]
        );

        if (exists.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Certification already exists"
            });
        }

        // ✅ INSERT
        await db.query(
            `INSERT INTO employee_qualification
            (company_id, user_id, certification_no, institute_name, completed_date, city, certificate_file)
            VALUES (?,?,?,?,?,?,?)`,
            [
                companyId,
                employeeId,
                certification_no,
                institute_name,
                completed_date,
                city,
                certificate
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Employee qualification saved successfully"
        });

    } catch (error) {
        console.error("Save Employee Qualification Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getEmployeeQualification = async (req, res) => {
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
                certification_no,
                institute_name,
                completed_date,
                city,
                certificate_file,
                created_at
            FROM employee_qualification
            WHERE company_id = ?
              AND user_id = ?
            ORDER BY completed_date DESC`,
            [companyId, employeeId]
        );

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get Employee Qualification Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getEmployeeQualificationById = async (req, res) => {
    try {
        const db = req.db;
        const qualificationId = req.params.id;
        const companyId = req.user.company;

        const [rows] = await db.query(
            `SELECT
                id,
                user_id,
                certification_no,
                institute_name,
                completed_date,
                city,
                certificate_file,
                created_at,
                updated_at
            FROM employee_qualification
            WHERE id = ? AND company_id = ?
            LIMIT 1`,
            [qualificationId, companyId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Qualification record not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get Employee Qualification By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateEmployeeQualification = async (req, res) => {
    try {
        const db = req.db;
        const qualificationId = req.params.id;
        const companyId = req.user.company;

        const {
            certification_no,
            institute_name,
            completed_date,
            city
        } = req.body;
        console.log("certification_no",certification_no)

        const certificate = req.file
            ? `/uploads/qualification_certificates/${req.file.filename}`
            : null;

        // 🔹 check record exists
        const [existingRows] = await db.query(
            `SELECT * FROM employee_qualification
             WHERE id = ? AND company_id = ?`,
            [qualificationId, companyId]
        );

        if (!existingRows.length) {
            return res.status(404).json({
                success: false,
                message: "Qualification record not found"
            });
        }

        const existing = existingRows[0];

        // 🔹 duplicate certification check
        if (certification_no) {
            const [dup] = await db.query(
                `SELECT id FROM employee_qualification
                 WHERE company_id = ?
                   AND user_id = ?
                   AND certification_no = ?
                   AND id != ?`,
                [companyId, existing.user_id, certification_no, qualificationId]
            );

            if (dup.length) {
                return res.status(409).json({
                    success: false,
                    message: "Certification already exists"
                });
            }
        }

        // 🔹 update all fields safely
        await db.query(
            `UPDATE employee_qualification SET
                certification_no = ?,
                institute_name = ?,
                completed_date = ?,
                city = ?,
                certificate_file = IFNULL(?, certificate_file)
             WHERE id = ? AND company_id = ?`,
            [
                certification_no,
                institute_name,
                completed_date,
                city,
                certificate,
                qualificationId,
                companyId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Employee qualification updated successfully"
        });

    } catch (error) {
        console.error("Update Employee Qualification Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};







module.exports = {
    saveSuperAdminQualification,
    getSuperAdminQualifications,
    getSuperAdminQualificationById,
    updateSuperAdminQualification,
    // ============================
    saveEmployeeQualification,
    getEmployeeQualification,
    getEmployeeQualificationById,
    updateEmployeeQualification
    // ============================
};
