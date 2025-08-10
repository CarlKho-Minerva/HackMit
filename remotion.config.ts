/**
 *Config.setConcurrency(1);
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Config.setPort(3004); // Let Remotion auto-select portcense
 * SPDX-License-Identifier: Apache-2.0
 */
import { Config } from '@remotion/cli/config';

Config.setConcurrency(1);
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPort(3003); // Use different port than Express server

// Set up browser executable for rendering
Config.setBrowserExecutable(null);

// Configure encoding settings for web-optimized videos
Config.setCodec('h264');
Config.setCrf(23);
Config.setPixelFormat('yuv420p');

// Configure audio settings
Config.setAudioCodec('aac');
Config.setAudioBitrate('128000');

// Performance settings
Config.setChromiumOpenGlRenderer('egl');
Config.setScale(1);

// Output settings
Config.setPublicDir('./public');
