import { Request, Response } from 'express';

interface PublishRequest extends Request {
  body: {
    videoUrl: string;
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export const publishToYouTubeMock = async (req: PublishRequest, res: Response) => {
  try {
    const { videoUrl, title = 'AI Generated Video', description = 'Created with Veo-3 AI', tags = ['AI', 'video', 'generated'] } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    console.log('🎬 [DEMO MODE] Starting YouTube upload simulation for:', videoUrl);

    // Simulate download progress
    console.log('📥 [DEMO MODE] Downloading video from GCS...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate upload process
    console.log('⬆️ [DEMO MODE] Uploading to YouTube...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a fake but realistic YouTube video ID
    const generateVideoId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      let result = '';
      for (let i = 0; i < 11; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const videoId = generateVideoId();
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log('✅ [DEMO MODE] YouTube upload simulation successful:', youtubeUrl);
    console.log('📊 [DEMO MODE] Upload details:', {
      title,
      description,
      tags,
      privacy: 'private',
      uploadTime: new Date().toISOString()
    });

    res.json({
      success: true,
      videoId,
      youtubeUrl,
      title,
      message: '🎬 [DEMO MODE] Video successfully "published" to YouTube!',
      demoMode: true,
      note: 'This is a simulation for demo purposes. To publish real videos, configure YouTube OAuth credentials.',
    });

  } catch (error) {
    console.error('❌ [DEMO MODE] YouTube upload simulation error:', error);

    res.status(500).json({
      error: 'Demo YouTube upload simulation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      demoMode: true
    });
  }
};
