import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category';
import fs from 'fs';
import path from 'path';

const CATEGORIES_FILE = path.join(__dirname, '../../data/categories.json');

const DEFAULT_CATEGORIES = [
  { _id: 'cat-1', name: 'Frames', slug: 'frames', description: 'Handcrafted Wood', image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=600&auto=format&fit=crop', badge: 'Popular', availableSizes: ['8x10', '11x14', '16x20'], sizeUnit: 'inches(in)' },
  { _id: 'cat-2', name: 'Photo Prints', slug: 'photo-prints', description: 'Archival Quality', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop', badge: 'Giclée', availableSizes: ['8x10', '11x14'], sizeUnit: 'inches(in)' },
  { _id: 'cat-3', name: 'Canvas Art', slug: 'canvas-art', description: 'Stretched Pine', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop', badge: 'Textured', availableSizes: ['16x20', '20x24', '24x36'], sizeUnit: 'inches(in)' },
  { _id: 'cat-4', name: 'Hand Arts', slug: 'hand-arts', description: 'Custom Sketches', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', badge: 'Handmade', availableSizes: ['11x14', '16x20'], sizeUnit: 'inches(in)' },
  { _id: 'cat-5', name: 'Paintings', slug: 'paintings', description: 'Original Artworks', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop', badge: 'Artisan', availableSizes: ['16x20', '24x36'], sizeUnit: 'inches(in)' },
  { _id: 'cat-6', name: 'Funeral Frames', slug: 'funeral-frames', description: 'Memorial Tribute', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop', badge: 'Tribute', availableSizes: ['8x10', '11x14'], sizeUnit: 'inches(in)' },
];

const readLocalCategories = (): any[] => {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Error reading local categories', err);
  }
  return DEFAULT_CATEGORIES;
};

const writeLocalCategories = (categories: any[]) => {
  try {
    const dir = path.dirname(CATEGORIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local categories', err);
  }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const dbCategories = await Category.find().lean().sort({ createdAt: -1 });
    res.json(dbCategories);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, badge, availableSizes, sizeUnit } = req.body;
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : `cat-${Date.now()}`;

    const existingCategory = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existingCategory) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }

    const category = new Category({ name, slug, description, image, badge, availableSizes, sizeUnit });
    await category.save();

    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Update a category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image, badge, availableSizes, sizeUnit } = req.body;
    
    const localCategories = readLocalCategories();
    const idx = localCategories.findIndex(c => String(c._id) === String(id));
    if (idx !== -1) {
      localCategories[idx] = { ...localCategories[idx], ...req.body };
      if (name) {
        localCategories[idx].slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      writeLocalCategories(localCategories);
    }

    if (mongoose.connection.readyState !== 1) {
      res.json(idx !== -1 ? localCategories[idx] : { _id: id, ...req.body });
      return;
    }

    let updateData: any = { description, image, badge, availableSizes, sizeUnit };
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
    if (!category) {
      if (idx !== -1) {
        res.json(localCategories[idx]);
        return;
      }
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};

// Delete a category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const localCategories = readLocalCategories();
    const filtered = localCategories.filter(c => String(c._id) !== String(id));
    writeLocalCategories(filtered);

    if (mongoose.connection.readyState !== 1) {
      res.json({ message: 'Category deleted successfully' });
      return;
    }

    const category = await Category.findByIdAndDelete(id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};
