

require("dotenv").config();

const SaveTheme = async (req, res) => {
    // try {
    //     const db = req.db; 
    //     const owner_id = req.user.id;  
    //     const { theme_mode } = req.body;

    //     const [existingTheme] = await db.execute(
    //         `SELECT id FROM theme_settings WHERE owner_id = ?`,
    //         [owner_id]
    //     );

    //     if (existingTheme.length > 0) {
    //         await db.execute(
    //             `UPDATE theme_settings 
    //              SET theme_mode = ?, updated_at = NOW() 
    //              WHERE owner_id = ?`,
    //             [theme_mode, owner_id]
    //         );
    //     } else {
    //         await db.execute(
    //             `INSERT INTO theme_settings (owner_id, theme_mode) 
    //              VALUES (?, ?)`,
    //             [owner_id, theme_mode]
    //         );
    //     }

    //     return res.status(200).json({
    //         success: true,
    //         message: "Theme saved successfully",
    //     });
    // } catch (error) {
    //     console.log("error theme", error)
    //     return res.status(500).json({
    //         failed: true,
    //         message: "Something went wrong",
    //         error: error.message,
    //     });
    // }
};

const GetTheme = async (req, res) => {
    // try {
    //     const db = req.db; 
    //     const owner_id = req.user.id;
    //     const [rows] = await db.execute(
    //         `SELECT theme_mode FROM theme_settings WHERE owner_id = ?`,
    //         [owner_id]
    //     );

    //     if (rows.length > 0) {
    //         return res.status(200).json({
    //             success: true,
    //             theme_mode: rows[0].theme_mode
    //         });
    //     } else {
    //         return res.status(200).json({
    //             success: true,
    //             theme_mode: "dark"
    //         });
    //     }

    // } catch (error) {
    //     console.log("GetTheme Error:", error);
    //     return res.status(500).json({
    //         failed: false,
    //         message: "Something went wrong",
    //         error: error.message
    //     });
    // }
};

module.exports = { SaveTheme,GetTheme };
