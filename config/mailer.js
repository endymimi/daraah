import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,          // SSL port
  secure: true,       // must be true for 465
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify SMTP connection on server start
transporter.verify()
  .then(() => console.log("SMTP verified ✅"))
  .catch(err => console.error("SMTP verification failed ❌", err));

export default transporter;
