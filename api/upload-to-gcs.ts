import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { uploadToGCS } from '../server/routes/upload-to-gcs.js';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle multipart form data
  return new Promise((resolve, reject) => {
    upload.single('video')(req as any, res as any, (err: any) => {
      if (err) {
        reject(res.status(400).json({ error: 'File upload error' }));
      } else {
        uploadToGCS(req as any, res as any);
        resolve(undefined);
      }
    });
  });
}
