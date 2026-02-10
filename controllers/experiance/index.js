


const saveSuperAdminExperience = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const {
            company_name,
            industry,
            job_title,
            employment_type,
            start_date,
            end_date,
            currently_working,
            responsibilities,
            reason_for_leaving
        } = req.body;

        const document = req.file
            ? `/uploads/experience_docs/${req.file.filename}`
            : null;


        await db.query(
            `INSERT INTO super_admin_experience (
                company_id,
                super_admin_id,
                company_name,
                industry,
                job_title,
                employment_type,
                start_date,
                end_date,
                currently_working,
                responsibilities,
                reason_for_leaving,
                document_file
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                companyId,
                superAdminId,
                company_name,
                industry,
                job_title,
                employment_type,
                start_date,
                end_date || null,
                currently_working,
                responsibilities,
                reason_for_leaving,
                document
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Super admin experience added successfully"
        });

    } catch (error) {
        console.error("Add Super Admin Experience Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getSuperAdminExperience = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const [rows] = await db.query(
            `SELECT *
             FROM super_admin_experience
             WHERE company_id = ? AND super_admin_id = ?`,
            [companyId, superAdminId]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Experience not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get Super Admin Experience Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getSuperAdminExperienceById = async (req, res) => {
    try {
        const db = req.db;
        const experienceId = req.params.id;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const [rows] = await db.query(
            `SELECT *
             FROM super_admin_experience
             WHERE id = ?
               AND company_id = ?
               AND super_admin_id = ?
             LIMIT 1`,
            [experienceId, companyId, superAdminId]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Experience not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get Super Admin Experience By ID Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateSuperAdminExperience = async (req, res) => {
    try {
        const db = req.db;
        const experienceId = req.params.id;
        const companyId = req.user.company;
        const superAdminId = req.user.id;

        const {
            company_name,
            industry,
            job_title,
            employment_type,
            start_date,
            end_date,
            currently_working,
            responsibilities,
            reason_for_leaving
        } = req.body;

        const document = req.file
            ? `/uploads/experience_docs/${req.file.filename}`
            : null;


        // 🔹 update safely
        await db.query(
            `UPDATE super_admin_experience SET
                company_name = ?,
                industry = ?,
                job_title = ?,
                employment_type = ?,
                start_date = ?,
                end_date = ?,
                currently_working = ?,
                responsibilities = ?,
                reason_for_leaving = ?,
                document_file = IFNULL(?, document_file)
             WHERE id = ? AND company_id = ? AND super_admin_id = ?`,
            [
                company_name,
                industry,
                job_title,
                employment_type,
                start_date,
                end_date,
                currently_working,
                responsibilities,
                reason_for_leaving,
                document,
                experienceId,
                companyId,
                superAdminId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Super admin experience updated successfully"
        });

    } catch (error) {
        console.error("Update Super Admin Experience Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// ==============================================================

const saveEmployeeExperience = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const loginUserId = req.user.id;
        const loginUserType = req.user.user_type;

        let employeeId;

        // 🔐 role based
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
            company_name,
            industry,
            job_title,
            employment_type,
            start_date,
            end_date,
            currently_working,
            responsibilities,
            reason_for_leaving
        } = req.body;

        const document = req.file
            ? `/uploads/experience_documents/${req.file.filename}`
            : null;

        // ✅ insert
        await db.query(
            `INSERT INTO employee_experience
            (company_id, user_id, company_name, industry, job_title, employment_type,
             start_date, end_date, currently_working, responsibilities, reason_for_leaving, document_file)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                companyId,
                employeeId,
                company_name,
                industry,
                job_title,
                employment_type,
                start_date,
                end_date || null,
                currently_working,
                responsibilities,
                reason_for_leaving,
                document
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Employee experience saved successfully"
        });

    } catch (error) {
        console.error("Save Employee Experience Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getEmployeeExperience = async (req, res) => {
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
                    message: "Employee ID is required"
                });
            }
        } else {
            employeeId = loginUserId;
        }

        const [rows] = await db.query(
            `SELECT *
             FROM employee_experience
             WHERE company_id = ? AND user_id = ?
             ORDER BY start_date DESC`,
            [companyId, employeeId]
        );

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get Employee Experience Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const getEmployeeExperienceById = async (req, res) => {
    try {
        const db = req.db;
        const experienceId = req.params.id;
        const companyId = req.user.company;

        const [rows] = await db.query(
            `SELECT *
             FROM employee_experience
             WHERE id = ? AND company_id = ?
             LIMIT 1`,
            [experienceId, companyId]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Experience not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get Employee Experience By ID Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateEmployeeExperience = async (req, res) => {
    try {
        const db = req.db;
        const experienceId = req.params.id;
        const companyId = req.user.company;

        const {
            company_name,
            industry,
            job_title,
            employment_type,
            start_date,
            end_date,
            currently_working,
            responsibilities,
            reason_for_leaving
        } = req.body;

        const document = req.file
            ? `/uploads/experience_documents/${req.file.filename}`
            : null;

        // 🔹 check exists
        const [existingRows] = await db.query(
            `SELECT * FROM employee_experience
             WHERE id = ? AND company_id = ?`,
            [experienceId, companyId]
        );

        if (!existingRows.length) {
            return res.status(404).json({
                success: false,
                message: "Experience not found"
            });
        }

        const existing = existingRows[0];


        // 🔹 update
        await db.query(
            `UPDATE employee_experience SET
                company_name = ?,
                industry = ?,
                job_title = ?,
                employment_type = ?,
                start_date = ?,
                end_date = ?,
                currently_working = ?,
                responsibilities = ?,
                reason_for_leaving = ?,
                document_file = IFNULL(?, document_file)
             WHERE id = ? AND company_id = ?`,
            [
                company_name,
                industry,
                job_title,
                employment_type,
                start_date,
                end_date,
                currently_working,
                responsibilities,
                reason_for_leaving,
                document,
                experienceId,
                companyId
            ]
        );

        return res.status(200).json({
            success: true,
            message: "Employee experience updated successfully"
        });

    } catch (error) {
        console.error("Update Employee Experience Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};











module.exports = {
  saveSuperAdminExperience,
  getSuperAdminExperience,
  getSuperAdminExperienceById,
  updateSuperAdminExperience,
//========================
saveEmployeeExperience,
getEmployeeExperience,
getEmployeeExperienceById,
updateEmployeeExperience
};