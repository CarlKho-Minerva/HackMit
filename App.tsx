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
import {VideoUploader} from './components/VideoUploader';
import {MOCK_VIDEOS} from './constants';
import {Video} from './types';

import { GeneratedVideo, GoogleGenAI } from "@google/genai";

const VEO3_MODEL_NAME = "veo-3.0-generate-preview";
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

import { startJob, pollUntilDone } from "./source/api";

// ---

function bloblToBase64(blob: Blob) {
  return new Promise<string>(async (resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      resolve(url.split(",")[1]);
    };
    reader.readAsDataURL(blob);
  });
}

// ---

async function generateVideoFromText(
  prompt: string,
  numberOfVideos = 1
): Promise<string[]> {
  let operation = await ai.models.generateVideos({
    model: VEO3_MODEL_NAME,
    prompt,
    config: {
      numberOfVideos,
      aspectRatio: "16:9",
    },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log("...Generating...");
    operation = await ai.operations.getVideosOperation({ operation });
  }

  if (operation?.response) {
    const videos = operation.response?.generatedVideos;
    if (videos === undefined || videos.length === 0) {
      throw new Error("No videos generated");
    }

    return await Promise.all(
      videos.map(async (generatedVideo: GeneratedVideo) => {
        const url = decodeURIComponent(generatedVideo.video.uri);
        const res = await fetch(`${url}&key=${process.env.API_KEY}`);
        if (!res.ok) {
          throw new Error(
            `Failed to fetch video: ${res.status} ${res.statusText}`
          );
        }
        const blob = await res.blob();
        return bloblToBase64(blob);
      })
    );
  } else {
    throw new Error("No videos generated");
  }
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
  const [currentView, setCurrentView] = useState<'gallery' | 'uploader'>('gallery');

  // -- Runpod quick generate (add-on) --
  const [rpPrompt, setRpPrompt] = useState(
    "A neon cyberpunk CAT bartender, close-up, shallow depth of field, bokeh"
  );
  const [rpSeconds, setRpSeconds] = useState(6);
  const [rpSteps, setRpSteps] = useState(14);
  const [rpStatus, setRpStatus] = useState("");
  const [rpLoading, setRpLoading] = useState(false);
  const [rpUrl, setRpUrl] = useState("");
  const [rpAspect, setRpAspect] = useState<"9:16" | "1:1" | "16:9">("16:9");

  async function handleRunpodGenerate() {
    try {
      setRpLoading(true);
      setRpUrl("");
      setRpStatus("Starting…");

      // Send only what the backend needs. FPS is fixed server-side.
      const jobId = await startJob({
        prompt: rpPrompt,
        seconds: rpSeconds,
        steps: rpSteps,
        aspect: rpAspect,
      });

      setRpStatus(`Job ${jobId.slice(0, 8)} running…`);
      const url = await pollUntilDone(jobId, 3000);
      setRpUrl(url);
      setRpStatus("Done ✅");
    } catch (e: any) {
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
      console.log("Generating video...", promptText);
      const videoObjects = await generateVideoFromText(promptText);

      if (!videoObjects || videoObjects.length === 0) {
        throw new Error("Video generation returned no data.");
      }

      console.log("Generated video data received.");

      const mimeType = "video/mp4";
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
      console.error("Video generation failed:", error);
      setGenerationError([
        "Veo 3 is only available on the Paid Tier.",
        "Please select your Cloud Project to get started",
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaving) {
    return <SavingProgressPage />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {editingVideo ? (
        <EditVideoPage
          video={editingVideo}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <div className="mx-auto max-w-7xl">
          <header className="relative px-8 py-24 text-center border-b border-white/20">
            <div className="relative z-10 max-w-4xl mx-auto">
              <h1 className="text-8xl tracking-widest text-white mb-8 uppercase font-gasoek">
                Veo Gallery
              </h1>
              <p className="text-white/60 text-xl font-light max-w-3xl mx-auto leading-relaxed mb-16 uppercase tracking-wide">
                {currentView === 'gallery'
                  ? 'AI Video Generation System'
                  : 'Upload & Publishing Interface'}
              </p>

              {/* Navigation */}
              <div className="flex justify-center gap-0">
                <button
                  onClick={() => setCurrentView('gallery')}
                  className={`px-12 py-6 font-medium text-lg transition-all duration-300 uppercase tracking-wider ${
                    currentView === 'gallery'
                      ? 'bg-white text-black'
                      : 'bg-transparent text-white border border-white/40 hover:bg-white/10'
                  }`}
                >
                  Gallery
                </button>
                <button
                  onClick={() => setCurrentView('uploader')}
                  className={`px-12 py-6 font-medium text-lg transition-all duration-300 uppercase tracking-wider ${
                    currentView === 'uploader'
                      ? 'bg-white text-black'
                      : 'bg-transparent text-white border border-white/40 hover:bg-white/10'
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>
          </header>

          <main className="px-8 py-16 bg-black" style={{backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)", backgroundSize: "32px 32px"}}>
            {currentView === 'gallery' ? (
              <>
                {/* AI Generation Studio */}
                <section className="mb-16 border border-white/20 bg-black p-8">
                  <h2 className="text-2xl font-thin mb-8 text-white uppercase tracking-widest">
                    Video Generation
                  </h2>

                  <div className="space-y-8">
                    <textarea
                      rows={4}
                      placeholder="Enter video description..."
                      className="w-full border border-white/20 bg-black p-6 text-white placeholder-white/40 focus:outline-none focus:border-white transition-all duration-300 resize-none font-mono"
                      value={rpPrompt}
                      onChange={(e) => setRpPrompt(e.target.value)}
                    />

                    <div className="grid grid-cols-4 gap-8">
                      <div className="flex flex-col">
                        <label className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wide">Duration</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          className="border border-white/20 bg-black p-4 text-white focus:outline-none focus:border-white font-mono"
                          value={rpSeconds}
                          onChange={(e) =>
                            setRpSeconds(parseInt(e.target.value || "1"))
                          }
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wide">Quality</label>
                        <input
                          type="number"
                          min={10}
                          max={60}
                          className="border border-white/20 bg-black p-4 text-white focus:outline-none focus:border-white font-mono"
                          value={rpSteps}
                          onChange={(e) =>
                            setRpSteps(parseInt(e.target.value || "10"))
                          }
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-white/60 text-sm font-medium mb-3 uppercase tracking-wide">Aspect</label>
                        <select
                          className="border border-white/20 bg-black p-4 text-white focus:outline-none focus:border-white font-mono"
                          value={rpAspect}
                          onChange={(e) => setRpAspect(e.target.value as any)}
                        >
                          <option value="16:9" className="bg-black">16:9</option>
                          <option value="1:1" className="bg-black">1:1</option>
                          <option value="9:16" className="bg-black">9:16</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <button
                          onClick={handleRunpodGenerate}
                          disabled={rpLoading}
                          className="px-8 py-4 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium uppercase tracking-wide"
                        >
                          {rpLoading ? "Processing" : "Generate"}
                        </button>
                      </div>
                    </div>

                    {rpStatus && (
                      <div className="border border-white/20 bg-black p-4 text-white/70 font-mono text-sm">{rpStatus}</div>
                    )}

                    {rpUrl && (
                      <div className="border border-white/20 bg-black p-6">
                        <video
                          src={rpUrl}
                          controls
                          playsInline
                          muted
                          className="w-full shadow-none"
                        />
                        <div className="mt-4">
                          <a
                            href={rpUrl}
                            download
                            className="inline-block px-6 py-3 bg-transparent border border-white/40 text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wide text-sm"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </section>                {/* your existing gallery */}
                <VideoGrid videos={videos} onPlayVideo={handlePlayVideo} />
              </>
            ) : (
              <VideoUploader
                onVideoPublished={(data) => {
                  console.log('Video published successfully:', data);
                  // You could add the published video to your gallery here
                }}
              />
            )}
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
          onSelectKey={async () => await (window as any).aistudio?.openSelectKey()}
        />
      )}
    </div>
  );
};