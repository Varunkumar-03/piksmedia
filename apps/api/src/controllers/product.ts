import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Category';
import fs from 'fs';
import path from 'path';

const PRODUCTS_FILE = path.join(__dirname, '../../data/products.json');
const CATEGORIES_FILE = path.join(__dirname, '../../data/categories.json');

const readLocalCategories = async (): Promise<any[]> => {
  const localCats = (() => {
    try {
      if (fs.existsSync(CATEGORIES_FILE)) {
        const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.error('Error reading local categories', err);
    }
    return [
      { _id: 'cat-1', name: 'Frames', slug: 'frames' },
      { _id: 'cat-2', name: 'Photo Prints', slug: 'photo-prints' },
      { _id: 'cat-3', name: 'Canvas Art', slug: 'canvas-art' },
      { _id: 'cat-4', name: 'Hand Arts', slug: 'hand-arts' },
      { _id: 'cat-5', name: 'Paintings', slug: 'paintings' },
      { _id: 'cat-6', name: 'Funeral Frames', slug: 'funeral-frames' },
    ];
  })();

  if (mongoose.connection.readyState !== 1) {
    return localCats;
  }

  try {
    const dbCategories = await Category.find().lean();
    const dbNames = new Set(dbCategories.map(c => (c.name || '').toLowerCase().trim()));
    const dbIds = new Set(dbCategories.map(c => String(c._id)));
    const merged = [...dbCategories];
    for (const lc of localCats) {
      const cleanLcName = (lc.name || '').toLowerCase().trim();
      if (!dbIds.has(String(lc._id)) && !dbNames.has(cleanLcName)) {
        merged.push(lc);
      }
    }
    return merged;
  } catch (err) {
    return localCats;
  }
};

const DEFAULT_PRODUCTS: any[] = [];

const readLocalProducts = (): any[] => {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading local products', err);
  }
  return [];
};

const writeLocalProducts = (products: any[]) => {
  try {
    const dir = path.dirname(PRODUCTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local products', err);
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const localProducts = readLocalProducts();

    const allCats = await readLocalCategories();

    const resolveProductCategories = (productList: any[]) => {
      return productList.map(p => {
        let resolvedCategory = p.category;
        if (p.category) {
          const catVal = (typeof p.category === 'object' && p.category)
            ? String(p.category._id || p.category.name || '').trim()
            : String(p.category).trim();
            
          const matchCat = allCats.find((c: any) => 
            String(c._id) === catVal || 
            c.name.toLowerCase() === catVal.toLowerCase() || 
            (c.slug && c.slug.toLowerCase() === catVal.toLowerCase())
          );
          if (matchCat) {
            resolvedCategory = {
              _id: matchCat._id,
              name: matchCat.name,
              slug: matchCat.slug
            };
          }
        }
        return { ...p, category: resolvedCategory };
      });
    };

    if (mongoose.connection.readyState !== 1) {
      let filtered = resolveProductCategories(localProducts);
      if (category) {
        const targetStr = String(category).toLowerCase().trim();
        const cleanParam = targetStr.replace(/[^a-z0-9]/g, '');
        
        filtered = filtered.filter(p => {
          if (!p.category) return false;
          let rawCatStr = '';
          if (typeof p.category === 'object' && p.category) {
            rawCatStr = `${p.category.name || ''} ${p.category.slug || ''} ${p.category._id || ''}`.toLowerCase();
          } else {
            rawCatStr = String(p.category).toLowerCase();
          }
          const cleanRaw = rawCatStr.replace(/[^a-z0-9]/g, '');
          return rawCatStr.includes(targetStr) || cleanRaw.includes(cleanParam);
        });
      }
      res.status(200).json({ success: true, data: filtered });
      return;
    }

    const filter: any = {};
    if (search) {
      filter.title = { $regex: search as string, $options: 'i' };
    }
    
    if (category) {
      const catParam = (category as string).trim();
      if (mongoose.Types.ObjectId.isValid(catParam)) {
        filter.category = catParam;
      }
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortObj: any = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortObj = { price: 1 };
    } else if (sort === 'price_desc') {
      sortObj = { price: -1 };
    }

    let dbProducts: any[] = [];
    try {
      dbProducts = await Product.find(filter).lean().sort(sortObj);
    } catch (pErr) {
      console.warn('Product find warning:', pErr);
    }

    // Prioritize local JSON file edits over DB products so user side updates instantly
    const localIds = new Set(localProducts.map(p => String(p._id)));
    let merged = [...localProducts];
    for (const dbP of dbProducts) {
      if (!localIds.has(String(dbP._id))) {
        merged.push(dbP);
      }
    }

    merged = resolveProductCategories(merged);

    if (category) {
      const targetStr = String(category).toLowerCase().trim();
      const cleanParam = targetStr.replace(/[^a-z0-9]/g, '');

      merged = merged.filter(p => {
        if (!p.category) return false;

        let rawCatStr = '';
        if (typeof p.category === 'object' && p.category) {
          rawCatStr = `${p.category.name || ''} ${p.category.slug || ''} ${p.category._id || ''}`.toLowerCase();
        } else {
          rawCatStr = String(p.category).toLowerCase();
        }

        const cleanRaw = rawCatStr.replace(/[^a-z0-9]/g, '');
        return rawCatStr.includes(targetStr) || cleanRaw.includes(cleanParam);
      });
    }

    res.status(200).json({ success: true, data: merged });
  } catch (error: any) {
    res.status(200).json({ success: true, data: readLocalProducts() });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const localProducts = readLocalProducts();
    const localMatch = localProducts.find(x => String(x._id) === String(req.params.id));

    if (localMatch) {
      res.status(200).json({ success: true, data: localMatch });
      return;
    }

    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    const localMatch = readLocalProducts().find(x => String(x._id) === String(req.params.id));
    res.status(200).json({ success: true, data: localMatch || null });
  }
};

// Admin route
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock || 10),
      deliveryCharges: Number(req.body.deliveryCharges || 0),
      freeShippingThreshold: Number(req.body.freeShippingThreshold || 0)
    };

    let categoryObj: any = req.body.category;
    let resolvedCatId: any = null;

    if (req.body.category) {
      const catVal = (typeof req.body.category === 'object' && req.body.category)
        ? String(req.body.category._id || req.body.category.name || '').trim()
        : String(req.body.category).trim();

      const allCats = await readLocalCategories();
      const matchCat = allCats.find((c: any) => 
        String(c._id) === catVal || 
        c.name.toLowerCase() === catVal.toLowerCase() || 
        (c.slug && c.slug.toLowerCase() === catVal.toLowerCase())
      );

      if (matchCat) {
        categoryObj = { _id: matchCat._id, name: matchCat.name, slug: matchCat.slug };
        resolvedCatId = mongoose.Types.ObjectId.isValid(matchCat._id) ? matchCat._id : null;
      } else {
        categoryObj = catVal;
        resolvedCatId = mongoose.Types.ObjectId.isValid(catVal) ? catVal : null;
      }
    }

    if (!productData.slug && productData.title) {
      productData.slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (productData.image) {
      productData.images = [productData.image];
      if (productData.gallery && Array.isArray(productData.gallery) && productData.gallery.length > 0) {
        productData.images.push(...productData.gallery);
      }
    } else if (!productData.images || productData.images.length === 0) {
      productData.images = ['https://placehold.co/400x400?text=Product'];
    }

    const newLocalProd = {
      _id: 'prod-' + Date.now(),
      ...productData,
      category: categoryObj,
      createdAt: new Date()
    };

    if (resolvedCatId) {
      productData.category = resolvedCatId;
    } else {
      delete productData.category;
    }

    if (mongoose.connection.readyState !== 1) {
      const localProducts = readLocalProducts();
      localProducts.unshift(newLocalProd);
      writeLocalProducts(localProducts);
      res.status(201).json({ success: true, data: newLocalProd });
      return;
    }

    const product = await Product.create(productData);
    const createdObj = { ...product.toObject(), category: categoryObj };
    
    // Write created DB product to local json so both sources match 1:1
    const localProducts = readLocalProducts();
    const existingIdx = localProducts.findIndex(x => String(x._id) === String(product._id));
    if (existingIdx === -1) {
      localProducts.unshift(createdObj);
    } else {
      localProducts[existingIdx] = createdObj;
    }
    writeLocalProducts(localProducts);

    res.status(201).json({ success: true, data: createdObj });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = { ...req.body };
    const localProducts = readLocalProducts();
    const idx = localProducts.findIndex(x => String(x._id) === String(req.params.id));

    // Resolve full category details if category ID/name is provided
    let categoryObj: any = productData.category;
    let resolvedCatId: any = null;

    if (productData.category) {
      const catVal = (typeof productData.category === 'object' && productData.category)
        ? String(productData.category._id || productData.category.name || '').trim()
        : String(productData.category).trim();

      const allCats = await readLocalCategories();
      const matchCat = allCats.find((c: any) => 
        String(c._id) === catVal || 
        c.name.toLowerCase() === catVal.toLowerCase() || 
        (c.slug && c.slug.toLowerCase() === catVal.toLowerCase())
      );

      if (matchCat) {
        categoryObj = { _id: matchCat._id, name: matchCat.name, slug: matchCat.slug };
        resolvedCatId = mongoose.Types.ObjectId.isValid(matchCat._id) ? matchCat._id : null;
      } else {
        categoryObj = catVal;
        resolvedCatId = mongoose.Types.ObjectId.isValid(catVal) ? catVal : null;
      }
    }

    if (productData.image) {
      const imgList = [productData.image];
      if (productData.gallery && Array.isArray(productData.gallery) && productData.gallery.length > 0) {
        imgList.push(...productData.gallery);
      }
      productData.images = imgList;
    } else if (productData.images && productData.images.length > 0) {
      productData.image = productData.images[0];
    }

    if (idx !== -1) {
      localProducts[idx] = { 
        ...localProducts[idx], 
        ...productData,
        image: productData.image || localProducts[idx].image,
        images: productData.images || localProducts[idx].images,
        category: categoryObj || localProducts[idx].category
      };
      writeLocalProducts(localProducts);
    }

    if (mongoose.connection.readyState !== 1 || !mongoose.Types.ObjectId.isValid(req.params.id as string)) {
      if (idx !== -1) {
        res.status(200).json({ success: true, data: localProducts[idx] });
      } else {
        res.status(404).json({ success: false, error: 'Product not found' });
      }
      return;
    }

    if (resolvedCatId) {
      productData.category = resolvedCatId;
    } else {
      delete productData.category;
    }

    if (productData.title && !productData.slug) {
      productData.slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (productData.image) {
      productData.images = [productData.image];
      if (productData.gallery && Array.isArray(productData.gallery) && productData.gallery.length > 0) {
        productData.images.push(...productData.gallery);
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
    if (!product) {
      if (idx !== -1) {
        res.status(200).json({ success: true, data: localProducts[idx] });
        return;
      }
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const updatedObj = { ...product.toObject(), ...productData, category: categoryObj };
    if (idx !== -1) {
      localProducts[idx] = { ...localProducts[idx], ...updatedObj };
      writeLocalProducts(localProducts);
    }

    res.status(200).json({ success: true, data: updatedObj });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const catModule = require('./category');
      const cats = catModule.readLocalCategories ? catModule.readLocalCategories() : [];
      res.status(200).json({ success: true, data: cats });
      return;
    }
    const categories = await Category.find();
    res.status(200).json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const localProducts = readLocalProducts();
    const filtered = localProducts.filter(x => String(x._id) !== String(req.params.id));
    writeLocalProducts(filtered);

    if (mongoose.connection.readyState !== 1) {
      res.status(200).json({ success: true, data: { message: 'Delete success' } });
      return;
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
