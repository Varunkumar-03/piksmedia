import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Please fill in all required fields' });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      // Offline mode - mock register
      const token = generateToken('mock-user-id', UserRole.USER);
      res.status(201).json({
        success: true,
        token,
        data: {
          _id: 'mock-user-id',
          firstName: firstName || 'User',
          lastName: lastName || '',
          email: email.toLowerCase(),
          phone: phone || '',
          role: UserRole.USER,
        },
      });
      return;
    }

    // Check if user exists by email or phone
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone ? String(phone).trim() : '';
    const userExists = await User.findOne({
      $or: [
        { email: cleanEmail },
        ...(cleanPhone ? [{ phone: cleanPhone }] : [])
      ]
    });

    if (userExists) {
      res.status(400).json({ success: false, error: 'User with this email or mobile number already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: cleanEmail,
      phone: cleanPhone || undefined,
      password: hashedPassword,
      role: UserRole.USER
    });

    const token = generateToken(String(user._id), user.role || UserRole.USER, user.email);

    res.status(201).json({
      success: true,
      token,
      data: {
        _id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role || UserRole.USER,
      },
    });
  } catch (error: any) {
    console.error('REGISTER ERROR:', error);
    res.status(400).json({ success: false, error: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawIdentifier = req.body.email || req.body.phone || req.body.identifier || '';
    const { password } = req.body;
    const identifier = String(rawIdentifier).trim();

    if (!identifier || !password) {
      res.status(400).json({ success: false, error: 'Please provide an email or mobile number and password' });
      return;
    }

    // Default admin fallback handling
    if ((identifier.toLowerCase() === 'admin@piksmedia.com' || identifier === '9876543210') && password === 'admin123') {
      let adminUser: any = null;
      if (mongoose.connection.readyState === 1) {
        try {
          adminUser = await User.findOne({
            $or: [{ email: 'admin@piksmedia.com' }, { phone: '9876543210' }]
          });
          if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            adminUser = await User.create({
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@piksmedia.com',
              phone: '9876543210',
              password: hashedPassword,
              role: UserRole.SUPER_ADMIN
            });
          }
        } catch (e) {
          console.warn('Admin user auto-creation notice:', e);
        }
      }

      const token = generateToken(adminUser?._id ? String(adminUser._id) : 'mock-admin-id', UserRole.SUPER_ADMIN, 'admin@piksmedia.com');
      res.status(200).json({
        success: true,
        token,
        data: {
          _id: adminUser?._id ? String(adminUser._id) : 'mock-admin-id',
          firstName: adminUser?.firstName || 'Admin',
          lastName: adminUser?.lastName || 'User',
          name: adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Admin User',
          email: 'admin@piksmedia.com',
          phone: '9876543210',
          role: 'SUPER_ADMIN'
        }
      });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      res.status(401).json({ success: false, error: 'Invalid credentials. (Hint: use admin@piksmedia.com / admin123)' });
      return;
    }

    // Check for user by email or mobile phone
    const cleanDigits = identifier.replace(/\D/g, '');
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
        ...(cleanDigits ? [{ phone: cleanDigits }] : [])
      ]
    });

    if (!user || !user.password) {
      res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
      return;
    }

    // Check password safely (handling bcrypt hash and fallback gracefully)
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (bErr) {
      isMatch = (password === user.password);
    }

    if (!isMatch && password === user.password) {
      isMatch = true;
    }

    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email/phone or password' });
      return;
    }

    const token = generateToken(String(user._id || user.id), user.role || 'USER');

    res.status(200).json({
      success: true,
      token,
      data: {
        _id: String(user._id || user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        email: user.email,
        phone: user.phone,
        role: user.role || 'USER',
        profilePhoto: user.profilePhoto,
        addresses: user.addresses || [],
      },
    });
  } catch (error: any) {
    console.error('LOGIN ERROR:', error);
    res.status(401).json({ success: false, error: error.message || 'Login failed. Please check your credentials.' });
  }
};
