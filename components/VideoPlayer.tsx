/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState } from 'react';
import {Video} from '../types';
import {XMarkIcon} from './icons';
import { mergeAudioIntoVideo, getTrendingSounds, TrendingSound } from '../source/api';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
  onPublishToYouTube: (video: Video) => void;
  onDelete?: (video: Video) => void;
}

/**
 * A component that renders a video player with controls, description, and YouTube publish button.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  onPublishToYouTube,
  onDelete,
}) => {
  const [isMerging, setIsMerging] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [trending, setTrending] = useState<TrendingSound[]>([]);
  const [selectedSoundId, setSelectedSoundId] = useState<string>('');

  // Removed beep/silence; use trending only

  const [region, setRegion] = useState<string>('US');
  const [provider, setProvider] = useState<'deezer' | 'itunes' | 'curated'>('itunes');

  const handleLoadTrending = async () => {
    try {
      const { sounds } = await getTrendingSounds(provider, region);
      console.log(region,'sounds', sounds);
      setTrending(sounds);
      if (sounds.length && !selectedSoundId) setSelectedSoundId(sounds[0].id);
    } catch (err) {
      console.error('Failed to load trending sounds', err);
    }
  };

  const handleAddTrendingSound = async () => {
    if (isMerging) return;
    const sound = trending.find((s) => s.id === selectedSoundId);
    if (!sound) return;
    try {
      setIsMerging(true);
      // If the current video is a data URL (e.g., after first merge), upload to GCS to avoid large payloads
      const safeUrl = await (async () => {
        if (!video.videoUrl.startsWith('data:')) return video.videoUrl;
        const res = await fetch(video.videoUrl);
        const blob = await res.blob();
        const file = new File([blob], `merged-${Date.now()}.mp4`, { type: 'video/mp4' });
        const { uploadToGCS } = await import('../source/api');
        const uploaded = await uploadToGCS(file);
        return (uploaded as any).url as string;
      })();
      const { dataUrl } = await mergeAudioIntoVideo({
        videoUrl: safeUrl,
        audioUrl: sound.audioUrl,
        volume,
      });
      const videoEl = document.querySelector(`video[src="${video.videoUrl}"]`) as HTMLVideoElement | null;
      if (videoEl) {
        videoEl.pause();
      }
      video.videoUrl = dataUrl;
    } catch (err) {
      alert(`Failed to add trending sound: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog">
      <div
        className="bg-black border border-white/20 w-full max-w-4xl relative overflow-hidden flex flex-col max-h-[90vh] m-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-white/70 z-10 p-2 border border-white/20 hover:border-white transition-colors"
            aria-label="Close video player">
            <XMarkIcon className="w-6 h-6" />
          </button>
          <div className="bg-black overflow-hidden">
            <video
              key={video.id}
              className="w-full h-auto"
              src={video.videoUrl}
              controls
              autoPlay
              loop
              aria-label={video.title}
            />
          </div>
        </div>
        <div className="flex-1 p-6 border-t border-white/20 overflow-y-auto">
          <div className="flex justify-between items-start gap-6">
            <p className="text-sm text-white font-thin uppercase tracking-wide whitespace-pre-wrap flex-1 leading-relaxed">
              {video.description}
            </p>
            <div className="flex-shrink-0 flex flex-col gap-3 items-stretch sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <label htmlFor="volume" className="text-xs text-white/70 uppercase tracking-wide">Vol</label>
                <input
                  id="volume"
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24"
                  aria-label="Volume"
                />
              </div>
              

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadTrending}
                  className="px-3 py-2 bg-transparent border border-white/30 text-white text-xs hover:bg-white hover:text-black transition"
                  aria-label="Load trending sounds"
                >
                  🎵 Load Trending Sounds
                </button>
                {trending.length > 0 && (
                  <>
                    <label htmlFor="providerSelect" className="text-xs text-white/70 uppercase tracking-wide">Source</label>
                    <select
                      id="providerSelect"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as 'deezer' | 'itunes' | 'curated')}
                      className="bg-black border border-white/30 text-white text-xs px-2 py-2"
                      aria-label="Trending sounds provider"
                    >
                      <option value="deezer" className="bg-black">Deezer</option>
                      <option value="itunes" className="bg-black">Apple Music</option>
                      <option value="curated" className="bg-black">Curated</option>
                    </select>
                    <label htmlFor="regionSelect" className="text-xs text-white/70 uppercase tracking-wide">Region</label>
                    <input
                      id="regionSelect"
                      value={region}
                      onChange={(e) => setRegion(e.target.value.toUpperCase())}
                      placeholder="US"
                      className="bg-black border border-white/30 text-white text-xs px-2 py-2 w-16"
                      aria-label="Region code"
                    />
                    <button
                      onClick={handleLoadTrending}
                      className="px-3 py-2 bg-transparent border border-white/30 text-white text-xs hover:bg-white hover:text-black transition"
                      aria-label="Refresh trending sounds for region"
                      title="Refresh"
                    >
                      Refresh
                    </button>
                    <label htmlFor="trendingSelect" className="text-xs text-white/70 uppercase tracking-wide">Trending</label>
                    <select
                      id="trendingSelect"
                      className="bg-black border border-white/30 text-white text-xs px-2 py-2"
                      value={selectedSoundId}
                      onChange={(e) => setSelectedSoundId(e.target.value)}
                      aria-label="Select trending sound"
                    >
                      {trending.map((s) => (
                        <option key={s.id} value={s.id} className="bg-black">{s.title} — {s.artist}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddTrendingSound}
                      disabled={isMerging}
                      className="px-4 py-2 bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 transition-all duration-300 uppercase tracking-wide text-xs disabled:opacity-50"
                      aria-label="Add sound to video"
                    >
                      {isMerging ? 'Adding…' : '🎵 Add Sound'}
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => onPublishToYouTube(video)}
                className="flex items-center gap-2 bg-red-600 text-white font-thin py-3 px-4 border border-red-600 hover:bg-red-700 hover:border-red-700 transition-colors text-sm uppercase tracking-wide"
                aria-label="Publish video to YouTube">
                <span>📺</span>
                <span className="hidden sm:inline">Publish to YouTube</span>
              </button>
              {onDelete && (
                <button
                  onClick={() => onDelete(video)}
                  className="flex items-center gap-2 bg-transparent text-red-400 font-thin py-3 px-4 border border-red-400/40 hover:bg-red-400/10 hover:border-red-400 transition-colors text-sm uppercase tracking-wide"
                  aria-label="Delete video">
                  <span>🗑️</span>
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
