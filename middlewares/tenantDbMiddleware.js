

const mysql = require("mysql2/promise");
const coreDb = require("../db/coreDb");
const { getTenantPool } = require("../db/TenantPool");

module.exports = async (req, res, next) => {
  try {
    let tenant = null;

    if (req.user?.tenant_id) {
      const [rows] = await 
      coreDb.execute("SELECT * FROM tenants WHERE id = ? LIMIT 1", [req.user.tenant_id]);
      if (rows.length === 0) return res.status(404).json({ failed: true, message: "Tenant not found" });
      tenant = rows[0];
    } else {
      const domain = req.body?.domain;
      if (!domain) return res.status(400).json({ failed: true, message: "Tenant domain is required" });
      const [rows] = await coreDb.execute("SELECT * FROM tenants WHERE domain = ? LIMIT 1", [domain]);
      if (rows.length === 0) return res.status(404).json({ failed: true, message: "Tenant not found" });
      tenant = rows[0];
    }

    const tenantDb = await getTenantPool(tenant);
    req.db = tenantDb;
    req.tenant = tenant;
    next();
  } catch (err) {
    console.error("Tenant Middleware Error:", err);
    return res.status(500).json({ failed: true, message: "Tenant database connection failed" });
  }
};
