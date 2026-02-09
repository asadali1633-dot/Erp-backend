



const CreateRoles = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const createdBy = req.user.id;

        const { roles } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "Company ID missing in token",
            });
        }

        const [existing] = await db.execute(
            `SELECT id
                FROM roles
                WHERE role_name = ?
                AND company_id = ?`,
            [roles, companyId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This role already exists in this company",
            });
        }

        const [result] = await db.execute(
            `INSERT INTO roles (role_name,company_id) VALUES (?, ?)`,
            [roles, companyId]
        );

        return res.status(201).json({
            success: true,
            message: "Role created successfully",
            roleId: result.insertId,
        });

    } catch (error) {
        console.error("CreateRole Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};


const GetAllRoles = async (req, res) => {
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
            `SELECT id, role_name
       FROM roles
       WHERE company_id = ?
       ORDER BY id ASC`,
            [companyId]
        );

        return res.status(200).json({
            success: true,
            message: "Roles fetched successfully",
            roles: rows,
        });

    } catch (error) {
        console.error("GetRoles Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};



module.exports = {
    CreateRoles,
    GetAllRoles,
}