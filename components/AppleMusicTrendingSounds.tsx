import React, { useState, useEffect } from 'react';
import { getTrendingSounds, TrendingSound } from '../source/api';

interface AppleMusicTrendingSoundsProps {
  onSelectSound?: (sound: { name: string; artist: string; duration: string; audioUrl: string }) => void;
}

export const AppleMusicTrendingSounds: React.FC<AppleMusicTrendingSoundsProps> = ({
  onSelectSound
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingSounds, setTrendingSounds] = useState<TrendingSound[]>([]);
  const [popularSounds, setPopularSounds] = useState<TrendingSound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'trending' | 'popular'>('trending');

  const genres = ['All', 'Pop', 'Alternative', 'Hip-Hop', 'Electronic'];

  // Fetch trending and popular sounds
  useEffect(() => {
    const fetchSounds = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch trending sounds from multiple providers
        const [trendingResponse, popularResponse] = await Promise.all([
          getTrendingSounds('itunes', 'US'),
          getTrendingSounds('deezer', 'US')
        ]);

        setTrendingSounds(trendingResponse.sounds || []);
        setPopularSounds(popularResponse.sounds || []);

        console.log('🎵 Fetched trending sounds:', trendingResponse.sounds?.length);
        console.log('🎵 Fetched popular sounds:', popularResponse.sounds?.length);

      } catch (err) {
        console.error('Failed to fetch sounds:', err);
        setError('Failed to load sounds');

        // Fallback to mock data if API fails
        const mockSounds = [
          {
            id: '1',
            title: 'Flowers',
            artist: 'Miley Cyrus',
            durationSec: 200,
            audioUrl: '/audio/flowers.mp3',
            source: 'fallback'
          },
          {
            id: '2',
            title: 'As It Was',
            artist: 'Harry Styles',
            durationSec: 167,
            audioUrl: '/audio/as-it-was.mp3',
            source: 'fallback'
          },
          {
            id: '3',
            title: 'Anti-Hero',
            artist: 'Taylor Swift',
            durationSec: 200,
            audioUrl: '/audio/anti-hero.mp3',
            source: 'fallback'
          }
        ];
        setTrendingSounds(mockSounds);
        setPopularSounds(mockSounds);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSounds();
  }, []);

  // Convert duration from seconds to MM:SS format
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current sounds based on selected tab
  const currentSounds = selectedTab === 'trending' ? trendingSounds : popularSounds;

  const filteredSounds = currentSounds.filter(sound => {
    const matchesSearch = searchQuery === '' ||
      sound.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sound.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="bg-black border border-gray-600 rounded p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
          <span className="text-black text-xs font-bold">♪</span>
        </div>
        <h3 className="text-white font-medium">Apple Music</h3>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedTab('trending')}
          className={`px-4 py-2 rounded text-sm transition-colors ${
            selectedTab === 'trending'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setSelectedTab('popular')}
          className={`px-4 py-2 rounded text-sm transition-colors ${
            selectedTab === 'popular'
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Popular
        </button>
      </div>

      {/* Search */}
      <div className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="Search songs or artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-white"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm">Loading sounds...</div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-8 text-red-400">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-sm">{error}</div>
          <div className="text-xs text-gray-500 mt-1">Using fallback data</div>
        </div>
      )}

      {/* Sounds List */}
      {!isLoading && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredSounds.map((sound) => (
            <div
              key={sound.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-800 rounded cursor-pointer transition-colors border border-gray-700"
              onClick={() => onSelectSound?.({
                name: sound.title,
                artist: sound.artist,
                duration: formatDuration(sound.durationSec),
                audioUrl: sound.audioUrl
              })}
            >
              {/* Icon */}
              <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-black text-xs">♪</span>
              </div>

              {/* Song Info - Fixed width with truncation */}
              <div className="flex-1 min-w-0 max-w-[140px]">
                <div className="text-white font-medium text-xs truncate" title={sound.title}>
                  {sound.title}
                </div>
                <div className="text-gray-400 text-xs truncate" title={sound.artist}>
                  {sound.artist}
                </div>
              </div>

              {/* Duration and Add Button - Fixed width */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-gray-400 text-xs">{formatDuration(sound.durationSec)}</span>
                <button className="w-5 h-5 bg-white text-black hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0">
                  <span className="text-xs">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredSounds.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">🎵</div>
          <div className="text-sm">No songs found</div>
        </div>
      )}
    </div>
  );
};
