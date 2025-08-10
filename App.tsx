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
import {PromptEnhancer} from './components/PromptEnhancer';
import {FakeLoadingScreen} from './components/FakeLoadingScreen';
import {MOCK_VIDEOS} from './constants';
import { publishToYouTube, mergeAudioIntoVideo, getTrendingSounds, TrendingSound } from './source/api';
import {Video} from './types';
import { startFakeGeneration, getFakeJob, FakeGenerationJob } from './source/fakeVideoGeneration';

import { GeneratedVideo, GoogleGenAI } from "@google/genai";

// 🚨 EXPENSIVE VEO-3 API - ONLY USE WHEN EXPLICITLY ENABLED 🚨
const USE_REAL_VEO = import.meta.env.VITE_USE_REAL_VEO === 'true';
const VEO3_MODEL_NAME = "veo-3.0-generate-preview";
const ai = USE_REAL_VEO ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

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

// 🚨 COMMENTED OUT - EXPENSIVE VEO-3 API CALLS 🚨
// ONLY UNCOMMENT IF YOU WANT TO BURN $6 PER VIDEO
/*
async function generateVideoFromText(
  prompt: string,
  numberOfVideos = 1
): Promise<string[]> {
  if (!USE_REAL_VEO || !ai) {
    throw new Error("VEO-3 is disabled. Set VITE_USE_REAL_VEO=true to enable (costs $6/video)");
  }

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
*/

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

  // New fake generation system
  const [promptText, setPromptText] = useState("A 3D animation of Shrek happily dancing in a sunny forest and then waving at the camera.");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJob, setCurrentJob] = useState<FakeGenerationJob | null>(null);

  // -- Runpod quick generate (add-on) --
  const [rpPrompt, setRpPrompt] = useState(
    "A 3D animation of Shrek happily dancing in a sunny forest and then waving at the camera."
  );
  const [rpSeconds, setRpSeconds] = useState(6);
  const [rpSteps, setRpSteps] = useState(14);
  const [rpStatus, setRpStatus] = useState("");
  const [rpLoading, setRpLoading] = useState(false);
  const [rpUrl, setRpUrl] = useState("");
  const [rpAspect, setRpAspect] = useState<"9:16" | "1:1" | "16:9">("16:9");
  const [rpAudioChoice, setRpAudioChoice] = useState<'beep' | 'silence'>('beep');
  const [rpVolume, setRpVolume] = useState(0.6);
  const [rpMerging, setRpMerging] = useState(false);
  const [rpTrending, setRpTrending] = useState<TrendingSound[]>([]);
  const [rpSelectedSoundId, setRpSelectedSoundId] = useState<string>('');
  const [rpProvider, setRpProvider] = useState<'deezer' | 'itunes' | 'curated'>('itunes');

  // New simplified generation handler
  const handleNewGeneration = async () => {
    if (!promptText.trim()) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const jobId = startFakeGeneration(promptText);
      const job = getFakeJob(jobId);
      if (job) {
        setCurrentJob(job);
        // Poll for job completion
        pollFakeJob(jobId);
      }
    } catch (error) {
      console.error('Failed to start generation:', error);
      setGenerationError(['Failed to start video generation. Please try again.']);
      setIsGenerating(false);
    }
  };

  const pollFakeJob = async (jobId: string) => {
    const pollInterval = setInterval(() => {
      const job = getFakeJob(jobId);
      if (job) {
        setCurrentJob(job);

        if (job.status === 'completed' && job.videoUrl) {
          clearInterval(pollInterval);
          handleJobComplete(job.videoUrl);
        } else if (job.status === 'error') {
          clearInterval(pollInterval);
          setGenerationError(['Video generation failed. Please try again.']);
          setIsGenerating(false);
          setCurrentJob(null);
        }
      }
    }, 500);
  };

  const handleJobComplete = (videoUrl: string) => {
    const newVideo: Video = {
      id: crypto.randomUUID(),
      title: `AI Generated: ${promptText.slice(0, 50)}${promptText.length > 50 ? '...' : ''}`,
      description: promptText,
      videoUrl: videoUrl,
    };

    setVideos((currentVideos) => [newVideo, ...currentVideos]);
    setPlayingVideo(newVideo);
    setIsGenerating(false);
    setCurrentJob(null);
    setPromptText(""); // Clear the prompt for next generation
  };

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

  const ensureHttpUrl = async (maybeDataUrl: string): Promise<string> => {
    if (!maybeDataUrl.startsWith('data:')) return maybeDataUrl;
    const res = await fetch(maybeDataUrl);
    const blob = await res.blob();
    const file = new File([blob], `merged-${Date.now()}.mp4`, { type: 'video/mp4' });
    // Dynamic import to avoid circular import at top
    const uploaded = await (async () => {
      const { uploadToGCS } = await import('./source/api');
      return uploadToGCS(file);
    })();
    return (uploaded as any).url as string;
  };

  const handleRunpodAddSound = async () => {
    if (!rpUrl || rpMerging) return;
    try {
      setRpMerging(true);
      setRpStatus('Adding sound…');
      const { dataUrl } = await mergeAudioIntoVideo({
        videoUrl: rpUrl,
        audioChoice: rpAudioChoice,
        volume: rpVolume,
      });
      setRpUrl(dataUrl);
      setRpStatus('Done ✅');
    } catch (e: any) {
      setRpStatus(`Error: ${e.message || String(e)}`);
    } finally {
      setRpMerging(false);
    }
  };

  const [rpRegion, setRpRegion] = useState<string>('US');

  const handlePublishRunwayToYouTube = async () => {
    if (!rpUrl) return;
    try {
      setRpStatus('Publishing to YouTube…');
      const safeUrl = await ensureHttpUrl(rpUrl);
      const data = await publishToYouTube({
        videoUrl: safeUrl,
        title: `AI Generated: ${rpPrompt.slice(0, 50)}${rpPrompt.length > 50 ? '…' : ''}`,
        description: rpPrompt,
        tags: ['AI', 'generated', 'video', 'RunPod', 'HackMIT'],
      });
      setRpStatus('Published ✅');
      alert(`🎉 Video published to YouTube!\n\n${data.youtubeUrl}`);
      navigator.clipboard.writeText(data.youtubeUrl);
    } catch (e: any) {
      setRpStatus(`Error: ${e.message || String(e)}`);
    }
  };

  const handleLoadTrending = async () => {
    try {
      const { sounds } = await getTrendingSounds(rpProvider, rpRegion);
      console.log('🎵 Trending sounds loaded:', sounds);
      setRpTrending(sounds);
      if (sounds.length && !rpSelectedSoundId) setRpSelectedSoundId(sounds[0].id);
    } catch (e) {
      console.error('Failed to load trending sounds', e);
    }
  };

  const handlePlayVideo = (video: Video) => {
    setPlayingVideo(video);
  };

  const handleClosePlayer = () => {
    setPlayingVideo(null);
  };

  const handlePublishToYouTube = async (video: Video) => {
    try {
      console.log('🎬 Publishing video to YouTube:', video.title);
      const safeUrl = await ensureHttpUrl(video.videoUrl);
      const data = await publishToYouTube({
        videoUrl: safeUrl,
        title: video.title,
        description: video.description,
        tags: ['AI', 'generated', 'video', 'VEO-3', 'HackMIT'],
      });

      console.log('✅ YouTube publish successful:', data.youtubeUrl);
      alert(`🎉 Video published to YouTube!\n\n${data.youtubeUrl}\n\nClick OK to copy the link.`);
      navigator.clipboard.writeText(data.youtubeUrl);
    } catch (error) {
      console.error('❌ YouTube publish error:', error);
      alert(`❌ Failed to publish to YouTube: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteVideo = (video: Video) => {
    if (window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
      setVideos(currentVideos => currentVideos.filter(v => v.id !== video.id));
      if (playingVideo?.id === video.id) {
        setPlayingVideo(null);
      }
      console.log('🗑️ Video deleted:', video.title);
    }
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
      // 🚨 DISABLED EXPENSIVE VEO-3 CALLS 🚨
      // Use fake generation instead to avoid burning credits
      setGenerationError([
        "VEO-3 regeneration disabled to save costs.",
        "Use the main AI Generation Studio for new videos with fake generation.",
        "To enable real VEO-3, set VITE_USE_REAL_VEO=true (costs $6/video)"
      ]);

      /* COMMENTED OUT EXPENSIVE CODE:
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
      */
    } catch (error) {
      console.error("Video generation failed:", error);
      setGenerationError([
        "VEO-3 is disabled to prevent accidental charges.",
        "Use the AI Generation Studio with fake generation instead."
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
                    AI Video Generation Studio
                  </h2>
                  <p className="text-white/60 text-sm mb-8 uppercase tracking-wide">
                    Multi-Shot Prompt Template • VEO-3 Optimized • AI Agent Enhanced
                  </p>

                  <PromptEnhancer
                    value={promptText}
                    onChange={setPromptText}
                    onGenerate={handleNewGeneration}
                    isLoading={isGenerating}
                  />
                </section>

                {/* Legacy Runpod Section - Keep for backup */}
                <section className="mb-16 border border-white/20 bg-black p-8">
                  <h2 className="text-2xl font-thin mb-8 text-white uppercase tracking-widest">
                    Real Runway Generation
                  </h2>
                  <p className="text-white/60 text-sm mb-8 uppercase tracking-wide">
                    Gemini-Enhanced Prompts • Real Video Output • Runway/RunPod Backend (VideoCrafter2 model)
                  </p>

                  <div className="space-y-8">
                    <PromptEnhancer
                      value={rpPrompt}
                      onChange={setRpPrompt}
                      onGenerate={handleRunpodGenerate}
                      isLoading={rpLoading}
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
                        <div className="mt-4 flex flex-col gap-3">
                          {/* Primary action row visible immediately */}
                          <div className="flex items-center gap-3">
                            <label htmlFor="rp-provider" className="text-xs text-white/70 uppercase tracking-wide">Source</label>
                            <select
                              id="rp-provider"
                              className="bg-black border border-white/30 text-white text-xs px-2 py-2"
                              value={rpProvider}
                              onChange={(e) => setRpProvider(e.target.value as 'deezer' | 'itunes' | 'curated')}
                              aria-label="Trending sounds provider"
                            >
                              <option value="deezer" className="bg-black">Deezer</option>
                              <option value="itunes" className="bg-black">Apple Music</option>
                              <option value="curated" className="bg-black">Curated</option>
                            </select>
                            <label htmlFor="rp-region" className="text-xs text-white/70 uppercase tracking-wide">Region</label>
                            <input
                              id="rp-region"
                              value={rpRegion}
                              onChange={(e) => setRpRegion(e.target.value.toUpperCase())}
                              placeholder="US"
                              className="bg-black border border-white/30 text-white text-xs px-2 py-2 w-16"
                              aria-label="Region code"
                            />
                            <button
                              onClick={handleLoadTrending}
                              className="px-4 py-2 bg-transparent border border-white/30 text-white text-xs hover:bg-white hover:text-black transition uppercase tracking-wide"
                              aria-label="Load trending sounds"
                            >
                              🎵 Load Trending Sounds
                            </button>
                            <button
                              onClick={handlePublishRunwayToYouTube}
                              className="px-4 py-2 bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700 transition-all duration-300 uppercase tracking-wide text-xs"
                              aria-label="Publish video to YouTube"
                            >
                              📺 Publish to YouTube
                            </button>
                          </div>

                          {rpTrending.length > 0 && (
                            <div className="flex items-center gap-3">
                              <label htmlFor="rp-trending" className="text-xs text-white/70 uppercase tracking-wide">Trending</label>
                              <select
                                id="rp-trending"
                                className="bg-black border border-white/30 text-white text-xs px-2 py-2"
                                value={rpSelectedSoundId}
                                onChange={(e) => setRpSelectedSoundId(e.target.value)}
                              >
                                {rpTrending.map(s => (
                                  <option key={s.id} value={s.id} className="bg-black">{s.title} — {s.artist}</option>
                                ))}
                              </select>
                              <button
                                onClick={async () => {
                                  if (!rpUrl) return;
                                  const sound = rpTrending.find(s => s.id === rpSelectedSoundId);
                                  if (!sound) return;
                                  try {
                                    setRpMerging(true);
                                    setRpStatus('Adding sound…');
                                    const safeVideoUrl = await ensureHttpUrl(rpUrl);
                                    const { dataUrl } = await mergeAudioIntoVideo({
                                      videoUrl: safeVideoUrl,
                                      audioUrl: sound.audioUrl,
                                      volume: rpVolume,
                                    });
                                    setRpUrl(dataUrl);
                                    setRpStatus('Done ✅');
                                  } catch (e: any) {
                                    setRpStatus(`Error: ${e.message || String(e)}`);
                                  } finally {
                                    setRpMerging(false);
                                  }
                                }}
                                disabled={rpMerging}
                                className="px-4 py-2 bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 transition-all duration-300 uppercase tracking-wide text-xs disabled:opacity-50"
                                aria-label="Add sound to generated video"
                              >
                                {rpMerging ? 'Adding…' : '🎵 Add Sound'}
                              </button>
                              <button
                                onClick={handleLoadTrending}
                                className="px-3 py-2 bg-transparent border border-white/30 text-white text-xs hover:bg-white hover:text-black transition"
                                aria-label="Refresh trending sounds for region"
                                title="Refresh"
                              >
                                Refresh
                              </button>
                            </div>
                          )}
                          <div>
                          <a
                            href={rpUrl}
                            download
                            className="inline-block px-6 py-3 bg-transparent border border-white/40 text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-wide text-sm"
                              aria-label="Download generated video"
                          >
                            Download
                          </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
                <VideoGrid
                  videos={videos}
                  onPlayVideo={handlePlayVideo}
                  onDeleteVideo={handleDeleteVideo}
                />
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
          onPublishToYouTube={handlePublishToYouTube}
          onDelete={handleDeleteVideo}
        />
      )}

      {/* Fake Loading Screen */}
      {isGenerating && currentJob && (
        <FakeLoadingScreen
          job={currentJob}
          onComplete={handleJobComplete}
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