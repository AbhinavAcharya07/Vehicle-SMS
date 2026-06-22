
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashValue(plainText) {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function compareValue(plainText, hash) {
  if (!hash) return false; // e.g. no OTP was ever requested
  return bcrypt.compare(plainText, hash);
}