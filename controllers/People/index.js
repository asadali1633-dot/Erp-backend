
require("dotenv").config();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");


// EMPLOYEE APIS ==========================

const GenratedEmpId = async (req, res) => {
  try {
    const db = req.db;
    const companyId = req.user.company;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID missing in token",
      });
    }

    const [empRows] = await db.execute(
      `SELECT emp_id
       FROM employee_info
       WHERE company_id = ?
       ORDER BY emp_id DESC
       LIMIT 1`,
      [companyId]
    );

    let nextEmployeeId = "0004";

    if (empRows.length > 0 && empRows[0].emp_id) {
      const lastId = parseInt(empRows[0].emp_id, 10);
      nextEmployeeId = (lastId + 1).toString().padStart(4, "0");
    }

    return res.status(200).json({
      success: true,
      message: "Next employee ID generated successfully",
      next_employee_id: nextEmployeeId,
    });

  } catch (error) {
    console.error("Emp Generated Id Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const CreatePeople = async (req, res) => {
  try {
    const db = req.db;
    const companyId = req.user.company;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID missing",
      });
    }

    const {
      emp_id,
      first_name,
      last_name,
      email,
      department,
      role,
      designation,
      mobile_number,
      whatsapp_number,
      emergency_number,
      phone_extension,
      full_address,
      province,
      country,
      city,
      postal_code,
      facebook_link,
      linkedin_link,
      x_link,
      blood_group,
      gender,
      joining_date,
      date_of_birth,
      identity_type,
      status,
      identity_number,
      user_type
    } = req.body;

    const [existing] = await db.execute(
      `SELECT email FROM employee_info WHERE email = ? AND company_id = ?
       UNION
       SELECT email FROM super_admin WHERE email = ?`,
      [email, companyId, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const plainPassword = "123456789";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    /* -------- INSERT EMPLOYEE -------- */
    const sql = `
      INSERT INTO employee_info (
        company_id,
        emp_id,
        first_name,
        last_name,
        email,
        password,
        department,
        role,
        designation,
        mobile_number,
        whatsapp_number,
        emergency_number,
        phone_extension,
        full_address,
        province,
        country,
        city,
        postal_code,
        facebook_link,
        linkedin_link,
        x_link,
        blood_group,
        gender,
        joining_date,
        date_of_birth,
        identity_type,
        identity_number,
        status,
        user_type
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )
    `;

    const [result] = await db.execute(sql, [
      companyId,
      emp_id,
      first_name,
      last_name,
      email,
      hashedPassword,
      department,
      role,
      designation,
      mobile_number || null,
      whatsapp_number || null,
      emergency_number || null,
      phone_extension || null,
      full_address || null,
      province || null,
      country || null,
      city || null,
      postal_code || null,
      facebook_link || null,
      linkedin_link || null,
      x_link || null,
      blood_group || null,
      gender || null,
      joining_date || null,
      date_of_birth || null,
      identity_type || null,
      identity_number || null,
      status || null,
      user_type || null
    ]);

    /* -------- EMAIL -------- */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_CONFIG,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_CONFIG}>`,
      to: email,
      subject: "Your Account Credentials",
      html: `
        <h3>Hello ${first_name},</h3>
        <p>Your account has been created successfully.</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${plainPassword}</p>
        <p>Please change your password after first login.</p>
        <br/>
        <p>Regards,<br/>Admin Team</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      userId: result.insertId,
    });

  } catch (error) {
    console.error("CreatePeople Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const UpdatePeople = async (req, res) => {
  try {
    const db = req.db;
    const companyId = req.user.company;
    const { email } = req.body.email
    const { id } = req.params;


    const [empCheck] = await db.execute(
      `SELECT id FROM employee_info WHERE id = ? AND company_id = ?`,
      [id, companyId]
    );

    if (!empCheck.length) {
      return res.status(404).json({
        success: false,
        message: "Employee not found in your company",
      });
    }

    // 2️⃣ Email uniqueness check within company
    if (email) {
      const [existing] = await db.execute(
        `SELECT id FROM employee_info WHERE email = ? AND id != ? AND company_id = ?
         UNION
         SELECT id FROM super_admin WHERE email = ?`,
        [email, id, companyId, email]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already exists in this company",
        });
      }
    }

    // 3️⃣ Allowed fields update
    const allowedFields = [
      "emp_id", "first_name", "last_name", "email", "department", "role", "designation",
      "mobile_number", "whatsapp_number", "emergency_number", "phone_extension",
      "full_address", "province", "country", "city", "postal_code",
      "facebook_link", "linkedin_link", "x_link", "blood_group", "gender",
      "joining_date", "date_of_birth", "identity_type", "identity_number",
      "status", "user_type"
    ];

    const updateFields = [];
    const values = [];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (!updateFields.length) {
      return res.status(400).json({
        failed: false,
        message: "No fields provided to update",
      });
    }

    const sql = `
      UPDATE employee_info
      SET ${updateFields.join(", ")}
      WHERE id = ? AND company_id = ?
    `;

    values.push(id, companyId);
    await db.execute(sql, values);

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
    });

  } catch (error) {
    console.error("UpdatePeople Error:", error);
    return res.status(500).json({
      failed: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Pending for reparing api
const DeleteEmployees = async (req, res) => {
  try {
    const db = req.db;
    let { ids } = req.body;
    const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;

    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    if (!ids.length) {
      return res.status(400).json({
        success: false,
        message: "No employee IDs provided",
      });
    }

    const placeholders = ids.map(() => "?").join(",");

    const sql = `
      DELETE FROM employee_info
      WHERE id IN (${placeholders})
      AND admin_id = ?
    `;

    const [result] = await db.execute(sql, [...ids, admin_id]);

    return res.status(200).json({
      success: true,
      message: "Employee(s) deleted successfully",
      deletedCount: result.affectedRows,
    });

  } catch (error) {
    console.error("DeleteEmployees Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error,
    });
  }
};

const GetEmpByIdSearchWithPagination = async (req, res) => {
  try {
    const db = req.db;
    const companyId = req.user.company;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID missing in token",
      });
    }

    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE e.company_id = ?";
    let values = [companyId];

    if (search) {
      whereClause += `
        AND (
          e.emp_id = ?
          OR e.first_name LIKE ?
          OR e.last_name LIKE ?
          OR e.email LIKE ?
        )
      `;
      values.push(
        search,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
      );
    }

    /* -------- COUNT -------- */
    const [countResult] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM employee_info e
       ${whereClause}`,
      values
    );

    const total = countResult[0].total;

    /* -------- DATA -------- */
    const [rows] = await db.execute(
      `SELECT 
          e.id,
          e.emp_id,
          e.first_name,
          e.last_name,
          e.email,

          e.role AS role_id,
          r.role_name,

          e.designation AS designation_id,
          dg.designation_name,

          e.department AS department_id,
          d.department AS department_name,

          e.mobile_number,
          e.whatsapp_number,
          e.status,
          e.created_at

          FROM employee_info e

          LEFT JOIN departments d 
          ON e.department = d.id
          AND d.company_id = ?

          LEFT JOIN roles r 
          ON e.role = r.id
          AND r.company_id = ?

          LEFT JOIN designations dg 
          ON e.designation = dg.id
          AND dg.company_id = ?

          ${whereClause}
          ORDER BY e.created_at DESC
          LIMIT ? OFFSET ?`,
      [
        companyId, companyId, companyId, ...values,
        Number(limit),
        Number(offset),
      ]
    );

    return res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      employees: rows,
    });

  } catch (error) {
    console.error("GetEmployees Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const GetEmployeeById = async (req, res) => {
  try {
    const db = req.db;
    const companyId = req.user.company;
    const targetId = req.params.id;
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID missing in token",
      });
    }

    const [employees] = await db.execute(
      `SELECT 
        e.id,
        e.emp_id,
        e.first_name,
        e.last_name,
        e.email,

        e.role,
        r.role_name,

        e.designation,
        dg.designation_name,

        e.department,
        d.department AS department_name,

        e.mobile_number,
        e.whatsapp_number,
        e.emergency_number,
        e.phone_extension,

        e.full_address,
        e.province,
        e.city,
        e.country,
        e.postal_code,

        e.facebook_link,
        e.linkedin_link,
        e.x_link,

        e.blood_group,
        e.gender,
        e.joining_date,
        e.date_of_birth,

        e.identity_type,
        e.identity_number,
        e.profile_image,

        e.status,
        e.user_type,
        e.created_at,
        'employee' AS source
      FROM employee_info e
      LEFT JOIN departments d ON e.department = d.id
      LEFT JOIN roles r ON e.role = r.id
      LEFT JOIN designations dg ON e.designation = dg.id
      WHERE e.company_id = ? AND e.id = ?
      LIMIT 1`,
      [companyId, targetId]
    );

    if (employees.length > 0) {
      return res.status(200).json({
        success: true,
        data: employees[0],
      });
    }

    return res.status(404).json({
      success: false,
      message: "Employee not found",
    });

  } catch (error) {
    console.error("GetEmployeeById Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Pending for reparing api
const GetAllEmployeesBySimpleList = async (req, res) => {
  // try {
  //   const db = req.db;
  //   const admin_id = req.user.admin_id ? req.user.admin_id : req.user.id;

  //   const [rows] = await db.execute(
  //     `SELECT 
  //         e.id,
  //         e.emp_id,
  //         CONCAT(e.first_name, ' ', e.last_name) AS name,
  //         e.email,
  //         e.status
  //      FROM employee_info e
  //      WHERE e.admin_id = ?`,
  //     [admin_id]
  //   );

  //   return res.status(200).json({
  //     success: true,
  //     employees: rows,
  //   });

  // } catch (error) {
  //   console.error("GetAllEmployeesByAdmin Error:", error);
  //   return res.status(500).json({
  //     success: false,
  //     message: "Server error",
  //     error,
  //   });
  // }
};

const uploadUserImage = async (req, res) => {
  try {
    const db = req.db;
    const companyId = req.user.company;
    const { empid } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const imagePath = `/uploads/user-profile-images/${req.file.filename}`;
    const [rows] = await db.execute(
      `SELECT id, profile_image 
       FROM employee_info 
       WHERE id = ? AND company_id = ?`,
      [empid, companyId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Employee not found in your company",
      });
    }

    // 2️⃣ Update employee profile image
    await db.execute(
      `UPDATE employee_info
       SET profile_image = ?
       WHERE id = ? AND company_id = ?`,
      [imagePath, empid, companyId]
    );

    return res.status(200).json({
      success: true,
      message: "Employee Profile image uploaded successfully",
      profile_image: imagePath
    });

  } catch (error) {
    console.error("Upload User Image Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// SUPER ADMIN APIS ==============
const GetSuperAdminById = async (req, res) => {
  try {
    const db = req.db;
    const Super_Admin_id = req.user.id;
    const user_type = req.user.user_type
    const { id } = req.params.id

    let employee_id = null;

    if (Super_Admin_id && user_type === "Super_admin") {
      employee_id = id || Super_Admin_id;
    }

    const [admins] = await db.execute(
      `SELECT
        a.id,
        a.first_name,
        a.last_name,
        a.email,
        a.mobile_number,
        a.whatsapp_number,
        a.emergency_number,
        a.phone_extension,

        a.joining_date,
        a.identity_type,
        a.identity_number,

        a.role,
        r.role_name,

        a.designation,
        dg.designation_name,

        a.department,
        d.department AS department_name,

        a.full_address,
        a.province,
        a.city,
        a.country,
        a.postal_code,

        a.facebook_link,
        a.linkedin_link,
        a.x_link,

        a.gender,
        a.date_of_birth,
        a.blood_group,

        a.profile_image,
        a.status,
        a.user_type,
        a.created_at,
        'super_admin' AS source
      FROM super_admin a
      LEFT JOIN roles r ON a.role = r.id
      LEFT JOIN designations dg ON a.designation = dg.id
      LEFT JOIN departments d ON a.department = d.id
      WHERE a.id = ?
      LIMIT 1`,
      [employee_id]
    );

    if (!admins.length) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: admins[0],
    });

  } catch (error) {
    console.error("GetEmployeeById Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const UpdateSuperAdmin = async (req, res) => {
  try {
    const db = req.db;
    const super_admin_id = req.user.id;
    const { email } = req.body.email
    const { id } = req.params.id
    const [adminCheck] = await db.execute(
      `SELECT id FROM super_admin WHERE id = ?`,
      [super_admin_id]
    );

    if (!adminCheck.length) {
      return res.status(404).json({
        success: false,
        message: "Super Admin not found",
      });
    }

    // Email uniqueness check
    if (email) {
      const [existing] = await db.execute(
        `SELECT email FROM employee_info WHERE email = ?
         UNION
         SELECT email FROM super_admin WHERE email = ? AND id != ?`,
        [email, email, super_admin_id]
      );

      if (existing.length) {
        return res.status(409).json({
          success: false,
          message: "Email already exists in the system",
        });
      }
    }

    const allowedFields = [
      "emp_id",
      "first_name",
      "last_name",
      "email",
      "department",
      "role",
      "designation",
      "mobile_number",
      "whatsapp_number",
      "emergency_number",
      "phone_extension",
      "full_address",
      "province",
      "country",
      "city",
      "postal_code",
      "facebook_link",
      "linkedin_link",
      "x_link",
      "blood_group",
      "gender",
      "joining_date",
      "date_of_birth",
      "identity_type",
      "identity_number",
      "status",
      "user_type",
    ];

    const updateFields = [];
    const values = [];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (!updateFields.length) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    const sql = `
      UPDATE super_admin
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    values.push(super_admin_id || id);

    await db.execute(sql, values);

    return res.status(200).json({
      success: true,
      message: "Super Admin updated successfully",
    });

  } catch (error) {
    console.error("UpdateSuperAdmin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const uploadSuperAdminImage = async (req, res) => {
  try {
    const db = req.db;
    const super_admin_id = req.user.id;
    const { empid } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const imagePath = `/uploads/super-admin-profile-images/${req.file.filename}`;
    const [rows] = await db.execute(
      `SELECT id, profile_image 
        FROM super_admin 
        WHERE id = ?`,
      [super_admin_id || empid]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Super admin not found",
      });
    }
    await db.execute(
      `UPDATE super_admin 
         SET profile_image = ? 
         WHERE id = ?`,
      [imagePath, super_admin_id || empid]
    );

    return res.status(200).json({
      success: true,
      message: rows[0].profile_image
        ? "Super admin profile image updated successfully"
        : "Super admin profile image added successfully",
      image: imagePath,
    });

  } catch (error) {
    console.error("Upload User Image Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  GenratedEmpId,
  CreatePeople,
  UpdatePeople,
  DeleteEmployees,
  GetEmpByIdSearchWithPagination,
  GetEmployeeById,
  GetAllEmployeesBySimpleList,
  uploadUserImage,
  // =========================
  GetSuperAdminById,
  UpdateSuperAdmin,
  uploadSuperAdminImage
};

