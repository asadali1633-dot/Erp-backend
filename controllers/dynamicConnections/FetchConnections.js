const { Sequelize } = require('sequelize');

// Master DB connection (erp_core_db)
const masterDB = new Sequelize('erp_core_db', 'master_user', 'master_pass', {
  host: 'itrackspace.com',
  dialect: 'mysql',
  port: 3306,
  logging: false
});

// Function to fetch active tenants
async function fetchActiveTenants() {
  try {
    const [tenants] = await masterDB.query(
      "SELECT * FROM tenants WHERE status = 'active'"
    );

    console.log("Active tenants fetched:", tenants);
    return tenants;
  } catch (err) {
    console.error("Error fetching tenants:", err);
    return [];
  }
}

fetchActiveTenants();