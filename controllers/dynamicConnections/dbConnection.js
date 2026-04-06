const { Sequelize } = require('sequelize');

function getClientDBConnection(tenant) {
  return new Sequelize(
    tenant.db_name,       // tenant ka database
    tenant.db_user,       // tenant ka username
    tenant.db_password,   // tenant ka password
    {
      host: tenant.db_host,  // tenant ka host (tenants table me)
      dialect: 'mysql',
      logging: false,
    }
  );
}

module.exports = { getClientDBConnection };