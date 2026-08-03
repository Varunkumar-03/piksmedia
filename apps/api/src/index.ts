import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { UserRole } from './models/User';
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
