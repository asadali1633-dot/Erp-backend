

const GetUser = async (req, res) => {
  try {
    const db = req.db;
    const userId = req.user.id;
    const userType = req.user.user_type;
    const companyId = req.user.company;
    let userData = null;
    let permissions = [];
    
    if (userType !== "Super_admin") {
      const [rows] = await db.execute(
        `SELECT 
          ei.id,
          CONCAT(ei.first_name, ' ', ei.last_name) AS name,
          ei.email,
          ei.role,
          ei.user_type,
          ei.mobile_number AS phone,
          ei.designation,
          ei.department,
          ei.created_at,
          ei.profile_image,
          ei.full_address,
          ei.date_of_birth
        FROM employee_info ei
        WHERE ei.id = ?
          AND ei.company_id = ?`,
        [userId, companyId]
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Employee not found"
        });
      }

      userData = rows[0];
      const [permissionRows] = await db.execute(
        `SELECT DISTINCT p.slug
         FROM employee_permissions ep
         INNER JOIN permissions p ON p.id = ep.permission_id
         WHERE ep.employee_id = ?
           AND ep.company_id = ?
           AND ep.assigned = 1`,
        [userId, companyId]
      );

      permissions = permissionRows.map(p => p.slug);
    }

    /* ================= SUPER ADMIN ================= */
    else {
      const [rows] = await db.execute(
        `SELECT 
          a.id,
          CONCAT(a.first_name, ' ', a.last_name) AS name,
          a.email,
          a.user_type,
          a.profile_image,
          a.full_address,
          a.role,
          a.designation,
          a.department,
          a.date_of_birth,
          a.created_at
        FROM super_admin a
        WHERE a.id = ?`,
        [userId]
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Admin not found"
        });
      }

      userData = {
        ...rows[0],
        phone: null
      };

      // Super admin = all permissions
      const [permissionRows] = await db.execute(
        `SELECT slug FROM permissions`
      );
      permissions = permissionRows.map(p => p.slug);
    }


    const [companyRows] = await db.execute(
      `SELECT phone, business_id, domain
       FROM companies
       WHERE id = ?
       LIMIT 1`,
      [companyId]
    );

    const company = companyRows[0] || {};
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: {
        ...userData,
        permissions,
        company_phone: company.phone || null,
        business_id: company.business_id || null,
        domain: company.domain || null
      }
    });

  } catch (err) {
    console.error("GetUser Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
};

const GetCompanyByAdmin = async (req, res) => {
  try {
    const db = req.db;
    const companyId = req.user.company

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID missing in token"
      });
    }

    const [companyRows] = await db.execute(
      `SELECT 
        id,
        domain,
        company,
        phone,
        address,
        zipcode,
        business_id,
        whatsapp_no,
        website_url,
        image,
        brief_note,
        created_at,
        modified_date
       FROM companies
       WHERE id = ?
       LIMIT 1`,
      [companyId]
    );

    return res.status(200).json({
      success: true,
      company: companyRows.length ? companyRows[0] : null
    });

  } catch (err) {
    console.error("GetCompany Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message
    });
  }
};

const UpdateCompany = async (req, res) => {
  try {
    const db = req.db;
    const userId = req.user.company
    const {
      phone = null,
      whatsapp_no = null,
      website_url = null,
      address = null,
      zipcode = null,
      brief_note = null,
    } = req.body;

    const [existing] = await db.execute(
      "SELECT id FROM companies WHERE id = ? LIMIT 1",
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ failed: true, message: "Company not found" });
    }

    await db.execute(
      `
      UPDATE companies 
      SET phone = ?, whatsapp_no = ?, website_url = ?, 
      address = ?, zipcode = ?, brief_note = ?, 
      modified_date = NOW()
      WHERE id = ?
      `,
      [phone, whatsapp_no, website_url, address, zipcode, brief_note, userId]
    );

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
    });
  } catch (err) {
    console.error("UpdateCompany Error:", err);
    res.status(500).json({ failed: true, message: "Something went wrong" });
  }
};


module.exports = {
  GetUser,
  UpdateCompany,
  GetCompanyByAdmin
}

