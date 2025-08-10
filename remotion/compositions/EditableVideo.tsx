/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from 'remotion';
import { VideoEditProps } from '../Root';
import { Caption } from '../components/Caption';

export const EditableVideo: React.FC<VideoEditProps> = ({
  videoSrc,
  aspectRatio,
  captions = [],
  title,
  subtitleStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Calculate video dimensions based on aspect ratio
  const getVideoDimensions = () => {
    switch (aspectRatio) {
      case '16:9':
        return { width: width, height: height };
      case '9:16':
        // For portrait, make video fill width and height proportionally
        return { width: width, height: height };
      case '1:1':
        // For square, use the smaller dimension
        const size = Math.min(width, height);
        return { width: size, height: size };
      default:
        return { width: width, height: height };
    }
  };

  const videoDimensions = getVideoDimensions();

  // Calculate positioning for centered video
  const videoStyle: React.CSSProperties = {
    width: videoDimensions.width,
    height: videoDimensions.height,
    position: 'absolute' as const,
    top: (height - videoDimensions.height) / 2,
    left: (width - videoDimensions.width) / 2,
    objectFit: 'cover' as const,
  };

  // Filter captions for current frame
  const currentTime = frame / fps;
  const activeCaptions = captions.filter(
    caption => currentTime >= caption.start && currentTime <= caption.end
  );

  // Debug logging for captions
  if (process.env.NODE_ENV === 'development' && frame % 30 === 0) {
    console.log('EditableVideo debug:', {
      frame,
      currentTime,
      totalCaptions: captions.length,
      activeCaptions: activeCaptions.length,
      videoSrc: videoSrc.substring(0, 50) + '...'
    });
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Background Video */}
      {videoSrc ? (
        <Video
          src={videoSrc}
          style={videoStyle}
          startFrom={0}
          endAt={durationInFrames}
        />
      ) : (
        <div
          style={{
            ...videoStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#333',
            color: '#fff',
            fontSize: '24px',
          }}
        >
          No Video Source
        </div>
      )}

      {/* Title Overlay (first 2 seconds) */}
      {title && frame < 60 && (
        <Sequence from={0} durationInFrames={60}>
          <AbsoluteFill
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                fontSize: Math.min(width / 15, 80),
                fontWeight: 'bold',
                color: '#ffffff',
                textAlign: 'center',
                padding: '20px',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                fontFamily: subtitleStyle?.fontFamily || 'Inter',
                opacity: interpolate(frame, [0, 30, 45, 60], [0, 1, 1, 0]),
              }}
            >
              {title}
            </div>
          </AbsoluteFill>
        </Sequence>
      )}

      {/* Captions */}
      {activeCaptions.map((caption, index) => (
        <Caption
          key={`${caption.start}-${caption.end}-${index}`}
          text={caption.text}
          style={subtitleStyle}
          containerWidth={width}
          containerHeight={height}
        />
      ))}

      {/* Watermark */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          fontSize: Math.min(width / 40, 24),
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontFamily: 'Inter',
          opacity: 0.8,
        }}
      >
        Viral-Veo
      </div>
    </AbsoluteFill>
  );
};
