require("dotenv").config();
const dbHelper = require("../../db/dbhelper");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../SignUp/otpMailler");



const verifyOtp = async (req, res) => {
  try {
    const db = req.db; 
    const { email, otp } = req.body;

    if (!db) return res.status(500).json({ failed: true, message: "DB not connected" });
    const [adminRows] = await db.execute(
      "SELECT * FROM super_admin WHERE email = ? LIMIT 1",
      [email]
    );

    const [userRows] = await db.execute(
      "SELECT * FROM employee_info WHERE email = ? LIMIT 1",
      [email]
    );

    let table, record;
    if (adminRows.length > 0) {
      record = adminRows[0];
      table = "super_admin";
    } else if (userRows.length > 0) {
      record = userRows[0];
      table = "employee_info";
    } else {
      return res.status(404).json({ failed: false, message: "Email not found" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ failed: false, message: "Invalid OTP" });
    }

    const now = new Date();
    if (record.otp_expires < now) {
      return res.status(400).json({ failed: false, message: "OTP has expired" });
    }

    // Clear OTP and expiration after successful verification
    await db.execute(
      `UPDATE ${table} SET otp = NULL, otp_expires_at = NULL WHERE email = ?`,
      [email]
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const db = req.db; 
    const { email } = req.body;
    let name = "";

    if (!db) return res.status(500).json({ failed: true, message: "DB not connected" });
    const [adminRows] = await db.execute(
      "SELECT * FROM super_admin WHERE email = ? LIMIT 1",
      [email]
    );
    const [userRows] = await db.execute(
      "SELECT * FROM employee_info WHERE email = ? LIMIT 1",
      [email]
    );

    if (adminRows.length === 0 && userRows.length === 0) {
      return res.status(404).json({ failed: false, message: "Email not found." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    if (adminRows.length > 0) {
      await db.execute(
        "UPDATE super_admin SET otp=?, otp_expires_at=? WHERE email=?",
        [otp, expiresAt, email]
      );
      name = `${adminRows[0].first_name || ""} ${adminRows[0].last_name || ""}`;
    } else {
      await db.execute(
        "UPDATE employee_info SET otp=?, otp_expires_at=? WHERE email=?",
        [otp, expiresAt, email]
      );
      name = `${userRows[0].first_name || ""} ${userRows[0].last_name || ""}`;
    }

    await sendMail(
      email,
      "Your One-Time Password (OTP) for Verification",
      `
            Hello, ${name} 
            
            Your One-Time Password (OTP) for verification is:
            [${otp}]

            This OTP is valid for the next [5 minutes] only.
            Please do not share this code with anyone for security reasons.
            If you did not request this OTP, please ignore this email.

            Thank you,
            IT Racks
            Secure. Fast. Trusted.`);

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
    });

  } catch (err) {
    console.error("Resend OTP Error:", err);
    return res.status(500).json({
      failed: false,
      message: "Something went wrong",
    });
  }
};

const forgotPassSentOtp = async (req, res) => {
  try {
    const db = req.db; 
    const { email } = req.body;
    let name = ""

    if (!db) return res.status(500).json({ failed: true, message: "DB not connected" });
    const [adminRows] = await db.execute(
      "SELECT * FROM super_admin WHERE email = ? LIMIT 1",
      [email]
    );

    const [userRows] = await db.execute(
      "SELECT * FROM employee_info WHERE email = ? LIMIT 1",
      [email]
    );

    if (adminRows.length === 0 && userRows.length === 0) {
      return res.status(404).json({ failed: false, message: "Email not found." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    if (adminRows.length > 0) {
      await db.execute(
        "UPDATE admin SET otp=?, otp_expires_at=? WHERE email=?",
        [otp, expiresAt, email]
      );
      name = `${adminRows[0].first_name || ""} ${adminRows[0].last_name || ""}`;
    } else {
      await db.execute(
        "UPDATE employee_info SET otp=?, otp_expires_at=? WHERE email=?",
        [otp, expiresAt, email]
      );
      name = `${userRows[0].first_name || ""} ${userRows[0].last_name || ""}`;
    }


    await sendMail(
      email,
      "Your One-Time Password (OTP) for Verification",
      `
            Hello, ${name} 
            
            Your One-Time Password (OTP) for verification is:
            [${otp}]

            This OTP is valid for the next [5 minutes] only.
            Please do not share this code with anyone for security reasons.
            If you did not request this OTP, please ignore this email.

            Thank you,
            IT Racks
            Secure. Fast. Trusted.`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });

  } catch (err) {
    console.error("Send OTP Error:", err);
    return res.status(500).json({
      failed: false,
      message: "Something went wrong.",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const db = req.db; 
    const { email, new_password } = req.body;

    if (!db) return res.status(500).json({ failed: true, message: "DB not connected" });
    const [adminRows] = await db.execute(
      "SELECT * FROM super_admin WHERE email = ? LIMIT 1",
      [email]
    );

    const [userRows] = await db.execute(
      "SELECT * FROM employee_info WHERE email = ? LIMIT 1",
      [email]
    );

    let table = "";
    let user = null;

    if (adminRows.length > 0) {
      user = adminRows[0];
      table = "super_admin";
    } else if (userRows.length > 0) {
      user = userRows[0];
      table = "employee_info";
    } else {
      return res.status(404).json({ success: false, message: "Email not found." });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.execute(
      `UPDATE ${table} SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });

  } catch (err) {
    console.error("Update Password Error:", err);
    return res.status(500).json({
      failed: false,
      message: "Something went wrong.",
      error: err.message,
    });
  }
};


module.exports = {
  resendOtp,
  verifyOtp,
  forgotPassSentOtp,
  updatePassword
}
