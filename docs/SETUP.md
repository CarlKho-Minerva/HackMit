# Setup Guide

Complete setup instructions for Veo-3 Gallery.

## Prerequisites

- Node.js 18+
- Google Cloud Platform account
- YouTube channel

## Installation

```bash
git clone <your-repo>
cd veo-3-gallery
npm install
```

## Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables in `.env`:

   ```env
   # Gemini API Key (for Veo-3 generation)
   GEMINI_API_KEY=your_gemini_api_key

   # Google Cloud Storage
   GCS_PROJECT_ID=your-gcp-project-id
   GCS_BUCKET_NAME=your-bucket-name
   GCS_KEY_FILE=./service-account-key.json

   # YouTube API
   YOUTUBE_CLIENT_ID=your-client-id
   YOUTUBE_CLIENT_SECRET=your-client-secret
   YOUTUBE_ACCESS_TOKEN=your-access-token
   YOUTUBE_REFRESH_TOKEN=your-refresh-token
   ```

## Google Cloud Setup

### 1. Create GCP Project
```bash
gcloud projects create your-project-id
gcloud config set project your-project-id
```

### 2. Enable APIs
```bash
gcloud services enable storage.googleapis.com
gcloud services enable youtube.googleapis.com
```

### 3. Create Storage Bucket
```bash
gsutil mb gs://your-bucket-name
gsutil iam ch allUsers:objectViewer gs://your-bucket-name
```

### 4. Service Account
```bash
gcloud iam service-accounts create video-uploader
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:video-uploader@your-project-id.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
gcloud iam service-accounts keys create ./service-account-key.json \
  --iam-account=video-uploader@your-project-id.iam.gserviceaccount.com
```

## YouTube API Setup

### 1. OAuth Credentials
1. Visit [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `http://localhost:3001/auth/youtube/callback`

### 2. Get Access Tokens
1. Visit [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Configure with your credentials
3. Select YouTube Data API v3 scope: `https://www.googleapis.com/auth/youtube.upload`
4. Get access and refresh tokens

## Running the Application

```bash
# Start both frontend and backend
npm run start:all

# Or separately:
npm run dev        # Frontend only
npm run server:dev # Backend only
```

## Testing

```bash
# Test the complete pipeline
node scripts/test-pipeline.js
```

## Security Notes

- Never commit service account keys
- Add sensitive files to `.gitignore`
- YouTube tokens auto-refresh
- Use environment variables for all secrets
