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
  spring,
} from 'remotion';
import { VideoEditProps } from '../Root';
import { Caption } from '../components/Caption';

export const CaptionedVideo: React.FC<VideoEditProps> = ({
  videoSrc,
  aspectRatio,
  captions = [],
  title,
  subtitleStyle,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Calculate video dimensions with smart cropping for different aspect ratios
  const getVideoTransform = () => {
    const targetAspect = aspectRatio === '16:9' ? 16/9 : aspectRatio === '9:16' ? 9/16 : 1;
    const containerAspect = width / height;

    if (Math.abs(targetAspect - containerAspect) < 0.1) {
      // Aspect ratios are close, use full container
      return {
        width: width,
        height: height,
        scale: 1,
        translateX: 0,
        translateY: 0,
      };
    }

    // Calculate scale and position for optimal cropping
    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    if (targetAspect > containerAspect) {
      // Video is wider than container
      scale = height / (width / targetAspect);
      translateY = (height - width / targetAspect) / 2;
    } else {
      // Video is taller than container
      scale = width / (height * targetAspect);
      translateX = (width - height * targetAspect) / 2;
    }

    return {
      width: width,
      height: height,
      scale,
      translateX,
      translateY,
    };
  };

  const transform = getVideoTransform();

  const videoStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: `scale(${transform.scale}) translate(${transform.translateX}px, ${transform.translateY}px)`,
  };

  // Filter captions for current frame with smooth transitions
  const currentTime = frame / fps;
  const activeCaptions = captions.filter(
    caption => currentTime >= caption.start && currentTime <= caption.end
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Background Video with Smart Cropping */}
      <Video
        src={videoSrc}
        style={videoStyle}
        startFrom={0}
        endAt={durationInFrames}
      />

      {/* Animated Title Intro */}
      {title && frame < 90 && (
        <AbsoluteFill
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: `rgba(0, 0, 0, ${interpolate(frame, [0, 30, 60, 90], [0.6, 0.4, 0.4, 0])})`,
          }}
        >
          <div
            style={{
              fontSize: Math.min(width / 12, 100),
              fontWeight: 'bold',
              color: '#ffffff',
              textAlign: 'center',
              padding: '30px',
              textShadow: '3px 3px 6px rgba(0, 0, 0, 0.9)',
              fontFamily: subtitleStyle?.fontFamily || 'Inter',
              transform: `scale(${spring({
                frame,
                fps,
                config: {
                  damping: 200,
                },
              })}) translateY(${interpolate(frame, [0, 30], [50, 0])}px)`,
              opacity: interpolate(frame, [0, 30, 60, 90], [0, 1, 1, 0]),
            }}
          >
            {title}
          </div>
        </AbsoluteFill>
      )}

      {/* Enhanced Captions with Animations */}
      {activeCaptions.map((caption, index) => {
        const captionFrame = frame - Math.floor(caption.start * fps);
        const captionDuration = Math.floor((caption.end - caption.start) * fps);

        return (
          <Caption
            key={`${caption.start}-${caption.end}-${index}`}
            text={caption.text}
            style={{
              ...subtitleStyle,
              opacity: interpolate(
                captionFrame,
                [0, Math.min(15, captionDuration * 0.25), Math.max(captionDuration * 0.75, 16), captionDuration],
                [0, 1, 1, 0]
              ),
            }}
            containerWidth={width}
            containerHeight={height}
            animationFrame={captionFrame}
          />
        );
      })}

      {/* Enhanced Watermark with Fade Animation */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          fontSize: Math.min(width / 35, 28),
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px 16px',
          borderRadius: '8px',
          fontFamily: 'Inter',
          fontWeight: '600',
          opacity: interpolate(frame, [durationInFrames - 60, durationInFrames], [0.9, 0.6]),
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        Viral-Veo
      </div>
    </AbsoluteFill>
  );
};
