#!/usr/bin/env node

/**
 * Simple YouTube token refresh script
 */

import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function refreshYouTubeToken() {
  try {
    console.log('🔄 Refreshing YouTube access token...\n');

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/auth/youtube/callback'
    );

    // Set existing credentials
    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
    });

    console.log('🎯 Using refresh token:', process.env.YOUTUBE_REFRESH_TOKEN?.substring(0, 20) + '...');

    // Try to refresh the access token
    const { credentials } = await oauth2Client.refreshAccessToken();

    console.log('✅ Token refresh successful!');
    console.log('🔑 New access token:', credentials.access_token?.substring(0, 20) + '...');

    if (credentials.refresh_token) {
      console.log('🔄 New refresh token:', credentials.refresh_token?.substring(0, 20) + '...');
    }

    console.log('\n📝 Update your .env file with the new access token:');
    console.log('YOUTUBE_ACCESS_TOKEN=' + credentials.access_token);

    if (credentials.refresh_token) {
      console.log('YOUTUBE_REFRESH_TOKEN=' + credentials.refresh_token);
    }

    // Test the token by getting user's channel info
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    const channelResponse = await youtube.channels.list({
      part: ['snippet'],
      mine: true,
    });

    if (channelResponse.data.items && channelResponse.data.items.length > 0) {
      const channel = channelResponse.data.items[0];
      console.log('\n🎬 Successfully authenticated with YouTube!');
      console.log('📺 Channel:', channel.snippet?.title);
      console.log('🆔 Channel ID:', channel.id);
    }

  } catch (error) {
    console.error('❌ Token refresh failed:', error.message);

    if (error.message.includes('invalid_grant')) {
      console.log('\n🚨 The refresh token has expired or is invalid.');
      console.log('📋 You need to re-run the full OAuth setup:');
      console.log('1. Stop the current server (Ctrl+C)');
      console.log('2. Run: node scripts/setup-youtube-oauth.mjs');
      console.log('3. Follow the browser authentication flow');
    }
  }
}

refreshYouTubeToken();
