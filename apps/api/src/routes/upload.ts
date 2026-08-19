import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { optionalProtect } from '../middlewares/auth';

const router = Router();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage for images & videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `proof-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for video & high-res photos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'));
    }
  }
});

// POST /api/v1/upload
router.post('/', optionalProtect, (req: Request, res: Response) => {
  upload.any()(req, res, (err: any) => {
    if (err) {
      console.error('Multer upload error:', err);
      res.status(400).json({ success: false, error: err.message || 'File upload failed' });
      return;
    }
    
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }
      const uploadedFile = files[0];
      
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol || 'http';
      const fileUrl = `${protocol}://${host}/uploads/${uploadedFile.filename}`;
      res.status(200).json({ success: true, url: fileUrl });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
});

export default router;
