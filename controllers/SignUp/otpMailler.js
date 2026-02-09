require('dotenv').config();
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail use kar rahe hain (ya apna SMTP server)
    auth: {
        user: process.env.EMAIL_CONFIG, // apna email
        pass: process.env.EMAIL_PASS  // us email ka app password
    }
});

async function sendMail(to, subject, text) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_CONFIG,
            to,
            subject,
            text
        });
    } catch (err) {
        console.error("Email send failed", err);
    }
}

module.exports = sendMail;
