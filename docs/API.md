# API Reference

Backend API endpoints for Veo-3 Gallery.

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
  "timestamp": "2025-08-09T23:54:16.691Z"
}
```

### Upload Video to Cloud Storage
```
POST /api/upload-to-gcs
```
Uploads a video file to Google Cloud Storage.

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `video` field

**Response:**
```json
{
  "url": "https://storage.googleapis.com/bucket/videos/uuid.mp4",
  "fileName": "videos/uuid.mp4",
  "originalName": "video.mp4",
  "size": 3203183
}
```

### Publish to YouTube
```
POST /api/publish-to-youtube
```
Publishes a video from cloud storage to YouTube.

**Request:**
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
