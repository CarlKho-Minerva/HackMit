/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CaptionProps {
  text: string;
  style?: {
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    fontFamily?: string;
    position?: 'bottom' | 'top' | 'center';
    opacity?: number;
  };
  containerWidth: number;
  containerHeight: number;
  animationFrame?: number;
}

export const Caption: React.FC<CaptionProps> = ({
  text,
  style = {},
  containerWidth,
  containerHeight,
  animationFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const {
    fontSize = Math.min(containerWidth / 25, 48),
    color = '#ffffff',
    backgroundColor = 'rgba(0, 0, 0, 0.8)',
    fontFamily = 'Inter',
    position = 'bottom',
    opacity = 1,
  } = style;

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Caption render:', { text, frame, animationFrame, opacity });
  }

  // Animation calculations
  const slideUpAnimation = spring({
    frame: animationFrame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
    },
  });

  const scaleAnimation = spring({
    frame: animationFrame,
    fps,
    config: {
      damping: 300,
      stiffness: 150,
    },
  });

  // Position calculations
  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      left: '50%',
      transform: `translateX(-50%) translateY(${interpolate(slideUpAnimation, [0, 1], [20, 0])}px) scale(${scaleAnimation})`,
      maxWidth: '90%',
      textAlign: 'center',
      zIndex: 100,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          top: containerHeight * 0.1,
        };
      case 'center':
        return {
          ...baseStyles,
          top: '50%',
          transform: `translateX(-50%) translateY(-50%) translateY(${interpolate(slideUpAnimation, [0, 1], [20, 0])}px) scale(${scaleAnimation})`,
        };
      case 'bottom':
      default:
        return {
          ...baseStyles,
          bottom: containerHeight * 0.15,
        };
    }
  };

  // Split text into words for better line breaking
  const words = text.split(' ');
  const maxWordsPerLine = Math.floor(containerWidth / (fontSize * 0.6));
  const lines: string[] = [];

  for (let i = 0; i < words.length; i += maxWordsPerLine) {
    lines.push(words.slice(i, i + maxWordsPerLine).join(' '));
  }

  return (
    <div style={getPositionStyles()}>
      <div
        style={{
          backgroundColor,
          padding: `${fontSize * 0.3}px ${fontSize * 0.6}px`,
          borderRadius: fontSize * 0.2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          border: `2px solid rgba(255, 255, 255, 0.1)`,
          backdropFilter: 'blur(8px)',
          opacity,
        }}
      >
        {lines.map((line, index) => (
          <div
            key={index}
            style={{
              fontSize,
              color,
              fontFamily,
              fontWeight: '700',
              lineHeight: 1.2,
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
              letterSpacing: '0.02em',
              marginBottom: index < lines.length - 1 ? fontSize * 0.1 : 0,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
