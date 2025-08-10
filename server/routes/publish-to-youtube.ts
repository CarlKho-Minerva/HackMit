import { Request, Response } from 'express';
import { google } from 'googleapis';
import { Readable } from 'stream';

interface PublishRequest extends Request {
  body: {
    videoUrl: string;
    title?: string;
    description?: string;
    tags?: string[];
  };
}

export const publishToYouTube = async (req: PublishRequest, res: Response) => {
  try {
    const { videoUrl, title = 'AI Generated Video', description = 'Created with Veo-3 AI', tags = ['AI', 'video', 'generated'] } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    console.log('🎬 Starting YouTube upload for:', videoUrl);

    // Set up OAuth2 client with proper credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      'http://localhost:3001/auth/youtube/callback'
    );

    // Set the credentials with automatic refresh
    oauth2Client.setCredentials({
      access_token: process.env.YOUTUBE_ACCESS_TOKEN,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    // Handle automatic token refresh
    oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        console.log('🔄 New refresh token received');
        // In production, you'd save this to your database
      }
      if (tokens.access_token) {
        console.log('✅ Access token refreshed');
      }
    });

    // Initialize YouTube API
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    // Download the video from GCS
    console.log('📥 Downloading video from GCS...');
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.statusText}`);
    }

    const videoBuffer = await response.arrayBuffer();
    const videoStream = Readable.from(Buffer.from(videoBuffer));

    console.log('⬆️ Uploading to YouTube...');

    // Upload to YouTube
    const uploadResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId: '22', // People & Blogs category
        },
        status: {
          privacyStatus: 'unlisted', // Make it unlisted so you can share the link easily
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: videoStream,
      },
    });

    const videoId = uploadResponse.data.id;
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const channelId = uploadResponse.data.snippet?.channelId;

    console.log('✅ YouTube upload successful:', youtubeUrl);
    console.log('📺 Video details:', {
      videoId,
      title: uploadResponse.data.snippet?.title,
      privacy: uploadResponse.data.status?.privacyStatus,
      channelId
    });

    res.json({
      success: true,
      videoId,
      youtubeUrl,
      channelId,
      title: uploadResponse.data.snippet?.title || title,
      description: uploadResponse.data.snippet?.description || description,
      privacy: uploadResponse.data.status?.privacyStatus,
      uploadTime: new Date().toISOString(),
      message: '🎬 Video successfully published to YouTube!',
      demoMode: false,
    });

  } catch (error) {
    console.error('❌ YouTube upload error:', error);

    if (error instanceof Error) {
      res.status(500).json({
        error: 'Failed to publish to YouTube',
        details: error.message
      });
    } else {
      res.status(500).json({ error: 'Unknown error occurred during YouTube upload' });
    }
  }
};
