#!/usr/bin/env node

/**
 * Test real YouTube upload with your credentials
 */

import fs from 'fs';

async function testRealYouTube() {
  const baseUrl = 'http://localhost:3001';

  console.log('🎬 Testing REAL YouTube upload to your channel...\n');

  try {
    // First, upload a video to GCS
    const videoPath = './Shrek_Dancing_Video_Generated.mp4';
    if (!fs.existsSync(videoPath)) {
      console.log('⚠️  Using a test video since Shrek video not found');
      console.log('   You can test with any video file in your directory');
      return;
    }

    console.log('1. 📁 Uploading to Google Cloud Storage...');
    const formData = new FormData();
    const videoBuffer = fs.readFileSync(videoPath);
    const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
    formData.append('video', videoBlob, 'shrek-dancing-hackMIT-demo.mp4');

    const uploadResponse = await fetch(`${baseUrl}/api/upload-to-gcs`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('GCS upload failed');
    }

    const uploadData = await uploadResponse.json();
    console.log('✅ GCS upload successful:', uploadData.url);

    console.log('\n2. 🎬 Publishing to YOUR YouTube channel...');
    const publishResponse = await fetch(`${baseUrl}/api/publish-to-youtube`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoUrl: uploadData.url,
        title: 'HackMIT 2025 Demo - AI Generated Video with Veo-3',
        description: `This video was automatically generated using Google's Veo-3 AI model and uploaded through our custom pipeline built for HackMIT 2025!

🤖 Generated with: Veo-3 AI
🏗️ Built by: Carl Kho
🏆 For: HackMIT 2025
🔗 Upload Pipeline: Custom GCS + YouTube API integration

This demonstrates a complete end-to-end AI video generation and publishing system.`,
        tags: ['HackMIT', 'AI', 'Veo-3', 'Google', 'machine-learning', 'video-generation', 'hackathon', 'demo'],
      }),
    });

    if (publishResponse.ok) {
      const publishData = await publishResponse.json();
      console.log('\n🎉 SUCCESS! Video published to your YouTube channel!');
      console.log('🔗 YouTube URL:', publishData.youtubeUrl);
      console.log('📺 Video ID:', publishData.videoId);
      console.log('🔒 Privacy:', publishData.privacy);
      console.log('📅 Upload Time:', publishData.uploadTime);

      console.log('\n✨ Click the link to see your video on YouTube! ✨');
      console.log('\n🏆 Perfect for your HackMIT demo - you now have a real, working YouTube publishing pipeline!');

    } else {
      const error = await publishResponse.json();
      console.log('❌ YouTube publishing failed:', error);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testRealYouTube();
