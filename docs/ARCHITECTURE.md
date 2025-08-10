# Architecture Overview

System design and architecture for Veo-3 Gallery.

## High-Level Architecture

```
Frontend (React/Vite)  ←→  Backend (Express.js)  ←→  Google Cloud Services
     ↓                           ↓                           ↓
- Video Gallery UI           - File Upload API          - Cloud Storage
- Drag & Drop Upload        - YouTube Publishing         - YouTube Data API
- Progress Tracking         - Token Management           - OAuth 2.0
```

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Dropzone** - File upload interface

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Multer** - File upload handling
- **Google Cloud Storage** - File storage
- **YouTube Data API v3** - Video publishing
- **Google Auth Library** - OAuth management

### Infrastructure
- **Google Cloud Platform** - Cloud services
- **Google Cloud Storage** - Video file storage
- **YouTube Data API** - Video publishing
- **OAuth 2.0** - Authentication

## Data Flow

### Video Upload Pipeline
1. User drops video file in UI
2. Frontend sends file to `/api/upload-to-gcs`
3. Backend uploads to Google Cloud Storage
4. Returns public GCS URL to frontend
5. UI displays upload success with GCS URL

### YouTube Publishing Pipeline
1. User clicks "Publish to YouTube"
2. Frontend sends GCS URL to `/api/publish-to-youtube`
3. Backend downloads video from GCS
4. Authenticates with YouTube API using OAuth
5. Uploads video to YouTube channel
6. Returns YouTube URL to frontend
7. UI displays YouTube URL with copy/open buttons

## Security Model

### Authentication
- **Service Account** for Google Cloud Storage access
- **OAuth 2.0** for YouTube API access
- **Automatic token refresh** for YouTube API

### File Security
- Videos stored in **public GCS bucket** (demo purposes)
- YouTube videos uploaded as **unlisted** (shareable but not searchable)
- Service account keys stored locally (not in version control)

### Environment Variables
```
GEMINI_API_KEY           # Veo-3 AI generation
GCS_PROJECT_ID          # Google Cloud project
GCS_BUCKET_NAME         # Storage bucket
GCS_KEY_FILE           # Service account key path
YOUTUBE_CLIENT_ID       # OAuth client ID
YOUTUBE_CLIENT_SECRET   # OAuth client secret
YOUTUBE_ACCESS_TOKEN    # OAuth access token
YOUTUBE_REFRESH_TOKEN   # OAuth refresh token
```

## API Design

### RESTful Endpoints
- `GET /health` - Health check
- `POST /api/upload-to-gcs` - File upload
- `POST /api/publish-to-youtube` - Video publishing

### Response Format
All responses follow consistent JSON format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging
- Graceful fallback to demo mode

## Scalability Considerations

### Current Architecture
- Single server instance
- Direct file uploads
- Synchronous processing

### Production Improvements
- **Load balancing** for multiple server instances
- **Background job processing** for video uploads
- **CDN** for video delivery
- **Database** for metadata storage
- **Kubernetes** for container orchestration
- **Redis** for session management
