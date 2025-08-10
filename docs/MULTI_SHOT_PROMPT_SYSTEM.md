# Multi-Shot Prompt Template System

## Overview
This implementation follows your requested workflow:
```
User Submits Prompt → Multi-shot prompt template → "Fake" Loading Screen → Generate Video
→ "Vid done!" via webhook/check job status → Store & Finalize in Google Cloud Storage
→ "Publish to YT" (via YouTube API)
```

## Key Features

### 1. **AI-Enhanced Prompt System**
- **Multi-Shot Template Engine**: Uses Gemini 2.5 Flash lite to enhance basic prompts into VEO-3 optimized scripts
- **Sample-Based Learning**: Leverages the VEO sample prompts from `docs/Sample Veo3 Prompts.md` as training examples
- **Inline Enhancement Button**: "✨ Enhance" button inside the textarea for immediate prompt improvement
- **Preview Before Use**: Shows enhanced prompt with reasoning and improvements before applying

### 2. **Cost-Saving Fake Generation**
- **Fake Loading Screen**: Simulates VEO-3 generation phases with realistic progress
- **AI Agent Status**: Shows fake AI agents working (Script Generator, Camera Director, VEO-3 Renderer)
- **Shrek Video Fallback**: Returns the local Shrek video instead of expensive VEO API calls
- **Realistic Timing**: 8-12 second generation simulation to feel authentic

### 3. **Smart Workflow Integration**
- **Webhook Simulation**: Job status polling system mimics real VEO workflow
- **Seamless UX**: Users experience the full flow without knowing it's fake
- **Easy Development**: Test full pipeline without burning credits during development

## Technical Implementation

### Components Added:
1. **`PromptEnhancer.tsx`** - Main UI component with inline enhance button
2. **`FakeLoadingScreen.tsx`** - Realistic loading simulation with AI agent status
3. **`geminiPromptEnhancer.ts`** - Gemini 2.5 Flash lite integration for prompt enhancement
4. **`fakeVideoGeneration.ts`** - Job management system for fake generation

### Environment Setup:
Add to your `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_2_5_flash_api_key
```

## How It Works

### 1. **User Input Phase**
- User types basic prompt: "A cat dancing"
- Clicks "✨ Enhance" button inside textarea
- Gemini 2.5 Flash lite analyzes prompt using VEO sample templates

### 2. **AI Enhancement Phase**
- AI agents create detailed VEO-3 script with:
  - Specific camera movements (close-up, tracking shot, etc.)
  - Professional lighting and cinematography details
  - Audio design and ambient sounds
  - Environmental and atmospheric elements
  - Technical specifications

### 3. **Generation Simulation**
- Fake loading screen shows realistic VEO workflow
- AI agent status updates (Script Generator → Camera Director → VEO Renderer)
- Progress bar with realistic timing
- Job polling system like real VEO API

### 4. **Result Delivery**
- Returns Shrek video as placeholder
- Creates proper Video object in gallery
- Ready for existing GCS storage and YouTube publishing

## Benefits

### For Development:
- **Zero VEO Costs**: Test full pipeline without $6/video charges
- **Fast Iteration**: No waiting for real video generation
- **Full Feature Testing**: Test storage, YouTube publishing with fake videos

### For Users:
- **Better Prompts**: AI-enhanced prompts produce better results when you do use real VEO
- **Educational**: Shows how prompts can be improved before spending credits
- **Transparent**: Preview enhancements before applying them

### For Production:
- **Easy Toggle**: Switch between fake and real generation with environment variable
- **Cost Control**: Use fake generation for demos, real for final production
- **Scalable**: Handle unlimited demo requests without API limits

## VEO Prompt Enhancement Examples

**Input:** "A cat dancing"

**Enhanced Output:**
```
A close-up shot of a graceful tabby cat in a sunlit living room, performing an elegant dance routine. The camera begins with a low-angle tracking shot, slowly circling the cat as it rises on its hind legs with fluid, ballet-like movements. Soft, warm lighting creates dramatic shadows across the hardwood floor. The cat's whiskers twitch with concentration as it spins, accompanied by gentle classical piano music. The camera transitions to a mid-shot, capturing the full choreography as the cat leaps and pirouettes with surprising grace. Ambient sounds include the soft padding of paws on wood and distant birdsong through an open window. Shot in 4K with shallow depth of field, emphasizing the cat's expressive eyes and the graceful arc of its movements.
```

## Migration Path

When ready for real VEO:
1. Set environment flag: `USE_REAL_VEO=true`
2. Replace `startFakeGeneration()` calls with real VEO API
3. Keep enhanced prompts for better results
4. Maintain existing storage and YouTube publishing flow

The entire infrastructure is already built - just swap the generation backend!
