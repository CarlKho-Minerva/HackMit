import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { uploadToGCS } from './routes/upload-to-gcs';
import { publishToYouTube } from './routes/publish-to-youtube';
import { publishToYouTubeMock } from './routes/publish-to-youtube-mock';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Routes
app.post('/api/upload-to-gcs', upload.single('video'), uploadToGCS);

// YouTube route - use mock if no real credentials are configured
const hasYouTubeCredentials = process.env.YOUTUBE_ACCESS_TOKEN &&
                             process.env.YOUTUBE_CLIENT_ID &&
                             process.env.YOUTUBE_CLIENT_SECRET &&
                             process.env.YOUTUBE_ACCESS_TOKEN.trim() !== '' &&
                             process.env.YOUTUBE_CLIENT_ID.trim() !== '' &&
                             process.env.YOUTUBE_CLIENT_SECRET.trim() !== '' &&
                             !process.env.YOUTUBE_ACCESS_TOKEN.includes('your-') &&
                             !process.env.YOUTUBE_CLIENT_ID.includes('your-');

if (hasYouTubeCredentials) {
  app.post('/api/publish-to-youtube', publishToYouTube);
  console.log('🎬 YouTube: Real API mode (credentials found)');
} else {
  app.post('/api/publish-to-youtube', publishToYouTubeMock);
  console.log('🎬 YouTube: Demo mode (no credentials - using mock)');
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/upload-to-gcs`);
  console.log(`🎬 YouTube endpoint: http://localhost:${PORT}/api/publish-to-youtube`);

  if (hasYouTubeCredentials) {
    console.log('✅ YouTube API: Real publishing enabled');
  } else {
    console.log('🎭 YouTube API: Demo mode (configure OAuth for real publishing)');
  }
});

export default app;
