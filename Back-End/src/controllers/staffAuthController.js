
import User from '../models/User.js';
import { hashValue, compareValue } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';


export async function registerStaff(req, res) {
  try {
    const { adminGmail, staffGmail, staffId, password } = req.body;

    if (!adminGmail || !staffGmail || !staffId || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const normalizedAdminGmail = adminGmail.trim().toLowerCase();
    const normalizedStaffGmail = staffGmail.trim().toLowerCase();
    const normalizedStaffId = staffId.trim();

    
    const existing = await User.findOne({
      role: 'staff',
      $or: [
        { 'staff.staffGmail': normalizedStaffGmail },
        { 'staff.staffId': normalizedStaffId },
      ],
    });

    if (existing) {
      return res.status(409).json({ message: 'Staff already exist' });
    }

    const passwordHash = await hashValue(password);

    const newStaff = await User.create({
      role: 'staff',
      passwordHash,
      staff: {
        adminGmail: normalizedAdminGmail,
        staffGmail: normalizedStaffGmail,
        staffId: normalizedStaffId,
      },
    });

    const token = generateToken(newStaff);

    return res.status(201).json({
      message: 'Staff account created successfully.',
      token,
      user: {
        id: newStaff._id,
        role: newStaff.role,
        adminGmail: newStaff.staff.adminGmail,
        staffGmail: newStaff.staff.staffGmail,
        staffId: newStaff.staff.staffId,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Staff already exist' });
    }
    console.error('registerStaff error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function loginStaff(req, res) {
  try {
    const { staffGmail, staffId, password } = req.body;

    if (!staffGmail || !staffId || !password) {
      return res.status(400).json({ message: 'Gmail, staff ID, and password are required.' });
    }

    const normalizedStaffGmail = staffGmail.trim().toLowerCase();
    const normalizedStaffId = staffId.trim();

    
    const user = await User.findOne({
      role: 'staff',
      'staff.staffGmail': normalizedStaffGmail,
      'staff.staffId': normalizedStaffId,
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email, staff ID, or password.' });
    }

    const passwordMatches = await compareValue(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email, staff ID, or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Signed in successfully.',
      token,
      user: {
        id: user._id,
        role: user.role,
        adminGmail: user.staff.adminGmail,
        staffGmail: user.staff.staffGmail,
        staffId: user.staff.staffId,
      },
    });

    
  } catch (err) {
    console.error('loginStaff error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}