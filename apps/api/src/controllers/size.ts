import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Size from '../models/Size';
import fs from 'fs';
import path from 'path';

const SIZES_FILE = path.join(__dirname, '../../data/sizes.json');

const DEFAULT_SIZES = [
  { _id: 'size-1', name: '8x10', unit: 'inches(in)' },
  { _id: 'size-2', name: '11x14', unit: 'inches(in)' },
  { _id: 'size-3', name: '16x20', unit: 'inches(in)' },
  { _id: 'size-4', name: '20x24', unit: 'inches(in)' },
  { _id: 'size-5', name: '24x36', unit: 'inches(in)' },
];

const readLocalSizes = (): any[] => {
  try {
    if (fs.existsSync(SIZES_FILE)) {
      const data = fs.readFileSync(SIZES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local sizes', err);
  }
  return DEFAULT_SIZES;
};

const writeLocalSizes = (sizes: any[]) => {
  try {
    const dir = path.dirname(SIZES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SIZES_FILE, JSON.stringify(sizes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local sizes', err);
  }
};

// Get all sizes
export const getSizes = async (req: Request, res: Response) => {
  try {
    const localSizes = readLocalSizes();

    if (mongoose.connection.readyState !== 1) {
      res.json(localSizes);
      return;
    }
    const dbSizes = await Size.find().lean().sort({ createdAt: -1 });

    const dbIds = new Set(dbSizes.map(s => String(s._id)));
    const merged = [...dbSizes];
    for (const ls of localSizes) {
      if (!dbIds.has(String(ls._id))) {
        merged.push(ls);
      }
    }
    res.json(merged);
  } catch (error) {
    res.status(200).json(readLocalSizes());
  }
};

// Create a new size
export const createSize = async (req: Request, res: Response) => {
  try {
    const { name, unit } = req.body;
    
    const localSizes = readLocalSizes();
    const existingLocal = localSizes.find(s => String(s.name).toLowerCase() === String(name).toLowerCase());
    if (existingLocal) {
      res.status(400).json({ message: 'Size with this name already exists' });
      return;
    }

    const newSizeObj = {
      _id: 'size-' + Date.now(),
      name,
      unit: unit || 'inches(in)',
      createdAt: new Date(),
    };

    localSizes.unshift(newSizeObj);
    writeLocalSizes(localSizes);

    if (mongoose.connection.readyState !== 1) {
      res.status(201).json(newSizeObj);
      return;
    }

    const existingSize = await Size.findOne({ name });
    if (existingSize) {
      res.status(400).json({ message: 'Size with this name already exists' });
      return;
    }

    const size = new Size({ name, unit });
    await size.save();
    res.status(201).json(size);
  } catch (error) {
    res.status(500).json({ message: 'Error creating size', error });
  }
};

// Delete a size
export const deleteSize = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const localSizes = readLocalSizes();
    const filtered = localSizes.filter(s => String(s._id) !== String(id));
    writeLocalSizes(filtered);

    if (mongoose.connection.readyState !== 1) {
      res.json({ message: 'Size deleted successfully' });
      return;
    }

    await Size.findByIdAndDelete(id);
    res.json({ message: 'Size deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting size', error });
  }
};
