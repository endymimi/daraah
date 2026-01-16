import { createTransport } from "nodemailer";
import { resetPasswordEmailTemplate } from "./emailTemplate.js";
import dotenv from "dotenv";

dotenv.config();

export const sendForgotPasswordMail = async ({ to, firstName, resetUrl }) => {
  const transporter = createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
   
  });

  // 🔍 Verify SMTP connection
  await transporter.verify();

  const mailOptions = {
    from: `"Daraah Support" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject: "Reset Your Password",
    html: resetPasswordEmailTemplate(firstName, resetUrl),
  };

  return transporter.sendMail(mailOptions);
};

