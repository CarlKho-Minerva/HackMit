/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';
import { getTrendingSounds, TrendingSound } from '../source/api';

interface TrendingSoundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSound: (sound: TrendingSound, volume: number) => void;
  isLoading?: boolean;
}

export const TrendingSoundsModal: React.FC<TrendingSoundsModalProps> = ({
  isOpen,
  onClose,
  onSelectSound,
  isLoading = false
}) => {
  const [trending, setTrending] = useState<TrendingSound[]>([]);
  const [provider, setProvider] = useState<'deezer' | 'itunes' | 'curated'>('itunes');
  const [region, setRegion] = useState('US');
  const [volume, setVolume] = useState(0.5);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [selectedSound, setSelectedSound] = useState<TrendingSound | null>(null);

  const handleLoadTrending = async () => {
    setLoadingTrending(true);
    try {
      console.log('🎵 Loading trending sounds:', { provider, region });
      const { sounds } = await getTrendingSounds(provider, region);
      console.log('✅ Loaded trending sounds:', sounds.length);
      setTrending(sounds);
    } catch (error) {
      console.error('❌ Failed to load trending sounds:', error);
      alert('Failed to load trending sounds. Please try again.');
    } finally {
      setLoadingTrending(false);
    }
  };

  const handleAddSound = () => {
    if (selectedSound) {
      onSelectSound(selectedSound, volume);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && trending.length === 0) {
      handleLoadTrending();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-black border border-white/20 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white uppercase tracking-wide">
            🎵 Trending Sounds
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-white/70 transition-colors p-2"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 p-6 border-b border-white/20 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-xs text-white/70 uppercase tracking-wide">
                Source
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as typeof provider)}
                className="w-full bg-black border border-white/30 text-white text-sm px-3 py-2"
              >
                <option value="deezer">Deezer Charts</option>
                <option value="itunes">Apple Music</option>
                <option value="curated">Curated Selection</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-white/70 uppercase tracking-wide">
                Region
              </label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value.toUpperCase())}
                placeholder="US"
                className="w-full bg-black border border-white/30 text-white text-sm px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-white/70 uppercase tracking-wide">
                Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={handleLoadTrending}
            disabled={loadingTrending}
            className="px-4 py-2 bg-transparent border border-white/30 text-white text-sm hover:bg-white hover:text-black transition-colors disabled:opacity-50"
          >
            {loadingTrending ? 'Loading...' : 'Refresh Trending Sounds'}
          </button>
        </div>

        {/* Sound List */}
        <div className="flex-1 overflow-y-auto p-6">
          {trending.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              {loadingTrending ? 'Loading trending sounds...' : 'No sounds loaded yet. Click "Refresh Trending Sounds" to load.'}
            </div>
          ) : (
            <div className="space-y-3">
              {trending.map((sound) => (
                <div
                  key={sound.id}
                  className={`border border-white/20 p-4 cursor-pointer transition-all duration-300 ${
                    selectedSound?.id === sound.id
                      ? 'bg-white/10 border-white'
                      : 'hover:bg-white/5 hover:border-white/40'
                  }`}
                  onClick={() => setSelectedSound(sound)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">
                        {sound.title}
                      </h3>
                      <p className="text-white/60 text-xs truncate">
                        {sound.artist} • {sound.durationSec}s
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {sound.audioUrl && (
                        <audio
                          controls
                          className="w-32 h-8"
                          style={{ height: '32px' }}
                        >
                          <source src={sound.audioUrl} type="audio/mpeg" />
                        </audio>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-white/20 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-transparent border border-white/40 text-white hover:bg-white/10 transition-colors text-sm uppercase tracking-wide"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSound}
            disabled={!selectedSound || isLoading}
            className="px-6 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm uppercase tracking-wide"
          >
            {isLoading ? 'Adding...' : '🎵 Add Sound'}
          </button>
        </div>
      </div>
    </div>
  );
};
