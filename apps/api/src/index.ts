import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { UserRole } from './models/User';
import Category from './models/Category';
import bcrypt from 'bcrypt';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// DB Connection
let connectionPromise: Promise<void> | null = null;
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('MONGO_URI is not defined. Connecting to local MongoDB at mongodb://127.0.0.1:27017/piks');
      mongoUri = 'mongodb://127.0.0.1:27017/piks';
    }
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB Connected`);
    
    // Seed admin if none exists
    const adminExists = await User.findOne({ email: 'admin@piksmedia.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@piksmedia.com',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN
      });
      console.log('Seeded default admin user: admin@piksmedia.com / admin123');
    }

    // Seed default categories if none exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Frames', slug: 'frames', description: 'Handcrafted Wood', image: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?q=80&w=600&auto=format&fit=crop', badge: 'Popular', availableSizes: ['8x10', '11x14', '16x20'], sizeUnit: 'inches(in)' },
        { name: 'Photo Prints', slug: 'photo-prints', description: 'Archival Quality', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop', badge: 'Giclée', availableSizes: ['8x10', '11x14'], sizeUnit: 'inches(in)' },
        { name: 'Canvas Art', slug: 'canvas-art', description: 'Stretched Pine', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=600&auto=format&fit=crop', badge: 'Textured', availableSizes: ['16x20', '20x24', '24x36'], sizeUnit: 'inches(in)' },
        { name: 'Hand Arts', slug: 'hand-arts', description: 'Custom Sketches', image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop', badge: 'Handmade', availableSizes: ['11x14', '16x20'], sizeUnit: 'inches(in)' },
        { name: 'Paintings', slug: 'paintings', description: 'Original Artworks', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop', badge: 'Artisan', availableSizes: ['16x20', '24x36'], sizeUnit: 'inches(in)' },
        { name: 'Funeral Frames', slug: 'funeral-frames', description: 'Memorial Tribute', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop', badge: 'Tribute', availableSizes: ['8x10', '11x14'], sizeUnit: 'inches(in)' }
      ];
      await Category.insertMany(defaultCategories);
      console.log('Seeded default categories into MongoDB database');
    }
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    console.warn('Backend server continuing in offline mode with local persistence fallback.');
  }
};

const ensureConnected = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    connectionPromise = connectDB().finally(() => {
      connectionPromise = null;
    });
  }
  await connectionPromise;
};

app.use(async (req, res, next) => {
  await ensureConnected();
  next();
});

import authRoutes from './routes/auth';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import userRoutes from './routes/user';
import settingRoutes from './routes/setting';
import uploadRoutes from './routes/upload';
import categoryRoutes from './routes/category';
import sizeRoutes from './routes/size';
import reviewRoutes from './routes/review';

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/catalog', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/sizes', sizeRoutes);
app.use('/api/v1/reviews', reviewRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Piks Media API is running');
});

// Start Server
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});

export default app;
