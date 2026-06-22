import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendVerificationEmail = async (to: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Aura Admin" <noreply@aura-admin.com>',
    to,
    subject: 'Verify Your Email — Aura Admin Dashboard',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #3b82f6; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
            <span style="font-size: 24px; font-weight: bold; color: white;">A</span>
          </div>
          <h1 style="color: #f8fafc; font-size: 24px; margin: 0;">Welcome to Aura Admin</h1>
        </div>
        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
          Thanks for registering! Please verify your email address by clicking the button below.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
        <p style="color: #475569; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} Aura Admin Dashboard. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't throw — registration should still succeed even if email fails
  }
};

export const sendPasswordResetEmail = async (to: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Aura Admin" <noreply@aura-admin.com>',
    to,
    subject: 'Password Reset — Aura Admin Dashboard',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: #3b82f6; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
            <span style="font-size: 24px; font-weight: bold; color: white;">A</span>
          </div>
          <h1 style="color: #f8fafc; font-size: 24px; margin: 0;">Password Reset</h1>
        </div>
        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
          You requested a password reset. Click the button below to choose a new password.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
};

export default transporter;
