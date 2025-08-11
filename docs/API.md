# API Reference

Backend API endpoints for Viral-Veo with comprehensive video editing and publishing capabilities.

## Base URL
`http://localhost:3001`

## Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-10T12:00:00.000Z"
}
```

### Apple Music Integration

#### Get Trending Sounds
```
GET /api/trending-sounds?provider={provider}&region={region}
```
Fetches trending music from various providers.

**Parameters:**
- `provider` (optional): `itunes`, `deezer`, or `curated`
- `region` (optional): Region code (e.g., `US`, `UK`)

**Response:**
```json
{
  "sounds": [
    {
      "id": "123456",
      "title": "Flowers",
      "artist": "Miley Cyrus",
      "durationSec": 200,
      "audioUrl": "https://preview.music.apple.com/...",
      "source": "itunes"
    }
  ]
}
```

### Video Processing

#### Upload Video to Cloud Storage
```
POST /api/upload-to-gcs
```
Uploads a video file to Google Cloud Storage with CDN optimization.

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `video` field

**Response:**
```json
{
  "url": "https://storage.googleapis.com/bucket/videos/uuid.mp4",
  "fileName": "videos/uuid.mp4",
  "originalName": "video.mp4",
  "size": 3203183,
  "uploadedAt": "2025-08-10T12:00:00.000Z"
}
```

#### Merge Audio with Video
```
POST /api/merge-audio
```
Merges selected audio track with video file.

**Request:**
```json
{
  "videoUrl": "https://storage.googleapis.com/...",
  "audioUrl": "https://preview.music.apple.com/...",
  "startTime": 0,
  "endTime": 30
}
```

**Response:**
```json
{
  "mergedVideoUrl": "https://storage.googleapis.com/bucket/merged/uuid.mp4",
  "processingTime": 45.2
}
```

### YouTube Publishing

#### Publish Video to YouTube
```
POST /api/publish-to-youtube
```
Publishes a video to YouTube with comprehensive metadata control.

**Request:**
```json
{
  "videoUrl": "https://storage.googleapis.com/bucket/videos/uuid.mp4",
  "title": "AI Generated Video - Demo",
  "description": "Professional AI-generated video with captions...",
  "tags": ["AI", "Video", "Content", "VEO3"],
  "privacy": "public",
  "categoryId": "22"
}
```

**Response:**
```json
{
  "success": true,
  "videoId": "dQw4w9WgXcQ",
  "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "AI Generated Video - Demo",
  "uploadedAt": "2025-08-10T12:00:00.000Z"
}
```

### Video Generation

#### Start Video Generation Job
```
POST /api/generate
```
Starts an AI video generation job using Veo-3 or VideoCrafter.

**Request:**
```json
{
  "prompt": "A serene mountain landscape at sunset...",
  "duration": 10,
  "model": "veo-3",
  "aspectRatio": "16:9"
}
```

**Response:**
```json
{
  "jobId": "job_123456",
  "status": "processing",
  "estimatedTime": 120
}
```

#### Check Job Status
```
GET /api/jobs/{jobId}
```
Checks the status of a video generation job.

**Response:**
```json
{
  "jobId": "job_123456",
  "status": "completed",
  "videoUrl": "https://storage.googleapis.com/bucket/generated/uuid.mp4",
  "progress": 100,
  "processingTime": 95.4
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-10T12:00:00.000Z"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Authentication

### YouTube OAuth
YouTube publishing requires OAuth 2.0 authentication:

1. User initiates OAuth flow via `/auth/youtube`
2. User grants permissions on Google's consent screen
3. Server receives authorization code and exchanges for tokens
4. Tokens are automatically refreshed as needed

### Service Account
Google Cloud Storage operations use service account authentication:
- Service account key stored as environment variable
- Automatic authentication for GCS operations
- No user interaction required
```json
{
  "videoUrl": "https://storage.googleapis.com/bucket/videos/uuid.mp4",
  "title": "Video Title",
  "description": "Video description",
  "tags": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "success": true,
  "videoId": "EuVg4MIcPrw",
  "youtubeUrl": "https://www.youtube.com/watch?v=EuVg4MIcPrw",
  "channelId": "UCWiQ30TlCyLtMozg--hIHEg",
  "title": "Video Title",
  "privacy": "unlisted",
  "uploadTime": "2025-08-09T23:54:16.691Z",
  "message": "Video successfully published to YouTube!",
  "demoMode": false
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Authentication

- **Google Cloud Storage:** Service account key authentication
- **YouTube API:** OAuth 2.0 with automatic token refresh
