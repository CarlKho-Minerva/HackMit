#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Test script to verify Remotion setup
import { bundle } from '@remotion/bundler';
import { getCompositions } from '@remotion/renderer';
import path from 'path';

async function testRemotionSetup() {
  try {
    console.log('🎬 Testing Remotion setup...');

    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion/index.ts'),
    });

    console.log('✅ Bundle created successfully:', bundleLocation);

    const compositions = await getCompositions(bundleLocation);

    console.log('✅ Available compositions:');
    compositions.forEach((comp) => {
      console.log(`  - ${comp.id} (${comp.width}x${comp.height}, ${comp.durationInFrames} frames)`);
    });

    console.log('🎉 Remotion setup is working correctly!');

  } catch (error) {
    console.error('❌ Remotion setup failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testRemotionSetup();
}
