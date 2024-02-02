import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import { renderAsync } from "@react-email/render";
import React from "react";

import { PlaidVerifyIdentityEmail } from "@/emails/plaid-verify-identity";

export async function POST(request: NextRequest) {
  const { email, name, validationCode } = await request.json();

  const transporter = nodemailer.createTransport({
    host: "smtp.mailendo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.NEXT_PUBLIC_MAIL_USER,
      pass: process.env.NEXT_PUBLIC_MAIL_PASS,
    },
  });

  const emailHtml = await renderAsync(
    React.createElement(PlaidVerifyIdentityEmail, { validationCode })
  );

  const emailText = "Please use validation code:" + validationCode;

  const mailOptions: Mail.Options = {
    from: process.env.NEXT_PUBLIC_MAIL_USER,
    to: email,
    subject: "Test plaid varify email for " + name,
    html: emailHtml,
    text: emailText,
  };

  const sendMailPromise = () =>
    new Promise<string>((resolve, reject) => {
      transporter.sendMail(mailOptions, function (err) {
        if (!err) {
          resolve("Email sent");
        } else {
          reject(err.message);
        }
      });
    });

  try {
    await sendMailPromise();
    return NextResponse.json({ message: "Email sent" });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
