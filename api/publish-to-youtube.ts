import type { VercelRequest, VercelResponse } from '@vercel/node';
import { publishToYouTube } from '../server/routes/publish-to-youtube.js';
import { publishToYouTubeMock } from '../server/routes/publish-to-youtube-mock.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if YouTube credentials are properly configured
  const hasYouTubeCredentials = process.env.YOUTUBE_ACCESS_TOKEN &&
                               process.env.YOUTUBE_CLIENT_ID &&
                               process.env.YOUTUBE_CLIENT_SECRET &&
                               process.env.YOUTUBE_ACCESS_TOKEN.trim() !== '' &&
                               process.env.YOUTUBE_CLIENT_ID.trim() !== '' &&
                               process.env.YOUTUBE_CLIENT_SECRET.trim() !== '' &&
                               !process.env.YOUTUBE_ACCESS_TOKEN.includes('your-') &&
                               !process.env.YOUTUBE_CLIENT_ID.includes('your-');

  if (hasYouTubeCredentials) {
    return publishToYouTube(req as any, res as any);
  } else {
    return publishToYouTubeMock(req as any, res as any);
  }
}
