

const GetAllDesignations = async (req, res) => {
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
            `SELECT id, designation_name
                FROM designations
                WHERE company_id = ?
                ORDER BY id ASC`,
            [companyId]
        );

        return res.status(200).json({
            success: true,
            message: "Designations fetched successfully",
            designations: rows,
        });

    } catch (error) {
        console.error("GetDesignations Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};


const CreateDesignation = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const createdBy = req.user.id;
        const { designation } = req.body;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "Company ID missing in token",
            });
        }

        const [existing] = await db.execute(
            `SELECT id
                FROM designations
                WHERE designation_name = ?
                AND company_id = ?`,
            [designation, companyId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This designation already exists in this company",
            });
        }

        const [result] = await db.execute(
            `INSERT INTO designations (designation_name,company_id) VALUES (?, ?)`,
            [designation, companyId]
        );

        return res.status(201).json({
            success: true,
            message: "Designation created successfully",
            designationId: result.insertId,
        });

    } catch (error) {
        console.error("CreateDesignation Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

module.exports = {
    CreateDesignation,
    GetAllDesignations,
}
