#!/usr/bin/env node

/**
 * Quick YouTube upload test with the correct GCS URL
 */

async function testYouTubeUpload() {
  const baseUrl = 'http://localhost:3001';

  console.log('🎬 Testing YouTube upload with the correct GCS video URL...\n');

  try {
    console.log('🎬 Publishing to YouTube...');
    const publishResponse = await fetch(`${baseUrl}/api/publish-to-youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl: 'https://storage.googleapis.com/veo-3-gallery-hack-mit-468523/videos/832dca4c-55ea-4457-a19f-81a721e80acd.mp4',
        title: 'AI Video Demo - Created with Veo-3',
        description: `🎬 AI Generated Video Demo

📊 Technology Showcase:
• Video Generation: Google Veo-3 AI Model
• Processing: Professional editing pipeline
• Publishing: Automated YouTube integration

🚀 Features:
• AI-Enhanced video generation
• Professional editing tools
• Multi-platform optimization
• One-click publishing workflow

💡 Demonstrating the future of content creation!

---
#AI #VideoGeneration #Veo3 #ContentCreation #Automation`,
        tags: ['AI', 'Veo-3', 'demo', 'video-generation'],
      }),
    });

    if (publishResponse.ok) {
      const publishData = await publishResponse.json();
      console.log('\n🎉 SUCCESS! Video published to YouTube!');
      console.log('🔗 YouTube URL:', publishData.youtubeUrl);
      console.log('📺 Video ID:', publishData.videoId);
      console.log('📝 Title:', publishData.title);
      console.log('🔒 Privacy:', publishData.privacy);

      console.log('\n✨ Perfect! Your demo is ready with REAL YouTube uploads! ✨');

    } else {
      const error = await publishResponse.json();
      console.log('❌ YouTube publishing failed:', error);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testYouTubeUpload();
