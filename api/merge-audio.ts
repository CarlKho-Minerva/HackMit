import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mergeAudio } from '../server/routes/merge-audio.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return mergeAudio(req as any, res as any);
}


