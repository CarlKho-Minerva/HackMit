/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {Video} from '../types';
import {PencilSquareIcon, XMarkIcon} from './icons';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
  onEdit: (video: Video) => void;
}

/**
 * A component that renders a video player with controls, description, and edit button.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  onEdit,
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
            <button
              onClick={() => onEdit(video)}
              className="flex-shrink-0 flex items-center gap-2 bg-white text-black font-thin py-3 px-4 border border-white hover:bg-black hover:text-white transition-colors text-sm uppercase tracking-wide"
              aria-label="Edit video details">
              <PencilSquareIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
