require("dotenv").config();
const dbHelper = require("../../db/dbhelper");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require('mysql2/promise');
const sendMail = require("./otpMailler");
const { createNewTenant } = require('../../controllers/Tenants/index');
const { createTenantTables } = require("../../controllers/Tenants/TenantSchema");
const coreDb = require('../../db/coreDb');
const JWT_SECRET = process.env.JWT_ACCESS_SECRET
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;



const signupWithCompany = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,

      // company fields
      company,
      domain,
      ntn_vat,
      phone,
      address,
      state_province,
      country,
      city,
    } = req.body;


    if (!firstName || !email || !password || !company || !domain) {
      return res.status(400).json({
        failed: true,
        message: "Required fields missing",
      });
    }

    const [existingTenant] = await coreDb.execute(
      `SELECT company_name, domain
        FROM tenants
        WHERE company_name = ? OR domain = ?
        LIMIT 1`,
      [company, domain]
    );

    if (existingTenant.length > 0) {
      const found = existingTenant[0];

      if (found.company_name === company) {
        return res.status(409).json({
          success: false,
          message: "Company name already exists"
        });
      }

      if (found.domain === domain) {
        return res.status(409).json({
          success: false,
          message: "Domain already exists"
        });
      }
    }

    const company_name = company;
    const db_name = `tenant_${company.replace(/\s+/g, "_").toLowerCase()}`;
    const db_user = "root";
    const db_password = "";

    const tenantId = await createNewTenant({
      company_name,
      db_name,
      db_user,
      db_password,
      domain
    });

    const rootConn = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
    });
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${db_name}\``);
    await rootConn.end();

    const tenantDb = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: db_name,
      waitForConnections: true,
      connectionLimit: 10,
    });

    await createTenantTables(tenantDb);
    const hashedPassword = await bcrypt.hash(password, 10);

    const [adminResult] = await tenantDb.execute(
      `INSERT INTO super_admin
        (first_name, last_name, email, password,user_type)
        VALUES (?, ?, ?, ?,?)`,
      [firstName, lastName, email, hashedPassword, "Super_admin"]
    );

    const adminId = adminResult.insertId;

    const imagePath = `/uploads/company-logos/${req.file.filename}`;

    const businessId = `${Math.floor(10000000 + Math.random() * 90000000)}-${Math.floor(10 + Math.random() * 90)}`;
    const [companyResult] = await tenantDb.execute(
      `INSERT INTO companies
        (company, domain, ntn_vat, phone, address,
          state_province, country, city, business_id, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company,
        domain,
        ntn_vat,
        phone,
        address,
        state_province,
        country,
        city,
        businessId,
        imagePath
      ]
    );

    const companyId = companyResult.insertId;
    await tenantDb.execute(
      `INSERT INTO company_admin_access
        (company_id, super_admin_id, user_type, status)
      VALUES (?, ?, ?, ?)`,
      [companyId, adminId, 'Super_admin', 'active']
    );

    const payload = {
      id: adminId,
      email,
      role: "Super_admin",
      tenant_id: tenantId,
      company: companyId
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "15m" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await tenantDb.execute(
      `UPDATE super_admin
        SET refresh_token = ?, otp = ?, otp_expires_at = ?
        WHERE id = ?`,
      [refreshToken, otp, otpExpiry, adminId]
    );
    await sendMail(
      email,
      "Your One-Time Password (OTP) for Verification",
      `Hello ${firstName} ${lastName},

          Your OTP is: ${otp}

          This OTP is valid for 5 minutes.
          Do not share this code with anyone.

          Thanks,
          IT Racks`
    );

    return res.status(201).json({
      success: true,
      message: "Signup & Company registration successful",
      tenantId,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      failed: true,
      message: "Something went wrong",
    });
  }
};

const SignInUser = async (req, res) => {
  try {
    const { email, password, domain } = req.body;

    if (!email || !password || !domain) {
      return res.status(400).json({
        success: false,
        message: "Email, password and domain is required",
      });
    }

    // 🔹 Tenant check
    const [tenantRows] = await coreDb.execute(
      "SELECT * FROM tenants WHERE domain = ? LIMIT 1",
      [domain]
    );

    if (!tenantRows.length) {
      return res.status(404).json({
        success: false,
        message: "Invalid domain",
      });
    }

    const tenant = tenantRows[0];

    const tenantDb = await mysql.createPool({
      host: tenant.db_host,
      user: tenant.db_user,
      password: tenant.db_password,
      database: tenant.db_name,
      waitForConnections: true,
      connectionLimit: 10,
    });

    const [empRows] = await tenantDb.execute(
      "SELECT * FROM employee_info WHERE email = ? LIMIT 1",
      [email]
    );

    const [adminRows] = await tenantDb.execute(
      "SELECT * FROM super_admin WHERE email = ? LIMIT 1",
      [email]
    );


    let user = null;
    let payload = {};

    /* ================= EMPLOYEE LOGIN ================= */
    if (empRows.length > 0 ) {
      user = empRows[0];
      payload = {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        company: user.company_id,
        tenant_id: tenant.id,
        tenant_domain: tenant.domain,
      };
    }

    else if (adminRows.length > 0) {
      user = adminRows[0];
      const [companyRows] = await tenantDb.execute(
        `SELECT company_id FROM company_admin_access WHERE super_admin_id = ?`,
        [user.id]
      );
      const companyId = companyRows.map(c => c.company_id);
      payload = {
        id: user.id,
        email: user.email,
        user_type: "Super_admin",
        tenant_id: tenant.id,
        tenant_domain: tenant.domain,
        company: companyId[0]
      };
    }

    else {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 🔹 Tokens
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "15m" });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user_type: payload.user_type,
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// const SignInUser = async (req, res) => {
//   try {
//     const { email, password, domain } = req.body;

//     if (!email || !password || !domain) {
//       return res.status(400).json({
//         failed: false,
//         message: "Email, password and domain is required",
//       });
//     }

//     const [tenantRows] = await coreDb.execute(
//       "SELECT * FROM tenants WHERE domain = ? LIMIT 1",
//       [domain]
//     );

//     if (tenantRows.length === 0) {
//       return res.status(404).json({
//         failed: false,
//         message: "Invalid domain",
//       });
//     }

//     const tenant = tenantRows[0];
//     const tenantDb = await mysql.createPool({
//       host: tenant.db_host,
//       user: tenant.db_user,
//       password: tenant.db_password,
//       database: tenant.db_name,
//       waitForConnections: true,
//       connectionLimit: 10,
//     });

//     const [empRows] = await tenantDb.execute(
//       "SELECT * FROM employee_info WHERE email = ? LIMIT 1",
//       [email]
//     );

//     console.log("empRows",empRows)

//     const [adminRows] = await tenantDb.execute(
//       "SELECT * FROM super_admin WHERE email = ? LIMIT 1",
//       [email]
//     );

//     let user = null;
//     let payload = {};

//     if (empRows.length > 0) {
//       user = empRows[0];
//       const [companyRows] = await tenantDb.execute(
//         `SELECT id FROM company_admin_access WHERE super_admin_id = ?`,
//         [user?.company_id]
//       );
//       const companyId = companyRows.map(c => c.company_id);
//       payload = {
//         id: user.id,
//         email: user.email,
//         user_type: user.user_type,
//         admin_id: user.admin_id,
//         tenant_id: tenant.id,
//         tenant_domain: tenant.domain,
//         company: user?.company_id
//       };
//     } else if (adminRows.length > 0) {
//       user = adminRows[0];
//       const [companyRows] = await tenantDb.execute(
//         `SELECT company_id FROM company_admin_access WHERE super_admin_id = ?`,
//         [user.id]
//       );
//       const companyId = companyRows.map(c => c.company_id);
//       payload = {
//         id: user.id,
//         email: user.email,
//         user_type: "Super_admin",
//         tenant_id: tenant.id,
//         tenant_domain: tenant.domain,
//         company: companyId[0]
//       };
//     } else {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password",
//       });
//     }
//     const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
//     const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "15m" });


//     return res.status(200).json({
//       success: true,
//       message: "Login successful",
//       accessToken,
//       refreshToken,
//       user_type: payload.user_type,
//     });
//   } catch (err) {
//     console.error("Login Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };

const RefreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ failed: true, message: "Refresh token required" });
  }
  jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ failed: true, message: "Invalid refresh token" });
    }
    const payload = {
      id: decoded.id,
      email: decoded.email,
      user_type: decoded.user_type,
      tenant_id: decoded.tenant_id,
      tenant_domain: decoded.tenant_domain,
      company: decoded.company
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    const newRefreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "15m" });
    return res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  });
};

module.exports = {
  signupWithCompany,
  SignInUser,
  RefreshToken,
}



