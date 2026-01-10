import { createTransport } from "nodemailer";
import { resetPasswordEmailTemplate } from "./emailTemplate.js";

export const sendForgotPasswordMail = async (options) => {
  const transporter = createTransport({
    host: "smtp.hostinger.com",   // ✅ REQUIRED
    port: 587,                   // ✅ REQUIRED
    secure: false,               // true only for port 465
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Daraah Support" <${process.env.EMAIL_USERNAME}>`,
    to: options.to,
    subject: "Reset Password",
    html: resetPasswordEmailTemplate(
      options.firstName,
      options.resetUrl
    ),
  };

  return await transporter.sendMail(mailOptions);
};
