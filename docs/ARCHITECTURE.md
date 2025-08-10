# Architecture Overview

System design and architecture for Viral-Veo with integrated Remotion video editor and Apple Music integration.

## High-Level Architecture

```
Frontend (React/Vite)  ←→  Backend (Express.js)  ←→  External Services
     ↓                           ↓                           ↓
- Video Gallery UI           - File Upload API          - Google Cloud Storage
- Remotion Video Editor      - YouTube Publishing         - YouTube Data API v3
- Apple Music Integration    - Trending Sounds API        - iTunes/Deezer APIs
- Progress Tracking          - Token Management           - OAuth 2.0
- Professional Publishing    - Remotion Rendering         - Veo-3 AI Model
```

## Technology Stack

### Frontend Architecture
- **React 19** - Modern UI framework with concurrent features
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Fast build tool with HMR for development
- **Tailwind CSS** - Utility-first styling with custom black/white theme
- **Remotion Player** - Real-time video preview and editing
- **React Dropzone** - File upload interface with drag & drop

### Backend Architecture
- **Express.js** - Web framework with comprehensive API routes
- **TypeScript** - Full-stack type safety
- **Multer** - Multipart file upload handling
- **Google Cloud Storage** - Scalable video file storage
- **YouTube Data API v3** - Video publishing and metadata management
- **Google Auth Library** - OAuth 2.0 authentication flows
- **Remotion Renderer** - Server-side video processing

### Video Processing Pipeline
- **Remotion Engine** - Professional video composition and rendering
- **FFmpeg** - Video encoding and format conversion
- **Caption System** - Precision-timed subtitle overlays
- **Aspect Ratio Engine** - Dynamic video format conversion (16:9, 9:16, 1:1)
- **Audio Integration** - Apple Music trending sounds merging

### External Integrations
- **Google Cloud Platform** - Infrastructure and storage
- **YouTube Data API** - Video publishing platform
- **Apple Music APIs** - iTunes and Deezer for trending sounds
- **Google Veo-3** - AI video generation model
- **OAuth 2.0** - Secure authentication flows

## Data Flow

### Video Generation & Editing Pipeline

1. **Video Generation**
   - User inputs prompt for AI video generation
   - System generates video using Veo-3 or VideoCrafter
   - Generated video stored in temporary location

2. **Professional Editing Phase**
   - Video automatically opens in Remotion Editor
   - User adds captions with precise timing controls
   - User selects aspect ratio (16:9, 9:16, 1:1)
   - User browses and selects trending music from Apple Music APIs
   - Real-time preview with all edits applied

3. **Publishing Pipeline**
   - User clicks export to open YouTube publishing modal
   - Professional form with title, description, tags, privacy settings
   - Video renders with all edits applied (captions, aspect ratio, audio)
   - Automatic upload to YouTube with metadata
   - User remains in editor for continued editing

### Apple Music Integration Pipeline

1. **API Data Fetching**
   - Frontend calls `/api/trending-sounds` with provider parameter
   - Backend fetches from iTunes API for trending sounds
   - Backend fetches from Deezer API for popular sounds
   - Real-time search and filtering in UI

2. **Audio Integration**
   - User selects song from trending/popular lists
   - Audio merging API processes video + selected audio
   - Preview available in Remotion editor
   - Final export includes synchronized audio

### YouTube Publishing Pipeline

1. **Enhanced Publishing Modal**
   - User clicks "Publish to YouTube" in export menu
   - Professional modal opens with pre-filled metadata
   - User customizes title, description, tags, privacy, category
   - Optional thumbnail upload support

2. **Publishing Process**
   - OAuth 2.0 authentication flow (auto-refresh tokens)
   - Video upload with comprehensive metadata
   - Success feedback without leaving editor
   - Continued editing workflow maintained
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
