# Viral-Veo

A professional AI video generation and editing platform with integrated Remotion video editor. Generate videos with Google's Veo-3 AI, edit them with professional captions and aspect ratios, then automatically publish to YouTube through a complete cloud pipeline.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run start:all

# Visit the application
open http://localhost:5173
```

## ✨ Key Features

- **🤖 AI Video Generation** - Generate videos using Google's Veo-3 model
- **🎬 Professional Video Editor** - Built-in Remotion editor with timeline, captions, and aspect ratio control
- **🎵 Apple Music Integration** - Real trending sounds from iTunes and Deezer APIs
- **☁️ Cloud Storage** - Automatic upload to Google Cloud Storage
- **📺 YouTube Publishing** - Professional publishing modal with metadata control
- **🎨 Modern UI** - Black/white theme with grid design system
- **🔄 Auto Token Refresh** - Seamless YouTube API authentication

## 🎞️ Video Editor Features

### Professional Editing Suite
- **Timeline Editor**: Visual timeline with caption blocks and playhead scrubbing
- **Caption System**: Add, edit, remove captions with precise timing controls
- **Aspect Ratios**: 16:9 (YouTube), 9:16 (TikTok/Shorts), 1:1 (Instagram)
- **Real-time Preview**: Live preview with caption overlays
- **Audio Integration**: Apple Music trending sounds with search and filtering

### Advanced Publishing
- **YouTube Modal**: Professional publishing interface with title, description, tags, privacy
- **Metadata Control**: Category selection, thumbnail upload, visibility settings
- **Export Options**: Multiple export formats and quality settings
- **Stay-in-Editor**: Seamless publishing without workflow disruption

### Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys:
# GEMINI_API_KEY=your_gemini_api_key
# VITE_RUNPOD_BASE=your_runpod_url
# GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### Video Generation & Editing Pipeline

This project supports multiple video generation and editing methods:

- **Veo-3**: Google's latest AI video model (requires paid tier)
- **VideoCrafter**: Runpod NVIDIA A100 GPU running [VideoCrafter model](https://github.com/AILab-CVC/VideoCrafter)
- **Remotion Editor**: Professional video editing with captions, aspect ratios, and timeline
- **Apple Music Integration**: Real trending sounds from iTunes and Deezer APIs
- **YouTube Publishing**: Professional publishing modal with metadata control

## 📁 Project Structure

```bash
veo-3-gallery/
├── components/              # React Components
│   ├── RemotionVideoEditor.tsx    # Professional video editor with timeline
│   ├── AppleMusicTrendingSounds.tsx # Apple Music integration with API
│   ├── YouTubePostModal.tsx       # Professional YouTube publishing modal
│   ├── FakeLoadingScreen.tsx      # Demo loading experience
│   ├── VideoUploader.tsx          # Upload & publishing interface
│   ├── VideoGrid.tsx              # Gallery view with modern cards
│   ├── VideoPlayer.tsx            # Enhanced video player
│   ├── PromptEnhancer.tsx         # AI prompt improvement
│   └── ...
├── remotion/               # Remotion Video Engine
│   ├── compositions/         # Video compositions
│   │   ├── CaptionedVideo.tsx    # Video with caption overlays
│   │   └── EditableVideo.tsx     # Editable video composition
│   ├── components/           # Remotion components
│   │   └── Caption.tsx           # Caption rendering component
│   └── Root.tsx             # Remotion root configuration
├── server/                 # Express.js Backend
│   ├── routes/               # API endpoints
│   │   ├── trending-sounds.ts    # Apple Music API integration
│   │   ├── publish-to-youtube.ts # YouTube publishing
│   │   ├── upload-to-gcs.ts     # Google Cloud Storage
│   │   └── remotion-render.ts   # Video rendering
│   └── server.ts            # Main server with full API
├── source/                 # Core Logic
│   ├── api.ts               # API client with all endpoints
│   ├── geminiPromptEnhancer.ts   # AI prompt enhancement
│   └── fakeVideoGeneration.ts   # Demo video generation
├── docs/                   # Documentation
│   ├── SETUP.md             # Complete setup guide
│   ├── ARCHITECTURE.md      # System architecture
│   ├── REMOTION_INTEGRATION.md  # Video editor docs
│   └── API.md               # API reference
├── scripts/                # Utility Scripts
│   ├── setup-youtube-oauth.mjs  # YouTube OAuth setup
│   ├── test-complete-flow.mjs   # End-to-end testing
│   └── quick-youtube-test.mjs   # YouTube API testing
└── README.md               # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework with latest features
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling with custom black/white theme
- **Remotion** - Professional video editing and rendering engine

### Backend
- **Express.js** - Web framework with comprehensive API
- **TypeScript** - Type safety across the stack
- **Multer** - File upload handling
- **Google Cloud Storage** - Scalable file storage
- **YouTube Data API v3** - Video publishing integration
- **Google Auth Library** - OAuth management

### Video & Audio
- **Remotion Player** - Real-time video preview
- **FFmpeg** - Video processing and conversion
- **Apple Music API** - Trending sounds integration (iTunes/Deezer)
- **Google Veo-3** - AI video generation
- **Caption System** - Precision-timed subtitle overlays

## 🎯 Scripts

- `npm run dev` - Start frontend development server
- `npm run server:dev` - Start backend with hot reload
- `npm run start:all` - Start both frontend and backend concurrently
- `npm run build` - Build for production
- `npm run remotion:studio` - Open Remotion Studio for video editing
- `npm run test:youtube` - Test YouTube API integration
- `npm run setup:youtube` - Set up YouTube OAuth credentials

## � Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete setup instructions with API keys
- **[API Reference](docs/API.md)** - Backend API documentation
- **[Architecture](docs/ARCHITECTURE.md)** - System design overview
- **[Remotion Integration](docs/REMOTION_INTEGRATION.md)** - Video editor documentation
- **[Sample Prompts](docs/Sample%20Veo3%20Prompts.md)** - Example video generation prompts

## �🚀 Demo Features

This project demonstrates:

- **Real Cloud Integration** - Google Cloud Storage with proper authentication
- **AI Model Integration** - Google Veo-3 for video generation
- **Professional Video Editing** - Timeline-based editor with Remotion
- **Third-party API Integration** - YouTube publishing and Apple Music
- **Modern Full-stack Architecture** - React 19 + Express.js + TypeScript
- **Production-ready Authentication** - OAuth flows with auto-refresh
- **Professional UI/UX** - Black/white design system with responsive layout

## 🔐 Security & Best Practices

- Service account keys are never committed to version control
- YouTube tokens auto-refresh for seamless experience
- Environment variables for all secrets and API keys
- Proper CORS configuration for production deployment
- TypeScript for type safety across the entire stack
- Error handling and graceful fallbacks throughout

## 🎬 Video Pipeline Flow

1. **Generate** - AI video generation with Veo-3 or VideoCrafter
2. **Edit** - Professional editing with Remotion (captions, aspect ratios, audio)
3. **Preview** - Real-time preview with timeline scrubbing
4. **Publish** - Professional YouTube publishing with metadata control
5. **Share** - Cloud-hosted videos ready for social media

---

Built with ❤️ - Showcasing the future of AI-powered video creation
