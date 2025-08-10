# Veo-3 Gallery

A professional AI video generation and publishing platform built for HackMIT 2025. Generate videos with Google's Veo-3 AI and automatically publish them to YouTube through a complete cloud pipeline.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run start:all

# Visit the application
open http://localhost:5173
```

## 📁 Project Structure

```
veo-3-gallery/
├── components/          # React components
│   ├── VideoUploader.tsx   # Upload & YouTube publishing interface
│   ├── VideoGrid.tsx       # Gallery view
│   └── ...
├── server/             # Express.js backend
│   ├── routes/            # API endpoints
│   └── server.ts          # Main server
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── README.md          # This file
```

## ✨ Features

- **🤖 AI Video Generation** - Generate videos using Google's Veo-3 model
- **☁️ Cloud Storage** - Automatic upload to Google Cloud Storage
- **🎬 YouTube Publishing** - Direct publishing to your YouTube channel
- **🎨 Professional UI** - Drag & drop interface with real-time progress
- **🔄 Auto Token Refresh** - Seamless YouTube API authentication

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- Google Cloud Platform account
- YouTube channel

### Configuration
1. Copy `.env.example` to `.env`
2. Follow setup guide in `docs/SETUP.md`
3. Configure Google Cloud and YouTube API credentials

## 📚 Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete setup instructions
- **[API Reference](docs/API.md)** - Backend API documentation
- **[Architecture](docs/ARCHITECTURE.md)** - System design overview

## 🎯 Scripts

- `npm run dev` - Start frontend only
- `npm run server:dev` - Start backend only
- `npm run start:all` - Start both frontend and backend
- `npm run build` - Build for production

## 🏆 HackMIT Demo

This project demonstrates:
- Real cloud integration (Google Cloud Storage)
- AI model integration (Veo-3)
- Third-party API integration (YouTube)
- Professional full-stack architecture
- Production-ready authentication flow

## 🔐 Security

- Service account keys are never committed
- YouTube tokens auto-refresh
- Environment variables for all secrets
- Proper CORS configuration

---

Built with ❤️ for HackMIT 2025
