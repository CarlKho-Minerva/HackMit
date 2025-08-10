/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {Video} from '../types';
import {PlayIcon} from './icons';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
}

/**
 * A component that renders a video card with a thumbnail, title, and play button.
 */
export const VideoCard: React.FC<VideoCardProps> = ({video, onPlay}) => {
  return (
    <button
      type="button"
      className="group w-full h-full text-left bg-black border border-white/20 overflow-hidden transition-all duration-300 hover:border-white cursor-pointer focus:outline-none focus:border-white flex flex-col"
      onClick={() => onPlay(video)}
      aria-label={`Play video: ${video.title}`}>
      <div className="relative overflow-hidden flex-shrink-0">
        <video
          className="w-full h-48 object-cover pointer-events-none"
          src={video.videoUrl}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"></video>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="bg-white p-4">
            <PlayIcon className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-white/20 flex-grow flex items-start min-h-0">
        <h3
          className="text-sm font-thin text-white uppercase tracking-wide leading-relaxed line-clamp-3"
          title={video.title}>
          {video.title}
        </h3>
      </div>
    </button>
  );
};
