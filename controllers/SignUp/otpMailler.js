require('dotenv').config();
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_CONFIG,
        pass: process.env.EMAIL_PASS,
    },
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
