#!/usr/bin/env node

/**
 * Quick test script to verify GCS upload is working
 */

import fs from 'fs';
import path from 'path';

async function testGCSUpload() {
  const baseUrl = 'http://localhost:3001';

  console.log('🔍 Testing GCS upload endpoint...\n');

  try {
    // First test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Check if we have a test video file
    const videoPath = './Shrek_Dancing_Video_Generated.mp4';
    if (!fs.existsSync(videoPath)) {
      console.log('⚠️  No test video found. Please add a video file to test upload.');
      console.log('   You can use any .mp4 file for testing.');
      return;
    }

    console.log('\n2. Testing video upload to GCS...');
    const formData = new FormData();
    const videoBuffer = fs.readFileSync(videoPath);
    const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
    formData.append('video', videoBlob, 'test-video.mp4');

    console.log('📁 Uploading video file...');
    const uploadResponse = await fetch(`${baseUrl}/api/upload-to-gcs`, {
      method: 'POST',
      body: formData,
    });

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('✅ Upload successful!');
      console.log('🔗 GCS URL:', uploadData.url);
      console.log('📋 File details:', {
        fileName: uploadData.fileName,
        originalName: uploadData.originalName,
        size: uploadData.size
      });

      // Test if the file is accessible
      console.log('\n3. Testing file accessibility...');
      const fileResponse = await fetch(uploadData.url);
      if (fileResponse.ok) {
        console.log('✅ File is publicly accessible');
      } else {
        console.log('❌ File is not accessible:', fileResponse.status);
      }
    } else {
      const error = await uploadResponse.json();
      console.log('❌ Upload failed:', error);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.message.includes('fetch')) {
      console.log('💡 Make sure the server is running: npm run server:dev');
    }
  }
}

testGCSUpload();
