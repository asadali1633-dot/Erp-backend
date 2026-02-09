// tenantPools.js
const mysql = require("mysql2/promise");
const coreDb = require("./coreDb");

const tenantPools = {};

async function getTenantPool(tenant) {
  if (!tenantPools[tenant.id]) {
    tenantPools[tenant.id] = mysql.createPool({
      host: tenant.db_host,
      user: tenant.db_user,
      password: tenant.db_password,
      database: tenant.db_name,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return tenantPools[tenant.id];
}

module.exports = { getTenantPool };
