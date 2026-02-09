
const CreateBrand = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;
        const { brand, brand_manufacturer } = req.body;

        const brandName = brand_manufacturer || brand;

        if (!companyId || !brandName) {
            return res.status(400).json({
                success: false,
                message: "Company ID and Brand name are required"
            });
        }

        const [existingBrand] = await db.execute(
            `SELECT id
                FROM brand_manufacturer
                WHERE brand_manufacturer = ?
                AND company_id = ?`,
            [brandName, companyId]
        );

        if (existingBrand.length > 0) {
            return res.status(400).json({
                success: false,
                message: "This brand already exists for this company",
            });
        }

        const [result] = await db.execute(
            `INSERT INTO brand_manufacturer (company_id, brand_manufacturer)
            VALUES (?, ?)`,
            [companyId, brandName]
        );

        return res.status(201).json({
            success: true,
            message: "Brand created successfully",
            brandId: result.insertId,
        });

    } catch (error) {
        console.error("CreateBrand Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

const GetAllBrandsManufacturer = async (req, res) => {
    try {
        const db = req.db;
        const companyId = req.user.company;

        if (!companyId) {
            return res.status(400).json({
                success: false,
                message: "Company ID missing in token"
            });
        }

        const [rows] = await db.execute(
            `SELECT id, brand_manufacturer
            FROM brand_manufacturer
            WHERE company_id = ?
            ORDER BY id ASC`,
            [companyId]
        );

        return res.status(200).json({
            success: true,
            brands: rows,
        });

    } catch (error) {
        console.error("GetAllBrands Error:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};



module.exports = {
    GetAllBrandsManufacturer,
    CreateBrand,
}