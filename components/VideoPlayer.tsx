/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {Video} from '../types';
import {XMarkIcon} from './icons';

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
            <div className="flex-shrink-0 flex gap-3">
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
