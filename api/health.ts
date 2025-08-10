import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    vercel: true,
    endpoints: {
      '/api/generate': 'POST - Generate video with RunPod',
      '/api/jobs/[id]': 'GET - Check job status',
      '/api/upload-to-gcs': 'POST - Upload video to Google Cloud Storage',
      '/api/publish-to-youtube': 'POST - Publish video to YouTube',
      '/api/health': 'GET - This health check'
    },
    config: {
      hasRunpodBase: !!process.env.VITE_RUNPOD_BASE,
      hasYouTubeCredentials: !!(
        process.env.YOUTUBE_ACCESS_TOKEN &&
        process.env.YOUTUBE_CLIENT_ID &&
        process.env.YOUTUBE_CLIENT_SECRET
      ),
      hasGCSConfig: !!(
        process.env.GCS_PROJECT_ID &&
        process.env.GCS_BUCKET_NAME
      )
    }
  });
}
