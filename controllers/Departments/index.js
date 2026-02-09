
const GetAllDepartments = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "Company ID missing in token",
            });
        }

        const [rows] = await db.execute(
            `SELECT id, department
                FROM departments
                WHERE company_id = ?
                ORDER BY id ASC`,
            [companyId]
        );

        return res.status(200).json({
            success: true,
            message: "Departments fetched successfully",
            departments: rows,
        });

    } catch (error) {
        console.error("GetDepartments Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const CreateDepartment = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const { department } = req.body;

        if (!companyId || !department) {
            return res.status(400).json({
                success: false,
                message: "Company ID and department are required",
            });
        }

        const [existingDepartment] = await db.execute(
            `SELECT id
                FROM departments
                WHERE department = ?
                AND company_id = ?`,
            [department, companyId]
        );

        if (existingDepartment.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This department already exists for this company",
            });
        }

        const [result] = await db.execute(
            `INSERT INTO departments (department, company_id)
                VALUES (?, ?)`,
            [department, companyId]
        );

        return res.status(201).json({
            success: true,
            message: "Department created successfully",
            departmentId: result.insertId,
        });

    } catch (error) {
        console.error("CreateDepartment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};



module.exports = {
    CreateDepartment,
    GetAllDepartments,
}