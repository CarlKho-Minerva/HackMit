/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Composition } from 'remotion';
import { EditableVideo } from './compositions/EditableVideo';
import { CaptionedVideo } from './compositions/CaptionedVideo';

export interface VideoEditProps {
  videoSrc: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  captions?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  title?: string;
  subtitleStyle?: {
    fontSize: number;
    color: string;
    backgroundColor: string;
    fontFamily: string;
    position: 'bottom' | 'top' | 'center';
  };
}

const defaultSubtitleStyle = {
  fontSize: 48,
  color: '#ffffff',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  fontFamily: 'Inter',
  position: 'bottom' as const,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 Landscape Format */}
      <Composition
        id="EditableVideo-16-9"
        component={EditableVideo}
        durationInFrames={300} // 10 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          aspectRatio: '16:9' as const,
          captions: [],
          title: 'Generated Video',
          subtitleStyle: defaultSubtitleStyle,
        }}
      />

      {/* 9:16 Portrait Format (TikTok/Instagram Reels) */}
      <Composition
        id="EditableVideo-9-16"
        component={EditableVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          aspectRatio: '9:16' as const,
          captions: [],
          title: 'Generated Video',
          subtitleStyle: defaultSubtitleStyle,
        }}
      />

      {/* 1:1 Square Format (Instagram Posts) */}
      <Composition
        id="EditableVideo-1-1"
        component={EditableVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          aspectRatio: '1:1' as const,
          captions: [],
          title: 'Generated Video',
          subtitleStyle: defaultSubtitleStyle,
        }}
      />

      {/* Captioned Video Composition with Dynamic Sizing */}
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          videoSrc: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          aspectRatio: '16:9' as const,
          captions: [
            { start: 0, end: 3, text: "AI Generated Video Content" },
            { start: 3, end: 6, text: "Made with VEO-3 Technology" },
            { start: 6, end: 10, text: "Ready for Social Media" }
          ],
          title: 'Captioned Video',
          subtitleStyle: defaultSubtitleStyle,
        }}
      />
    </>
  );
};
