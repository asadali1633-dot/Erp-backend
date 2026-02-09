const coreDb = require('../../db/coreDb')

const createNewTenant = async ({
  company_name,
  db_name,
  db_user,
  db_password,
  domain
}) => {
  const tenant_code = `TEN-${Date.now()}`; // ✅ unique

  const [result] = await coreDb.execute(
    `INSERT INTO tenants
     (tenant_code, company_name, db_name, db_host, db_user, db_password, status, domain)
     VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,
    [
      tenant_code,
      company_name,
      db_name,
      "localhost",
      db_user,
      db_password,
      domain
    ]
  );

  return result.insertId;
};

module.exports = {createNewTenant};
