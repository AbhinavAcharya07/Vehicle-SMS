
import User from '../models/User.js';
import { hashValue, compareValue } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

export async function registerCustomer(req, res) {
  try {
    const { fullName, email, phone, licensePlateNumber, password } = req.body;

    if (!fullName || !email || !phone || !licensePlateNumber || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPlate = licensePlateNumber.trim().toUpperCase();

    
    const existing = await User.findOne({
      role: 'customer',
      $or: [
        { 'customer.email': normalizedEmail },
        { 'customer.licensePlateNumber': normalizedPlate },
      ],
    });

    if (existing) {
      return res.status(409).json({ message: 'User already exist' });
    }

    const passwordHash = await hashValue(password);

    const newUser = await User.create({
      role: 'customer',
      passwordHash,
      customer: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        licensePlateNumber: normalizedPlate,
      },
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser._id,
        role: newUser.role,
        fullName: newUser.customer.fullName,
        email: newUser.customer.email,
        licensePlateNumber: newUser.customer.licensePlateNumber,
      },
    });
  } catch (err) {
    
    if (err.code === 11000) {
      return res.status(409).json({ message: 'User already exist' });
    }
    console.error('registerCustomer error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}


export async function loginCustomer(req, res) {
  try {
    const { licensePlateNumber, password } = req.body;

    if (!licensePlateNumber || !password) {
      return res.status(400).json({ message: 'License plate number and password are required.' });
    }

    const normalizedPlate = licensePlateNumber.trim().toUpperCase();

    const user = await User.findOne({
      role: 'customer',
      'customer.licensePlateNumber': normalizedPlate,
    });

   
    if (!user) {
      return res.status(401).json({ message: 'Invalid license plate number or password.' });
    }

    const passwordMatches = await compareValue(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid license plate number or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Signed in successfully.',
      token,
      user: {
        id: user._id,
        role: user.role,
        fullName: user.customer.fullName,
        email: user.customer.email,
        licensePlateNumber: user.customer.licensePlateNumber,
      },
    });

    
  } catch (err) {
    console.error('loginCustomer error:', err);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}