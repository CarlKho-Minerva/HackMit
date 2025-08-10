#!/usr/bin/env node

/**
 * Quick OAuth setup helper for YouTube API
 */

import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';
import readline from 'readline';

async function setupYouTubeOAuth() {
  console.log('🎬 YouTube OAuth Setup Helper\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  try {
    console.log('📋 First, you need to create OAuth 2.0 credentials:');
    console.log('1. Visit: https://console.cloud.google.com/apis/credentials?project=hack-mit-468523');
    console.log('2. Click "Create Credentials" → "OAuth 2.0 Client IDs"');
    console.log('3. Choose "Web application"');
    console.log('4. Name: "Veo Gallery YouTube"');
    console.log('5. Authorized redirect URIs: http://localhost:3001/auth/youtube/callback');
    console.log('6. Click "Create" and copy the Client ID and Client Secret\n');

    const clientId = await question('Enter your Client ID: ');
    const clientSecret = await question('Enter your Client Secret: ');

    console.log('\n🔗 Setting up OAuth flow...\n');

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3001/auth/youtube/callback'
    );

    // Generate the auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload'],
      prompt: 'consent'
    });

    console.log('🌐 Opening authorization URL in your browser...');
    console.log('If it doesn\'t open automatically, visit:');
    console.log(authUrl);
    console.log('');

    // Open the auth URL
    const { exec } = await import('child_process');
    exec(`open "${authUrl}"`);

    // Set up a temporary server to catch the callback
    const server = http.createServer(async (req, res) => {
      if (req.url?.startsWith('/auth/youtube/callback')) {
        const url = new URL(req.url, 'http://localhost:3001');
        const code = url.searchParams.get('code');

        if (code) {
          try {
            console.log('✅ Authorization code received, exchanging for tokens...');

            // Use getToken instead of getAccessToken for the initial exchange
            const { tokens } = await oauth2Client.getToken(code);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: Arial; padding: 50px; text-align: center;">
                  <h1>✅ Success!</h1>
                  <p>YouTube authorization complete. You can close this window.</p>
                  <p>Check your terminal for the next steps.</p>
                </body>
              </html>
            `);

            console.log('\n🎉 SUCCESS! Here are your YouTube API credentials:');
            console.log('\n📋 Add these to your .env file:');
            console.log(`YOUTUBE_CLIENT_ID=${clientId}`);
            console.log(`YOUTUBE_CLIENT_SECRET=${clientSecret}`);
            console.log(`YOUTUBE_ACCESS_TOKEN=${tokens.access_token}`);
            console.log(`YOUTUBE_REFRESH_TOKEN=${tokens.refresh_token}`);

            console.log('\n✨ Your server will automatically restart and use real YouTube API!');

            server.close();
            rl.close();

          } catch (error) {
            console.error('❌ Error getting tokens:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error getting tokens');
          }
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('No authorization code received');
        }
      }
    });

    server.listen(3001, () => {
      console.log('🔄 Waiting for authorization... (complete the steps in your browser)');
    });

  } catch (error) {
    console.error('❌ Setup failed:', error);
    rl.close();
  }
}

setupYouTubeOAuth();
