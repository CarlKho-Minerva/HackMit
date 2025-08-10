import { Request, Response } from 'express';
import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import ffmpeg from 'ffmpeg-static';

type MergeBody = {
  videoUrl: string;
  audioUrl?: string; // optional: remote audio to mix in
  audioChoice?: 'beep' | 'silence'; // simple built-in options
  volume?: number; // 0.0 - 2.0
};

// Helper to run a command and capture completion
function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${command} ${args.join(' ')} (code ${code})`));
    });
  });
}

export const mergeAudio = async (req: Request<unknown, unknown, MergeBody>, res: Response) => {
  try {
    const { videoUrl, audioUrl, audioChoice = 'beep', volume } = req.body || {} as MergeBody;
    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' });
    }

    // Prepare temp workspace
    const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'merge-audio-'));
    const videoPath = path.join(tmpRoot, 'input-video.mp4');
    const audioPath = audioUrl ? path.join(tmpRoot, 'input-audio') : undefined;
    const outputPath = path.join(tmpRoot, 'output.mp4');

    // Download video
    const vResp = await fetch(videoUrl);
    if (!vResp.ok) {
      return res.status(400).json({ error: `Failed to download video: ${vResp.status} ${vResp.statusText}` });
    }
    const vBuf = Buffer.from(await vResp.arrayBuffer());
    await fs.writeFile(videoPath, vBuf);

    // Optional: Download audio if audioUrl provided
    if (audioUrl && audioPath) {
      const aResp = await fetch(audioUrl);
      if (!aResp.ok) {
        return res.status(400).json({ error: `Failed to download audio: ${aResp.status} ${aResp.statusText}` });
      }
      // Try to infer extension from content-type
      const contentType = aResp.headers.get('content-type') || '';
      const ext = contentType.includes('mpeg') ? '.mp3' : contentType.includes('ogg') ? '.ogg' : contentType.includes('wav') ? '.wav' : '.mp3';
      const audioWithExt = audioPath + ext;
      const aBuf = Buffer.from(await aResp.arrayBuffer());
      await fs.writeFile(audioWithExt, aBuf);

      const args = [
        '-y',
        '-i', videoPath,
        '-i', audioWithExt,
        ...(typeof volume === 'number' ? ['-filter:a', `volume=${Math.max(0, Math.min(volume, 5))}`] : []),
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-shortest',
        '-map', '0:v:0',
        '-map', '1:a:0',
        outputPath,
      ];

      await runCommand(ffmpeg as string, args);
    } else {
      // Use a generated audio source via lavfi
      const lavfiInput = audioChoice === 'silence'
        ? 'anullsrc=channel_layout=stereo:sample_rate=44100'
        : 'sine=frequency=440:sample_rate=44100';

      const args = [
        '-y',
        '-i', videoPath,
        '-f', 'lavfi',
        '-t', '600', // long enough; we will trim to shortest
        '-i', lavfiInput,
        ...(typeof volume === 'number' ? ['-filter:a', `volume=${Math.max(0, Math.min(volume, 5))}`] : []),
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-shortest',
        '-map', '0:v:0',
        '-map', '1:a:0',
        outputPath,
      ];

      await runCommand(ffmpeg as string, args);
    }

    // Read output and return as data URL to keep integration simple
    const outBuf = await fs.readFile(outputPath);
    const base64 = outBuf.toString('base64');
    const dataUrl = `data:video/mp4;base64,${base64}`;

    // Best-effort cleanup
    try {
      await fs.rm(tmpRoot, { recursive: true, force: true });
    } catch {}

    res.json({ dataUrl });
  } catch (error: any) {
    console.error('❌ merge-audio error:', error);
    res.status(500).json({ error: error?.message || 'merge-audio failed' });
  }
};


