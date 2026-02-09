const mysql = require('mysql2/promise');
const core = mysql
  .createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "erp_core_db",
  })

module.exports = core;

