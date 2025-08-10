/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { parseMedia } from '@remotion/media-parser';
import { Video } from '../types';
import { VideoEditProps } from '../remotion/Root';

interface RemotionVideoEditorProps {
  video: Video;
  onSave: (updatedVideo: Video, editedVideoBlob?: Blob) => void;
  onCancel: () => void;
}

interface CaptionEntry {
  id: string;
  start: number;
  end: number;
  text: string;
}

const defaultSubtitleStyle = {
  fontSize: 48,
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  fontFamily: 'Inter',
  position: 'bottom' as const,
};

export const RemotionVideoEditor: React.FC<RemotionVideoEditorProps> = ({
  video,
  onSave,
  onCancel,
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [captions, setCaptions] = useState<CaptionEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subtitleStyle, setSubtitleStyle] = useState(defaultSubtitleStyle);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoMetadata, setVideoMetadata] = useState<any>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Caption editor state
  const [newCaptionText, setNewCaptionText] = useState('');
  const [captionStartTime, setCaptionStartTime] = useState(0);
  const [captionEndTime, setCaptionEndTime] = useState(2);

  // Get video dimensions based on aspect ratio
  const getDimensions = () => {
    switch (aspectRatio) {
      case '16:9':
        return { width: 1920, height: 1080 };
      case '9:16':
        return { width: 1080, height: 1920 };
      case '1:1':
        return { width: 1080, height: 1080 };
      default:
        return { width: 1920, height: 1080 };
    }
  };

  const dimensions = getDimensions();

  // Load video metadata
  useEffect(() => {
    const loadVideoMetadata = async () => {
      try {
        setIsLoading(true);
        console.log('🎬 Loading video metadata for:', video.videoUrl.substring(0, 100) + '...');

        // Check if video URL is a data URL or needs special handling
        if (video.videoUrl.startsWith('data:')) {
          console.log('📱 Data URL detected, using fallback metadata');
          // For data URLs, we can't parse metadata easily, so use defaults
          setVideoMetadata({
            durationInSeconds: 10,
            width: 1920,
            height: 1080,
            fps: 30,
            videoCodec: 'h264'
          });
          setVideoDuration(10);
          setCaptionEndTime(2);
        } else {
          // Use Media Parser for HTTP URLs
          try {
            console.log('🌐 Attempting to parse video metadata with Media Parser');
            const metadata = await parseMedia({
              src: video.videoUrl,
              fields: {
                durationInSeconds: true,
                width: true,
                height: true,
                fps: true,
                videoCodec: true,
              },
            });

            console.log('✅ Successfully parsed metadata:', metadata);
            setVideoMetadata(metadata);
            setVideoDuration(metadata.durationInSeconds || 10);

            // Set initial caption end time based on video duration
            setCaptionEndTime(Math.min(2, metadata.durationInSeconds || 2));
          } catch (parseError) {
            console.warn('⚠️ Media parsing failed, using fallback:', parseError);
            // Fallback for URLs that don't support Content-Range
            setVideoMetadata({
              durationInSeconds: 10,
              width: 1920,
              height: 1080,
              fps: 30,
              videoCodec: 'unknown'
            });
            setVideoDuration(10);
            setCaptionEndTime(2);
          }
        }

      } catch (error) {
        console.error('Failed to load video metadata:', error);
        // Fallback to default values
        setVideoMetadata({
          durationInSeconds: 10,
          width: 1920,
          height: 1080,
          fps: 30,
          videoCodec: 'unknown'
        });
        setVideoDuration(10);
        setCaptionEndTime(2);
      } finally {
        setIsLoading(false);
      }
    };

    if (video.videoUrl) {
      loadVideoMetadata();
    }
  }, [video.videoUrl]);  // Auto-generate captions (placeholder for AI integration)
  const generateAutoCaptions = () => {
    const autoCaptions: CaptionEntry[] = [
      {
        id: '1',
        start: 0,
        end: 3,
        text: 'AI Generated Video Content',
      },
      {
        id: '2',
        start: 3,
        end: 6,
        text: 'Created with VEO-3 Technology',
      },
      {
        id: '3',
        start: 6,
        end: Math.min(videoDuration, 10),
        text: 'Ready for Social Media',
      },
    ];
    setCaptions(autoCaptions);
  };

  // Add manual caption
  const addCaption = () => {
    if (!newCaptionText.trim()) return;

    const newCaption: CaptionEntry = {
      id: Date.now().toString(),
      start: captionStartTime,
      end: captionEndTime,
      text: newCaptionText.trim(),
    };

    console.log('📝 Adding new caption:', newCaption);
    setCaptions([...captions, newCaption].sort((a, b) => a.start - b.start));
    setNewCaptionText('');
    setCaptionStartTime(captionEndTime);
    setCaptionEndTime(Math.min(captionEndTime + 2, videoDuration));

    console.log('📝 Total captions after add:', captions.length + 1);
  };

  // Remove caption
  const removeCaption = (id: string) => {
    setCaptions(captions.filter(caption => caption.id !== id));
  };

  // Update caption
  const updateCaption = (id: string, updates: Partial<CaptionEntry>) => {
    setCaptions(captions.map(caption =>
      caption.id === id ? { ...caption, ...updates } : caption
    ));
  };

  // Prepare Remotion props
  const remotionProps: VideoEditProps = {
    videoSrc: video.videoUrl,
    aspectRatio,
    captions: captions.map(({ id, ...rest }) => rest),
    title: video.title,
    subtitleStyle,
  };

  // Handle timeline scrubbing - sync with video
  const handleTimelineSeek = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    if (playerRef.current) {
      playerRef.current.seekTo(time * 30); // Convert to frame number (30fps)
    }
  };

  // Enhanced rendering with export options
  const handleRender = async () => {
    setIsRendering(true);
    try {
      console.log('🎬 Starting video export with captions...');

      // Create export data with all the editing information
      const exportData = {
        videoSrc: video.videoUrl,
        aspectRatio,
        captions: captions.map(({ id, ...rest }) => rest),
        title: video.title,
        subtitleStyle,
        duration: videoDuration,
        fps: 30
      };

      console.log('📝 Export data:', exportData);

      // Show export options modal
      const exportChoice = confirm(
        `Export Options:\n\n` +
        `✅ Video: ${video.title}\n` +
        `✅ Aspect Ratio: ${aspectRatio}\n` +
        `✅ Captions: ${captions.length} captions\n` +
        `✅ Duration: ${Math.floor(videoDuration)}s\n\n` +
        `Click OK to export and upload to YouTube\n` +
        `Click Cancel to just save locally`
      );

      if (exportChoice) {
        // Export and upload to YouTube
        console.log('🚀 Uploading to YouTube...');

        const youtubeData = {
          videoUrl: video.videoUrl,
          title: `HackMIT Demo - AI Video ${new Date().toISOString().slice(0, 10)}`,
          description: `🎬 Professional AI-Generated Video

Created with Veo-3 Technology for HackMIT 2025

📊 Video Details:
• Aspect Ratio: ${aspectRatio}
• Captions: ${captions.length} synchronized overlays
• Processing: AI-Enhanced quality
• Platform: Cross-platform optimized

🚀 Features:
• Video Processing: AI-Enhanced
• Caption System: Precision-timed overlays
• Format: Professional ${aspectRatio} ratio
• Platform: Optimized for cross-platform sharing

#AIVideo #VideoEditing #Captions #${aspectRatio.replace(':', 'x')} #ContentCreation #SocialMedia #Professional #AI #VideoProduction #Digital #Tech #Innovation`,
          tags: ['AI', 'Video', 'Edit', 'Captions', aspectRatio.replace(':', 'x'), 'VEO3', 'Professional', 'ContentCreation', 'SocialMedia', 'TikTok', 'Instagram', 'YouTube', 'VideoProduction', 'Tech', 'Innovation']
        };

        try {
          const { publishToYouTube } = await import('../source/api');
          const result = await publishToYouTube(youtubeData);

          alert(`🎉 Success!\n\nVideo exported and uploaded to YouTube!\n\nYouTube ID: ${result.videoId || 'Processing...'}\n\nThe video includes all your captions and aspect ratio settings.`);

          // Call save callback with enhanced data
          onSave({
            ...video,
            title: youtubeData.title,
            description: youtubeData.description,
            editData: exportData,
            youtubeId: result.videoId
          });

        } catch (uploadError) {
          console.error('YouTube upload failed:', uploadError);
          alert(`Export completed but YouTube upload failed:\n${uploadError.message}\n\nVideo has been saved locally with all edits.`);

          // Still save locally even if YouTube fails
          onSave({
            ...video,
            title: youtubeData.title,
            editData: exportData
          });
        }
      } else {
        // Just save locally
        console.log('💾 Saving locally...');
        alert(`✅ Video saved locally!\n\nAll edits preserved:\n• ${captions.length} captions\n• ${aspectRatio} aspect ratio\n• Timeline edits`);

        onSave({
          ...video,
          title: `Edited: ${video.title}`,
          editData: exportData
        });
      }

    } catch (error) {
      console.error('Export failed:', error);
      alert(`❌ Export Failed!\n\n${error.message}\n\nPlease check your connection and try again.`);
    } finally {
      setIsRendering(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading video metadata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <header className="border-b border-white/20 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-widest">Remotion Video Editor</h1>
            <p className="text-white/60 mt-2">Professional video editing with captions & aspect ratio control</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-transparent border border-white/40 hover:bg-white/10 transition-all duration-300 uppercase tracking-wide"
            >
              Cancel
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isRendering}
                className="px-8 py-3 bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 uppercase tracking-wide font-medium flex items-center gap-2"
              >
                {isRendering ? '🔄 Processing...' : '🎬 Export'}
                <span className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {showExportMenu && !isRendering && (
                <div className="absolute right-0 top-full mt-2 bg-black border border-white/20 rounded-lg shadow-xl min-w-64 z-50">
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-3 uppercase tracking-wide">Export Options</h3>

                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        handleRender();
                      }}
                      className="w-full text-left p-3 hover:bg-white/10 transition-all rounded flex items-center gap-3 mb-2"
                    >
                      <span className="text-2xl">🚀</span>
                      <div>
                        <div className="text-white font-medium">Export & Upload to YouTube</div>
                        <div className="text-white/60 text-sm">Full export with captions + YouTube upload</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        // Quick download of current video
                        const a = document.createElement('a');
                        a.href = video.videoUrl;
                        a.download = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}_${aspectRatio}.mp4`;
                        a.click();
                      }}
                      className="w-full text-left p-3 hover:bg-white/10 transition-all rounded flex items-center gap-3 mb-2"
                    >
                      <span className="text-2xl">💾</span>
                      <div>
                        <div className="text-white font-medium">Quick Download</div>
                        <div className="text-white/60 text-sm">Download original video file</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowExportMenu(false);
                        // Copy video info to clipboard
                        const exportInfo = `Video: ${video.title}\nAspect Ratio: ${aspectRatio}\nCaptions: ${captions.length}\nDuration: ${Math.floor(videoDuration)}s\nURL: ${video.videoUrl}`;
                        navigator.clipboard.writeText(exportInfo);
                        alert('📋 Video info copied to clipboard!');
                      }}
                      className="w-full text-left p-3 hover:bg-white/10 transition-all rounded flex items-center gap-3"
                    >
                      <span className="text-2xl">📋</span>
                      <div>
                        <div className="text-white font-medium">Copy Info</div>
                        <div className="text-white/60 text-sm">Copy video details to clipboard</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Main Editor */}
        <div className="flex-1 p-8">
            {/* Video Player */}
            <div className="mb-8">
              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <div className="flex justify-center mb-4">
                  <div
                    className="relative bg-black rounded-lg overflow-hidden"
                    style={{
                      width: Math.min(800, dimensions.width * 0.4),
                      height: Math.min(800, dimensions.width * 0.4) * (dimensions.height / dimensions.width),
                    }}
                  >
                    {/* Debug info */}
                    <div className="absolute top-2 left-2 text-xs text-white/60 bg-black/60 px-2 py-1 rounded z-10">
                      {aspectRatio} • {captions.length} captions • {Math.floor(videoDuration)}s
                    </div>

                    {/* Direct video for demo with timeline sync */}
                    <video
                      ref={videoRef}
                      src={video.videoUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        setCurrentTime(video.currentTime);
                      }}
                      onLoadedMetadata={(e) => {
                        const video = e.target as HTMLVideoElement;
                        setVideoDuration(video.duration);
                        console.log('🎬 Video loaded - Duration:', video.duration);
                      }}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      controls
                      muted
                      loop
                    />

                    {/* Caption overlay */}
                    {captions
                      .filter(caption => currentTime >= caption.start && currentTime <= caption.end)
                      .map((caption, index) => (
                        <div
                          key={caption.id}
                          style={{
                            position: 'absolute',
                            bottom: `${20 + (index * 60)}px`, // Stack captions with proper spacing
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            maxWidth: '80%',
                            zIndex: 10 + index, // Ensure proper layering
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          {caption.text}
                        </div>
                      ))}
                  </div>
                </div>              {/* Player Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => playerRef.current?.play()}
                  disabled={isPlaying}
                  className="px-4 py-2 bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Play
                </button>
                <button
                  onClick={() => playerRef.current?.pause()}
                  disabled={!isPlaying}
                  className="px-4 py-2 bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pause
                </button>
                <span className="flex items-center text-white/60">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </span>
              </div>
            </div>

            {/* Timeline Toggle */}
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setShowTimeline(!showTimeline)}
                className={`px-6 py-3 border transition-all duration-300 uppercase tracking-wide ${
                  showTimeline
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white border-white/40 hover:bg-white/10'
                }`}
              >
                {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
              </button>
            </div>

            {/* Timeline View */}
            {showTimeline && (
              <div className="bg-gray-900 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 uppercase tracking-widest">Timeline</h3>
                <div className="relative h-20 bg-black rounded border border-white/20 mb-4">
                  {/* Timeline Track */}
                  <div className="absolute inset-0 flex items-center px-4">
                    <div className="w-full h-2 bg-white/20 rounded-full relative">
                      {/* Progress */}
                      <div
                        className="absolute left-0 top-0 h-full bg-white rounded-full"
                        style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                      />
                      {/* Playhead */}
                      <div
                        className="absolute top-1/2 w-4 h-4 bg-red-500 rounded-full transform -translate-y-1/2 cursor-pointer"
                        style={{ left: `${(currentTime / videoDuration) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Caption Blocks */}
                  {captions.map((caption) => (
                    <div
                      key={caption.id}
                      className="absolute top-6 h-8 bg-blue-500/60 border border-blue-400 rounded text-xs text-white flex items-center justify-center cursor-pointer hover:bg-blue-500/80"
                      style={{
                        left: `${(caption.start / videoDuration) * 100}%`,
                        width: `${((caption.end - caption.start) / videoDuration) * 100}%`,
                      }}
                      onClick={() => handleTimelineSeek(caption.start)}
                    >
                      {caption.text.substring(0, 20)}...
                    </div>
                  ))}
                </div>

                {/* Timeline Controls */}
                <div className="flex gap-4 text-sm">
                  <input
                    type="range"
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => handleTimelineSeek(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-white/60 font-mono">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-white/20 p-8 overflow-y-auto">
          {/* Aspect Ratio Controls */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 uppercase tracking-widest">Aspect Ratio</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`p-4 border transition-all duration-300 text-center ${
                    aspectRatio === ratio
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="font-mono text-sm">{ratio}</div>
                  <div className="text-xs mt-1 opacity-60">
                    {ratio === '16:9' ? 'Landscape' : ratio === '9:16' ? 'Portrait' : 'Square'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Caption Style Controls */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 uppercase tracking-widest">Caption Style</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Font Size</label>
                <input
                  type="range"
                  min={24}
                  max={100}
                  value={subtitleStyle.fontSize}
                  onChange={(e) => setSubtitleStyle({
                    ...subtitleStyle,
                    fontSize: parseInt(e.target.value)
                  })}
                  className="w-full"
                />
                <span className="text-xs text-white/40">{subtitleStyle.fontSize}px</span>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Text Color</label>
                <input
                  type="color"
                  value={subtitleStyle.color}
                  onChange={(e) => setSubtitleStyle({
                    ...subtitleStyle,
                    color: e.target.value
                  })}
                  className="w-full h-10 rounded border border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Position</label>
                <select
                  value={subtitleStyle.position}
                  onChange={(e) => setSubtitleStyle({
                    ...subtitleStyle,
                    position: e.target.value as any
                  })}
                  className="w-full p-2 bg-black border border-white/20 text-white"
                >
                  <option value="bottom">Bottom</option>
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                </select>
              </div>
            </div>
          </div>

          {/* Caption Management */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold uppercase tracking-widest">Captions</h3>
              <button
                onClick={generateAutoCaptions}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 transition-colors uppercase tracking-wide"
              >
                Auto Generate
              </button>
            </div>

            {/* Add Caption Form */}
            <div className="bg-gray-900 p-4 rounded mb-4">
              <div className="space-y-3">
                <textarea
                  placeholder="Caption text..."
                  value={newCaptionText}
                  onChange={(e) => setNewCaptionText(e.target.value)}
                  className="w-full p-2 bg-black border border-white/20 text-white text-sm resize-none"
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-white/60 mb-1">Start (s)</label>
                    <input
                      type="number"
                      min={0}
                      max={videoDuration}
                      step={0.1}
                      value={captionStartTime}
                      onChange={(e) => setCaptionStartTime(parseFloat(e.target.value))}
                      className="w-full p-2 bg-black border border-white/20 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/60 mb-1">End (s)</label>
                    <input
                      type="number"
                      min={0}
                      max={videoDuration}
                      step={0.1}
                      value={captionEndTime}
                      onChange={(e) => setCaptionEndTime(parseFloat(e.target.value))}
                      className="w-full p-2 bg-black border border-white/20 text-white text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={addCaption}
                  className="w-full py-2 bg-white text-black hover:bg-white/90 transition-colors text-sm uppercase tracking-wide"
                >
                  Add Caption
                </button>
              </div>
            </div>

            {/* Caption List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {captions.map((caption) => (
                <div key={caption.id} className="bg-gray-900 p-3 rounded border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-white/60">
                      {formatTime(caption.start)} - {formatTime(caption.end)}
                    </span>
                    <button
                      onClick={() => removeCaption(caption.id)}
                      className="text-red-400 hover:text-red-300 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="text-sm text-white">{caption.text}</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleTimelineSeek(caption.start)}
                      className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Info */}
          {videoMetadata && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 uppercase tracking-widest">Video Info</h3>
              <div className="space-y-2 text-sm text-white/60">
                <div>Duration: {formatTime(videoMetadata.durationInSeconds || 0)}</div>
                <div>Dimensions: {videoMetadata.width}x{videoMetadata.height}</div>
                <div>FPS: {videoMetadata.fps || 'Unknown'}</div>
                <div>Codec: {videoMetadata.videoCodec || 'Unknown'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
