// db/dbhelper.js
let db = null;

module.exports = {
  setDb: (tenantDb) => {
    db = tenantDb;
  },

  getDb: () => {
    if (!db) throw new Error("DB not initialized!");
    return db;
  },

  resetDb: () => {
    db = null;
  }
};
