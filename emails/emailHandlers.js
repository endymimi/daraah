import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";
import { resetPasswordEmailTemplate } from "./emailTemplate.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendForgotPasswordMail = async ({ to, firstName, resetUrl }) => {
  try {
    const result = await resend.emails.send({
      from: "Daraah Support <no-reply@daraah.com>",
      to, // recipient email
      subject: "Reset Your Password",
      html: resetPasswordEmailTemplate(firstName, resetUrl), // your template
    });

    console.log("Email sent result:", result); // this will log the Resend response
    return result;

  } catch (error) {
    console.error("Resend email error:", error);
    throw error; // so your controller knows something went wrong
  }
};
