

import User from '../models/User.js';
import { hashValue, compareValue } from '../utils/hash.js';
import { generateOtp } from '../utils/otp.js';
import { sendOtpEmail } from '../utils/email.js';

async function findUserByRoleAndEmail(role, email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (role === 'staff') {
    return User.findOne({ role: 'staff', 'staff.staffGmail': normalizedEmail });
  }
  return User.findOne({ role: 'customer', 'customer.email': normalizedEmail });
}

export async function forgotPassword(req, res) {
  try {
    const { role, email } = req.body;

    if (!role || !email) {
      return res.status(400).json({ message: 'Email and role are required.' });
    }

    const user = await findUserByRoleAndEmail(role, email);

    
    if (!user) {
      return res.status(200).json({
        message: 'If an account exists for this email, an OTP has been sent.',
      });
    }

    const otp = generateOtp();
    const otpHash = await hashValue(otp);
    const expiresAt = new Date(
      Date.now() + (Number(process.env.OTP_EXPIRES_MINUTES) || 10) * 60 * 1000
    );

    user.resetOtp = { codeHash: otpHash, expiresAt, verified: false };
    await user.save();

    await sendOtpEmail(email.trim().toLowerCase(), otp);

    return res.status(200).json({
      message: 'If an account exists for this email, an OTP has been sent.',
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { role, email, otp } = req.body;

    if (!role || !email || !otp) {
      return res.status(400).json({ message: 'Email, role, and OTP are required.' });
    }

    const user = await findUserByRoleAndEmail(role, email);

    if (!user || !user.resetOtp?.codeHash) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (user.resetOtp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await compareValue(otp, user.resetOtp.codeHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect OTP.' });
    }

    
    user.resetOtp.verified = true;
    await user.save();

    return res.status(200).json({ message: 'OTP verified. You can now set a new password.' });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export async function resetPassword(req, res) {
  try {
    const { role, email, newPassword } = req.body;

    if (!role || !email || !newPassword) {
      return res.status(400).json({ message: 'Email, role, and new password are required.' });
    }

    const user = await findUserByRoleAndEmail(role, email);

    
    if (!user || !user.resetOtp?.verified) {
      return res.status(400).json({ message: 'OTP verification is required before resetting your password.' });
    }

    user.passwordHash = await hashValue(newPassword);
    user.resetOtp = { codeHash: null, expiresAt: null, verified: false };
    await user.save();

    return res.status(200).json({ message: 'Password updated. You can now sign in.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}