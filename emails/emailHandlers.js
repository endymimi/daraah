import { createTransport } from "nodemailer";
import { resetPasswordEmailTemplate } from "./emailTemplate.js";
import dotenv from "dotenv";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

dotenv.config();

export const sendForgotPasswordMail = async ({
  to,
  firstName,
  resetUrl,
}) => {
  await resend.emails.send({
    from: "Daraah <onboarding@resend.dev>", // 👈 HERE
    to,
    subject: "Reset your password",
    html: `
      <p>Hello ${firstName},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `,
  });
};