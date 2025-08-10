import React, { useState } from 'react';

interface AppleMusicTrendingSoundsProps {
  onSelectSound?: (sound: { name: string; artist: string; duration: string; audioUrl: string }) => void;
}

const TRENDING_SOUNDS = [
  {
    id: '1',
    name: 'Flowers',
    artist: 'Miley Cyrus',
    duration: '3:20',
    audioUrl: '/audio/flowers.mp3',
    genre: 'Pop'
  },
  {
    id: '2', 
    name: 'As It Was',
    artist: 'Harry Styles',
    duration: '2:47',
    audioUrl: '/audio/as-it-was.mp3',
    genre: 'Pop'
  },
  {
    id: '3',
    name: 'Anti-Hero',
    artist: 'Taylor Swift',
    duration: '3:20',
    audioUrl: '/audio/anti-hero.mp3',
    genre: 'Pop'
  },
  {
    id: '4',
    name: 'Bad Habit',
    artist: 'Steve Lacy',
    duration: '3:52',
    audioUrl: '/audio/bad-habit.mp3',
    genre: 'Alternative'
  },
  {
    id: '5',
    name: 'Running Up That Hill',
    artist: 'Kate Bush',
    duration: '5:03',
    audioUrl: '/audio/running-up-that-hill.mp3',
    genre: 'Alternative'
  }
];

export const AppleMusicTrendingSounds: React.FC<AppleMusicTrendingSoundsProps> = ({
  onSelectSound
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const genres = ['All', 'Pop', 'Alternative', 'Hip-Hop', 'Electronic'];

  const filteredSounds = TRENDING_SOUNDS.filter(sound => {
    const matchesGenre = selectedGenre === 'All' || sound.genre === selectedGenre;
    const matchesSearch = searchQuery === '' || 
      sound.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sound.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="bg-gray-900 border border-gray-700 rounded p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">♪</span>
        </div>
        <h3 className="text-white font-medium">Apple Music Trending</h3>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="Search songs or artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
        />
        
        <div className="flex gap-2 flex-wrap">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                selectedGenre === genre
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Sounds List */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {filteredSounds.map((sound) => (
          <div
            key={sound.id}
            className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded cursor-pointer transition-colors"
            onClick={() => onSelectSound?.(sound)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                <span className="text-white text-sm">♪</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{sound.name}</div>
                <div className="text-gray-400 text-xs truncate">{sound.artist}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">{sound.duration}</span>
              <button className="w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                <span className="text-white text-xs">+</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredSounds.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">🎵</div>
          <div className="text-sm">No songs found</div>
        </div>
      )}
    </div>
  );
};
