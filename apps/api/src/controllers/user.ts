import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User, { UserRole } from '../models/User';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      // Mock data for offline mode
      res.status(200).json({
        success: true,
        data: [
          { _id: 'mock-user-2', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'USER', createdAt: new Date() },
          { _id: 'mock-user-3', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'USER', createdAt: new Date() }
        ]
      });
      return;
    }

    const users = await User.find({ role: { $in: [UserRole.USER, UserRole.CUSTOMER] } }).select('-password').lean();
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(200).json({ success: true, data: [] });
  }
};

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      // Offline mode
      res.status(201).json({
        success: true,
        data: {
          _id: 'mock-admin-' + Date.now(),
          firstName,
          lastName,
          email,
          role: UserRole.ADMIN,
          createdAt: new Date(),
        }
      });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ success: false, error: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, name, email, phone, profilePhoto } = req.body;

    if (mongoose.connection.readyState !== 1) {
      // Offline mode
      res.status(200).json({
        success: true,
        data: {
          _id: (req as any).user ? (req as any).user.id : 'mock-admin-id',
          firstName: name ? name.split(' ')[0] : (firstName || 'Mock'),
          lastName: name ? name.split(' ').slice(1).join(' ') : (lastName !== undefined ? lastName : ''),
          name: name || `${firstName || ''} ${lastName || ''}`.trim(),
          email: email || 'mock@example.com',
          phone: phone !== undefined ? phone : '9876543210',
          role: (req as any).user ? (req as any).user.role : UserRole.ADMIN,
          profilePhoto: profilePhoto || (req as any).user?.profilePhoto
        }
      });
      return;
    }

    const user = await User.findById((req as any).user.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    if (name) {
      const parts = name.trim().split(' ');
      user.firstName = parts[0] || name;
      user.lastName = parts.slice(1).join(' ') || '';
    } else {
      if (firstName) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
    }

    if (phone !== undefined) user.phone = phone.trim();
    if (email) user.email = email;
    if (profilePhoto) user.profilePhoto = profilePhoto;

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim(),
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto,
        addresses: updatedUser.addresses,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Address Management Controllers ---
import fs from 'fs';
import path from 'path';

const ADDRESSES_FILE = path.join(__dirname, '../../data/addresses.json');

const readLocalAddresses = (): any => {
  try {
    if (fs.existsSync(ADDRESSES_FILE)) {
      const data = fs.readFileSync(ADDRESSES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading local addresses', err);
  }
  return {};
};

const writeLocalAddresses = (addressesData: any) => {
  try {
    const dir = path.dirname(ADDRESSES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(addressesData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local addresses', err);
  }
};

const fetchUserAddressesHelper = async (userObj: any): Promise<any[]> => {
  const userId = userObj ? String(userObj._id || userObj.id || '') : null;
  const localStore = readLocalAddresses();
  let userLocal: any[] = [];
  Object.values(localStore).forEach((arr: any) => {
    if (Array.isArray(arr)) userLocal.push(...arr);
  });

  const uniqueLocal: any[] = [];
  const seen = new Set();
  for (const a of userLocal) {
    const key = String(a._id || `${a.fullName}-${a.address}-${a.postalCode}`);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueLocal.push(a);
    }
  }

  if (mongoose.connection.readyState !== 1 || !userId || !mongoose.isValidObjectId(userId)) {
    return uniqueLocal;
  }

  try {
    const user = await User.findById(userId);
    if (!user || !user.addresses) return uniqueLocal;

    const dbAddresses = user.addresses || [];
    const dbIds = new Set(dbAddresses.map(a => String(a._id)));
    const merged = [...dbAddresses];
    for (const la of uniqueLocal) {
      if (!dbIds.has(String(la._id))) {
        merged.push(la);
      }
    }
    return merged;
  } catch (err) {
    return uniqueLocal;
  }
};

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userObj = (req as any).user;
    const data = await fetchUserAddressesHelper(userObj);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userObj = (req as any).user;
    const userId = userObj ? String(userObj._id || userObj.id || '') : 'guest-user';
    const userEmail = userObj?.email;
    const { fullName, phone, address, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !phone || !address || !city || !postalCode) {
      res.status(400).json({ success: false, error: 'Please provide all required address fields.' });
      return;
    }

    const cleanedPostal = String(postalCode).trim();
    if (!/^\d{6}$/.test(cleanedPostal)) {
      res.status(400).json({ success: false, error: 'Postal code must contain exactly 6 digits (e.g. 560001).' });
      return;
    }

    const newAddressObj = {
      _id: 'addr-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state ? state.trim() : '',
      postalCode: cleanedPostal,
      country: (country || 'India').trim(),
      isDefault: Boolean(isDefault),
    };

    const localStore = readLocalAddresses();
    const saveKeys = [userId];
    if (userEmail) saveKeys.push(userEmail);
    
    for (const key of saveKeys) {
      if (!localStore[key]) localStore[key] = [];
      if (localStore[key].length === 0 || isDefault) {
        localStore[key].forEach((a: any) => a.isDefault = false);
        newAddressObj.isDefault = true;
      }
      localStore[key].push(newAddressObj);
    }
    writeLocalAddresses(localStore);

    if (mongoose.connection.readyState === 1 && userId && mongoose.isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId);
        if (user) {
          if (!user.addresses) user.addresses = [];
          if (user.addresses.length === 0 || isDefault) {
            user.addresses.forEach(a => a.isDefault = false);
          }
          user.addresses.push(newAddressObj as any);
          await user.save();
        }
      } catch (dbErr) {
        console.warn('DB addAddress warning:', dbErr);
      }
    }

    const data = await fetchUserAddressesHelper(userObj);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userObj = (req as any).user;
    const userId = userObj ? String(userObj._id || userObj.id || '') : 'guest-user';
    const { addressId } = req.params;
    const { fullName, phone, address, city, state, postalCode, country, isDefault } = req.body;

    if (postalCode) {
      const cleanedPostal = String(postalCode).trim();
      if (!/^\d{6}$/.test(cleanedPostal)) {
        res.status(400).json({ success: false, error: 'Postal code must contain exactly 6 digits.' });
        return;
      }
    }

    const localStore = readLocalAddresses();
    for (const key of Object.keys(localStore)) {
      if (Array.isArray(localStore[key])) {
        localStore[key] = localStore[key].map((a: any) => {
          if (String(a._id) === String(addressId)) {
            return {
              ...a,
              fullName: fullName !== undefined ? String(fullName).trim() : a.fullName,
              phone: phone !== undefined ? String(phone).trim() : a.phone,
              address: address !== undefined ? String(address).trim() : a.address,
              city: city !== undefined ? String(city).trim() : a.city,
              state: state !== undefined ? String(state).trim() : a.state,
              postalCode: postalCode !== undefined ? String(postalCode).trim() : a.postalCode,
              country: country !== undefined ? String(country).trim() : a.country,
              isDefault: isDefault !== undefined ? Boolean(isDefault) : a.isDefault,
            };
          }
          return a;
        });
      }
    }
    writeLocalAddresses(localStore);

    if (mongoose.connection.readyState === 1 && userId && mongoose.isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId);
        if (user && user.addresses) {
          const addrIndex = user.addresses.findIndex(a => String(a._id) === String(addressId));
          if (addrIndex !== -1) {
            const existing = user.addresses[addrIndex];
            user.addresses[addrIndex] = {
              ...existing,
              fullName: fullName !== undefined ? String(fullName).trim() : existing.fullName,
              phone: phone !== undefined ? String(phone).trim() : existing.phone,
              address: address !== undefined ? String(address).trim() : existing.address,
              city: city !== undefined ? String(city).trim() : existing.city,
              state: state !== undefined ? String(state).trim() : existing.state,
              postalCode: postalCode !== undefined ? String(postalCode).trim() : existing.postalCode,
              country: country !== undefined ? String(country).trim() : existing.country,
              isDefault: isDefault !== undefined ? Boolean(isDefault) : existing.isDefault,
            } as any;
            await user.save();
          }
        }
      } catch (dbErr) {
        console.warn('DB updateAddress warning:', dbErr);
      }
    }

    const data = await fetchUserAddressesHelper(userObj);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('updateAddress error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userObj = (req as any).user;
    const userId = userObj ? String(userObj._id || userObj.id || '') : 'guest-user';
    const { addressId } = req.params;

    const currentAddresses = await fetchUserAddressesHelper(userObj);
    const targetAddr = currentAddresses.find(a => String(a._id) === String(addressId));

    if (targetAddr && (targetAddr.isDefault || currentAddresses.length <= 1)) {
      res.status(400).json({ 
        success: false, 
        error: 'The default address cannot be deleted until the default address is changed or another address is added.' 
      });
      return;
    }

    const localStore = readLocalAddresses();
    for (const key of Object.keys(localStore)) {
      if (Array.isArray(localStore[key])) {
        localStore[key] = localStore[key].filter((a: any) => String(a._id) !== String(addressId));
      }
    }
    writeLocalAddresses(localStore);

    if (mongoose.connection.readyState === 1 && userId && mongoose.isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId);
        if (user && user.addresses) {
          user.addresses = user.addresses.filter(a => String(a._id) !== String(addressId));
          await user.save();
        }
      } catch (dbErr) {
        console.warn('DB deleteAddress warning:', dbErr);
      }
    }

    const data = await fetchUserAddressesHelper(userObj);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userObj = (req as any).user;
    const userId = userObj ? String(userObj._id || userObj.id || '') : 'guest-user';
    const { addressId } = req.params;

    const localStore = readLocalAddresses();
    for (const key of Object.keys(localStore)) {
      if (Array.isArray(localStore[key])) {
        localStore[key].forEach((a: any) => {
          a.isDefault = String(a._id) === String(addressId);
        });
      }
    }
    writeLocalAddresses(localStore);

    if (mongoose.connection.readyState === 1 && userId && mongoose.isValidObjectId(userId)) {
      try {
        const user = await User.findById(userId);
        if (user && user.addresses) {
          user.addresses.forEach(a => {
            a.isDefault = String(a._id) === String(addressId);
          });
          await user.save();
        }
      } catch (dbErr) {
        console.warn('DB setDefaultAddress warning:', dbErr);
      }
    }

    const data = await fetchUserAddressesHelper(userObj);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Please provide both current and new passwords' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
      return;
    }

    if (mongoose.connection.readyState !== 1 || !userId) {
      res.status(200).json({ success: true, message: 'Password changed successfully' });
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.password) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

