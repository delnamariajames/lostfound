import express, { Express, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { upload } from './middleware/upload.js';
import { dbStore } from './data/store.js';
import { connectDB } from './config/db.js';

export function createExpressApp(): Express {
  const app = express();

  // Initialize DB if configured
  connectDB().catch((err) => console.warn('DB init warning:', err));

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve uploaded images statically
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch {}
  }
  app.use('/uploads', express.static(uploadDir));

  // File upload route
  app.post('/api/upload', upload.single('image'), (req: Request, res: Response): void => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file uploaded.' });
        return;
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl, filename: req.file.filename });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload image.' });
    }
  });

  // Reset / Seed route for easy testing and demonstrations
  app.post('/api/seed', (_req: Request, res: Response): void => {
    dbStore.resetToSeed();
    res.json({ message: 'Database reset to initial campus seed items.' });
  });

  // Health route
  app.get('/api/health', (_req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      service: 'Campus Lost & Found Portal API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/claims', claimRoutes);
  app.use('/api/admin', adminRoutes);

  return app;
}
