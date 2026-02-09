
const getAdminEmployeesPermissions = async (req, res) => {
  try {
    const db = req.db; 
    const companyId = req.user.company;
    const { page = 1, limit = 5, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE ei.company_id = ?";
    let values = [companyId];

    if (search) {
      whereClause += `
        AND (
          ei.emp_id = ?
          OR ei.first_name LIKE ?
          OR ei.last_name LIKE ?
          OR ei.email LIKE ?
        )
      `;
      values.push(search, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 🔹 count
    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total FROM employee_info ei ${whereClause}`,
      values
    );

    const total = countRow.total;
    if (!total) return res.json({ success: true, employees: [], total });

    // 🔹 employees
    const [employees] = await db.query(
      `SELECT 
        ei.id,
        ei.emp_id,
        ei.first_name,
        ei.last_name,
        ei.email,
        ei.gender,
        r.id AS role_id,
        r.role_name,
        d.id AS department_id,
        d.department AS department_name,
        dg.id AS designation_id,
        dg.designation_name
      FROM employee_info ei
      LEFT JOIN roles r ON r.id = ei.role
      LEFT JOIN departments d ON d.id = ei.department
      LEFT JOIN designations dg ON dg.id = ei.designation
      ${whereClause}
      ORDER BY ei.created_at DESC
      LIMIT ? OFFSET ?`,
      [...values, Number(limit), Number(offset)]
    );

    const employeeIds = employees.map(e => e.id);
    if (!employeeIds.length) return res.json({ success: true, employees: [], total });

    const placeholders = employeeIds.map(() => "?").join(",");

    // 🔹 permissions + fields (company_id based)
    const [rows] = await db.query(
      `SELECT 
        ei.id AS employee_id,
        m.id   AS module_id,
        m.name AS module_name,
        m.slug AS module_slug,
        p.id     AS permission_id,
        p.action AS permission_action,
        p.slug   AS permission_slug,
        IFNULL(ep.assigned, 0) AS assigned,
        mf.id AS field_id,
        mf.field_name,
        IFNULL(efp.can_view, 0) AS can_view,
        IFNULL(efp.can_edit, 0) AS can_edit
      FROM employee_info ei
      CROSS JOIN modules m
      LEFT JOIN permissions p ON p.module_id = m.id
      LEFT JOIN employee_permissions ep
        ON ep.permission_id = p.id
       AND ep.employee_id = ei.id
       AND ep.company_id = ?
      LEFT JOIN module_fields mf ON mf.module_id = m.id
      LEFT JOIN employee_field_permissions efp
        ON efp.module_field_id = mf.id
       AND efp.employee_id = ei.id
       AND efp.company_id = ?
      WHERE ei.id IN (${placeholders})
      ORDER BY ei.id, m.id, p.id, mf.id`,
      [companyId, companyId, ...employeeIds]
    );

    // 🔹 format
    const formatted = {};
    employees.forEach(emp => {
      formatted[emp.id] = {
        id: emp.id,
        emp_id: emp.emp_id,
        name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        gender: emp.gender,
        role: { id: emp.role_id, name: emp.role_name },
        department: { id: emp.department_id, name: emp.department_name },
        designation: { id: emp.designation_id, name: emp.designation_name },
        modules: {}
      };
    });

    rows.forEach(row => {
      const emp = formatted[row.employee_id];
      if (!emp) return;

      if (!emp.modules[row.module_slug]) {
        emp.modules[row.module_slug] = {
          id: row.module_id,
          name: row.module_name,
          slug: row.module_slug,
          permissions: [],
          fields: []
        };
      }

      const module = emp.modules[row.module_slug];

      // permissions
      if (row.permission_id) {
        if (!module.permissions.some(p => p.id === row.permission_id)) {
          module.permissions.push({
            id: row.permission_id,
            action: row.permission_action,
            slug: row.permission_slug,
            assigned: row.assigned === 1
          });
        }
      }

      // fields
      if (row.field_id) {
        if (!module.fields.some(f => f.id === row.field_id)) {
          module.fields.push({
            id: row.field_id,
            name: row.field_name,
            can_view: row.can_view === 1,
            can_edit: row.can_edit === 1
          });
        }
      }
    });

    res.json({
      success: true,
      employees: Object.values(formatted).map(e => ({
        ...e,
        modules: Object.values(e.modules)
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


const saveEmployeePermissions = async (req, res) => {
  try {
    const db = req.db; 
    const companyId = req.user.company;
    const { employeeId, permissions } = req.body;

    const [existing] = await db.query(
      `SELECT permission_id FROM employee_permissions
       WHERE employee_id = ? AND company_id = ?`,
      [employeeId, companyId]
    );

    const existingIds = existing.map(e => e.permission_id);

    // update
    for (const p of permissions.filter(p => existingIds.includes(p.permission_id))) {
      await db.query(
        `UPDATE employee_permissions
         SET assigned = ?
         WHERE employee_id = ? AND permission_id = ? AND company_id = ?`,
        [p.assigned ? 1 : 0, employeeId, p.permission_id, companyId]
      );
    }

    // insert
    const toInsert = permissions.filter(p => !existingIds.includes(p.permission_id));
    if (toInsert.length) {
      const values = toInsert.map(p => [
        employeeId,
        p.permission_id,
        companyId,
        p.assigned ? 1 : 0
      ]);
      const placeholders = values.map(() => "(?,?,?,?)").join(",");
      await db.query(
        `INSERT INTO employee_permissions (employee_id, permission_id, company_id, assigned)
         VALUES ${placeholders}`,
        values.flat()
      );
    }

    res.json({ success: true, message: "Permissions saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAdminEmployeesPermissions,
  saveEmployeePermissions
};


// const saveEmployeePermissions = async (req, res) => {
//   try {
//     const db = req.db; 
//     const adminId = req.user.admin_id ?? req.user.id;
//     const { employeeId, permissions } = req.body;

//     const [existing] = await db.query(
//       `SELECT permission_id FROM employee_permissions
//        WHERE employee_id = ? AND admin_id = ?`,
//       [employeeId, adminId]
//     );

//     const existingIds = existing.map(e => e.permission_id);

//     // update
//     for (const p of permissions.filter(p => existingIds.includes(p.permission_id))) {
//       await db.query(
//         `UPDATE employee_permissions
//          SET assigned = ?
//          WHERE employee_id = ? AND permission_id = ? AND admin_id = ?`,
//         [p.assigned ? 1 : 0, employeeId, p.permission_id, adminId]
//       );
//     }

//     // insert
//     const toInsert = permissions.filter(p => !existingIds.includes(p.permission_id));
//     if (toInsert.length) {
//       const values = toInsert.map(p => [
//         employeeId,
//         p.permission_id,
//         adminId,
//         p.assigned ? 1 : 0
//       ]);
//       const placeholders = values.map(() => "(?,?,?,?)").join(",");
//       await db.query(
//         `INSERT INTO employee_permissions (employee_id, permission_id, admin_id, assigned)
//          VALUES ${placeholders}`,
//         values.flat()
//       );
//     }

//     res.json({ success: true, message: "Permissions saved" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// module.exports = {
//   getAdminEmployeesPermissions,
//   saveEmployeePermissions
// }
