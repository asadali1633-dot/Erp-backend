
exports.checkPermission = (permissionSlug) => {
  return async (req, res, next) => {
    try {
      const db = req.db;
      const employeeId = req.user.id;
      const companyId = req.user.company;
      const userType = req.user.user_type;
      if (userType === "Super_admin") {
        return next();
      }

      const [rows] = await db.query(
        `SELECT 1
         FROM employee_permissions ep
         INNER JOIN permissions p ON p.id = ep.permission_id
         WHERE ep.company_id = ?
           AND ep.employee_id = ?
           AND p.slug = ?
           AND ep.assigned = 1
         LIMIT 1`,
        [companyId, employeeId, permissionSlug]
      );

      if (!rows.length) {
        return res.status(403).json({
          success: false,
          message: "Permission Denied"
        });
      }

      next();
    } catch (err) {
      console.error("checkPermission error:", err);
      res.status(500).json({
        success: false,
        message: "Something went wrong."
      });
    }
  };
};
