import "dotenv/config";

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not defined");
}

const resend = new Resend(apiKey);

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Email sending failed:", error);
    throw new Error(error.message);
  }

  return data;
};
