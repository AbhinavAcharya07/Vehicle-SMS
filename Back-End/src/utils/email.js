import nodemailer from 'nodemailer';

export async function sendOtpEmail(toEmail, otp) {
  const minutes = process.env.OTP_EXPIRES_MINUTES || 10;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"AutoTrack" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Your AutoTrack password reset code',
    text: `Your one-time verification code is ${otp}. It expires in ${minutes} minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#111;">AutoTrack Password Reset</h2>
        <p>Your one-time verification code is:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color:#6366f1;">${otp}</p>
        <p style="color:#666; font-size: 13px;">
          This code expires in ${minutes} minutes.
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}