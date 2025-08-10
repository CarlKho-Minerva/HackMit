/**
 * Test script for the multi-shot prompt system
 * Run this to verify the fake generation workflow
 */

import { startFakeGeneration, getFakeJob } from '../source/fakeVideoGeneration.js';

async function testFakeGeneration() {
  console.log('🎬 Testing Fake Video Generation System');
  console.log('=====================================');

  const testPrompt = "A majestic cat dancing in a cyberpunk alleyway";
  console.log(`📝 Test prompt: "${testPrompt}"`);

  // Start fake generation
  const jobId = startFakeGeneration(testPrompt);
  console.log(`🆔 Job ID: ${jobId}`);

  // Poll for completion
  console.log('⏳ Polling for completion...');

  const pollInterval = setInterval(() => {
    const job = getFakeJob(jobId);
    if (job) {
      console.log(`📊 Status: ${job.status} | Progress: ${job.progress}%`);

      if (job.status === 'completed') {
        console.log(`✅ Generation complete!`);
        console.log(`🎥 Video URL: ${job.videoUrl}`);
        clearInterval(pollInterval);

        console.log('\n🎉 Test completed successfully!');
        console.log('The fake generation system is working correctly.');

        process.exit(0);
      } else if (job.status === 'error') {
        console.log('❌ Generation failed');
        clearInterval(pollInterval);
        process.exit(1);
      }
    }
  }, 1000);

  // Timeout after 30 seconds
  setTimeout(() => {
    console.log('⏰ Test timeout - this should not happen');
    clearInterval(pollInterval);
    process.exit(1);
  }, 30000);
}

testFakeGeneration().catch(console.error);
