/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Request, Response } from 'express';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function renderRemotionVideo(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    videoSrc,
    aspectRatio,
    captions,
    title,
    subtitleStyle
  } = req.body;

  try {
    console.log('Starting Remotion render process...');

    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.join(process.cwd(), 'remotion/index.ts'),
      // webpackOverride: (config) => config, // Add custom webpack config if needed
    });

    console.log('Bundle created at:', bundleLocation);

    // Get composition ID based on aspect ratio
    const compositionId = `EditableVideo-${aspectRatio.replace(':', '-')}`;

    // Select the composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        videoSrc,
        aspectRatio,
        captions,
        title,
        subtitleStyle,
      },
    });

    console.log('Composition selected:', composition.id);

    // Generate unique output filename
    const outputFilename = `edited-video-${uuidv4()}.mp4`;
    const outputPath = path.join(process.cwd(), 'public/temp', outputFilename);

    // Ensure temp directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Render the video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        videoSrc,
        aspectRatio,
        captions,
        title,
        subtitleStyle,
      },
      onProgress: (progress) => {
        console.log(`Render progress: ${Math.round(progress.progress * 100)}%`);
      },
    });

    console.log('Video rendered successfully:', outputPath);

    // Return the public URL
    const publicUrl = `/temp/${outputFilename}`;

    res.status(200).json({
      success: true,
      videoUrl: publicUrl,
      message: 'Video rendered successfully'
    });

  } catch (error) {
    console.error('Remotion render error:', error);
    res.status(500).json({
      error: 'Failed to render video',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
