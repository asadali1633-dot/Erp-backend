const config = require("./modules.config");
const db = ""

const syncModules = async (req, res) => {
  try {
    for (const moduleSlug in config) {
      // module
      await db.query(
        "INSERT IGNORE INTO modules (name, slug) VALUES (?, ?)",
        [moduleSlug, moduleSlug]
      );

      const [[moduleRow]] = await db.query(
        "SELECT id FROM modules WHERE slug = ?",
        [moduleSlug]
      );
      const moduleId = moduleRow.id;

      // fields
      for (const field of config[moduleSlug].fields) {
        await db.query(
          "INSERT IGNORE INTO module_fields (module_id, field_name) VALUES (?, ?)",
          [moduleId, field]
        );
      }

      // permissions
      for (const action of config[moduleSlug].actions) {
        await db.query(
          `INSERT IGNORE INTO permissions (module_id, action, slug)
           VALUES (?, ?, ?)`,
          [moduleId, action, `${moduleSlug}_${action}`]
        );
      }
    }

    res.json({ message: "Modules & permissions synced successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
    syncModules
}