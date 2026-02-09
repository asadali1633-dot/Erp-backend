exports.checkCompanyAccess = async (req, res, next) => {
  try {
    const db = req.db;
    const company_id = req.user.company;
    const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;
    console.log("company_id",company_id)

    if (!company_id) {
      return res.status(400).json({
        success: false,
        message: "Company ID missing"
      });
    }
    const [rows] = await db.execute(
      `SELECT *
       FROM company_admin_access
       WHERE company_id = ? AND admin_id = ?
       LIMIT 1`,
      [company_id, admin_id]
    );
    if (!rows.length) {
      return res.status(403).json({
        success: false,
        message: "No access to this company"
      });
    }
    req.company_id = company_id;
    next();
  } catch (err) {
    console.error("Company Access Error:", err);
    res.status(500).json({
      success: false,
      message: "Access check failed"
    });
  }
};
