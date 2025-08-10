/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState} from 'react';
import {EditVideoPage} from './components/EditVideoPage';
import {ErrorModal} from './components/ErrorModal';
import {VideoCameraIcon} from './components/icons';
import {SavingProgressPage} from './components/SavingProgressPage';
import {VideoGrid} from './components/VideoGrid';
import {VideoPlayer} from './components/VideoPlayer';
import {MOCK_VIDEOS} from './constants';
import {Video} from './types';

import {GeneratedVideo, GoogleGenAI} from '@google/genai';

const VEO3_MODEL_NAME = 'veo-3.0-generate-preview';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

import { startJob, pollUntilDone } from "./source/api";

// ---

function bloblToBase64(blob: Blob) {
  return new Promise<string>(async (resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      resolve(url.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
}

// ---

async function generateVideoFromText(
  prompt: string,
  numberOfVideos = 1,
): Promise<string[]> {
  let operation = await ai.models.generateVideos({
    model: VEO3_MODEL_NAME,
    prompt,
    config: {
      numberOfVideos,
      aspectRatio: '16:9',
    },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log('...Generating...');
    operation = await ai.operations.getVideosOperation({operation});
  }

  if (operation?.response) {
    const videos = operation.response?.generatedVideos;
    if (videos === undefined || videos.length === 0) {
      throw new Error('No videos generated');
    }

    return await Promise.all(
      videos.map(async (generatedVideo: GeneratedVideo) => {
        const url = decodeURIComponent(generatedVideo.video.uri);
        const res = await fetch(`${url}&key=${process.env.API_KEY}`);
        if (!res.ok) {
          throw new Error(
            `Failed to fetch video: ${res.status} ${res.statusText}`,
          );
        }
        const blob = await res.blob();
        return bloblToBase64(blob);
      }),
    );
  } else {
    throw new Error('No videos generated');
  }
  return [];
}

/**
 * Main component for the Veo3 Gallery app.
 * It manages the state of videos, playing videos, editing videos and error handling.
 */
export const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [generationError, setGenerationError] = useState<string[] | null>(null);

  // -- Runpod quick generate (add-on) --
  const [rpPrompt, setRpPrompt] = useState(
    "A neon cyberpunk CAT bartender, close-up, shallow depth of field, bokeh"
  );
  const [rpSeconds, setRpSeconds] = useState(6);   // optional controls, keep simple
  const [rpSteps, setRpSteps] = useState(14);
  const [rpStatus, setRpStatus] = useState("");
  const [rpLoading, setRpLoading] = useState(false);
  const [rpUrl, setRpUrl] = useState("");
  const [rpAspect, setRpAspect] = useState<"9:16"|"1:1"|"16:9">("9:16");
  const [rpFps, setRpFps] = useState(24);
  // optional custom toggle
  const [useCustom, setUseCustom] = useState(false);
  const [rpW, setRpW] = useState<number>(704);
  const [rpH, setRpH] = useState<number>(1280);

  async function handleRunpodGenerate() {
    try {
      setRpLoading(true);
      setRpUrl("");
      setRpStatus("Starting…");
  
      const payload: any = {
        prompt: rpPrompt,
        seconds: rpSeconds,
        steps: rpSteps,
        fps: rpFps,
      };
      if (useCustom) {
        payload.width = rpW;
        payload.height = rpH;
      } else {
        payload.aspect = rpAspect; // "9:16" (default), "1:1", "16:9"
      }
  
      const jobId = await startJob({
        prompt: rpPrompt,
        seconds: 5,          // 4–5s
        steps: 16,
        fps: 24,             // or 20 to drop frames
        aspect: "9:16"       // backend will choose 576x1024
        // or width: 576, height: 1024
      });
      setRpStatus(`Job ${jobId.slice(0,8)} running…`);
      const url = await pollUntilDone(jobId, 3000);
      setRpUrl(url);
      setRpStatus("Done ✅");
    } catch (e:any) {
      setRpStatus(`Error: ${e.message || String(e)}`);
    } finally {
      setRpLoading(false);
    }
  }

  const handlePlayVideo = (video: Video) => {
    setPlayingVideo(video);
  };

  const handleClosePlayer = () => {
    setPlayingVideo(null);
  };

  const handleStartEdit = (video: Video) => {
    setPlayingVideo(null); // Close player
    setEditingVideo(video); // Open edit page
  };

  const handleCancelEdit = () => {
    setEditingVideo(null); // Close edit page, return to grid
  };

  const handleSaveEdit = async (originalVideo: Video) => {
    setEditingVideo(null);
    setIsSaving(true);
    setGenerationError(null);

    try {
      const promptText = originalVideo.description;
      console.log('Generating video...', promptText);
      const videoObjects = await generateVideoFromText(promptText);

      if (!videoObjects || videoObjects.length === 0) {
        throw new Error('Video generation returned no data.');
      }

      console.log('Generated video data received.');

      const mimeType = 'video/mp4';
      const videoSrc = videoObjects[0];
      const src = `data:${mimeType};base64,${videoSrc}`;

      const newVideo: Video = {
        id: self.crypto.randomUUID(),
        title: `Remix of "${originalVideo.title}"`,
        description: originalVideo.description,
        videoUrl: src,
      };

      setVideos((currentVideos) => [newVideo, ...currentVideos]);
      setPlayingVideo(newVideo); // Go to the new video
    } catch (error) {
      console.error('Video generation failed:', error);
      setGenerationError([
        'Veo 3 is only available on the Paid Tier.',
        'Please select your Cloud Project to get started',
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaving) {
    return <SavingProgressPage />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {editingVideo ? (
        <EditVideoPage
          video={editingVideo}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <div className="mx-auto max-w-[1080px]">
          <header className="p-6 md:p-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text inline-flex items-center gap-4">
              <VideoCameraIcon className="w-10 h-10 md:w-12 md:h-12" />
              <span>Veo Gallery</span>
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Select a video to generate your own variations
            </p>
          </header>
          <main className="px-4 md:px-8 pb-8">
            {/* --- New: quick Runpod generation card --- */}
            <section className="mb-8 rounded-lg border border-gray-700 bg-gray-800 p-4">
              <h2 className="text-lg font-semibold mb-3">Quick Generate (VC2 on Runpod)</h2>

              <div className="grid gap-3">
                <textarea
                  rows={3}
                  className="w-full rounded border border-gray-600 bg-gray-900 p-2"
                  value={rpPrompt}
                  onChange={(e) => setRpPrompt(e.target.value)}
                />

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    Seconds
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="w-20 rounded bg-gray-900 border border-gray-600 p-1"
                      value={rpSeconds}
                      onChange={(e) => setRpSeconds(parseInt(e.target.value || "1"))}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    Steps
                    <input
                      type="number"
                      min={10}
                      max={60}
                      className="w-20 rounded bg-gray-900 border border-gray-600 p-1"
                      value={rpSteps}
                      onChange={(e) => setRpSteps(parseInt(e.target.value || "10"))}
                    />
                  </label>

                    <label className="text-sm">
                      Aspect
                      <select
                        className="ml-2 rounded bg-gray-900 border border-gray-600 p-1"
                        value={rpAspect}
                        onChange={(e) => setRpAspect(e.target.value as any)}
                        disabled={useCustom}
                      >
                        <option value="9:16">9:16 (vertical)</option>
                        <option value="1:1">1:1 (square)</option>
                        <option value="16:9">16:9 (landscape)</option>
                      </select>
                    </label>

                    <label className="text-sm">
                      FPS
                      <input
                        type="number"
                        min={12}
                        max={30}
                        className="ml-2 w-20 rounded bg-gray-900 border border-gray-600 p-1"
                        value={rpFps}
                        onChange={(e) => setRpFps(parseInt(e.target.value || "24"))}
                      />
                    </label>

                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={useCustom}
                        onChange={(e) => setUseCustom(e.target.checked)}
                      />
                      Custom size
                    </label>

                    {useCustom && (
                      <>
                        <label className="text-sm">
                          W
                          <input
                            type="number"
                            className="ml-2 w-24 rounded bg-gray-900 border border-gray-600 p-1"
                            value={rpW}
                            onChange={(e) => setRpW(parseInt(e.target.value || "704"))}
                          />
                        </label>
                        <label className="text-sm">
                          H
                          <input
                            type="number"
                            className="ml-2 w-24 rounded bg-gray-900 border border-gray-600 p-1"
                            value={rpH}
                            onChange={(e) => setRpH(parseInt(e.target.value || "1280"))}
                          />
                        </label>
                        <span className="text-xs text-gray-400">
                          Use multiples of 64 (e.g., 704×1280)
                        </span>
                      </>
                    )}

                    <button
                      onClick={handleRunpodGenerate}
                      disabled={rpLoading}
                      className="ml-auto rounded bg-indigo-500 hover:bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
                    >
                      {rpLoading ? "Generating…" : "Generate"}
                    </button>
                </div>

                <p className="text-sm text-gray-400">{rpStatus}</p>

                {rpUrl && (
                  <div className="mt-2">
                    <video
                      src={rpUrl}
                      controls
                      playsInline
                      muted
                      className="max-w-full max-h-[70vh] rounded border border-gray-700"
                    />
                    <div className="mt-2 text-sm">
                      <a href={rpUrl} download className="underline">
                        ⬇️ Download MP4
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* your existing gallery */}
            <VideoGrid videos={videos} onPlayVideo={handlePlayVideo} />
          </main>
        </div>
      )}

      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={handleClosePlayer}
          onEdit={handleStartEdit}
        />
      )}

      {generationError && (
        <ErrorModal
          message={generationError}
          onClose={() => setGenerationError(null)}
          onSelectKey={async () => await window.aistudio?.openSelectKey()}
        />
      )}
    </div>
  );
};
