/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { Video } from "../types";
import { VideoCard } from "./VideoCard";
import { MOCK_VIDEOS } from "../constants";

interface VideoGridProps {
  videos: Video[];
  onPlayVideo: (video: Video) => void;
  onDeleteVideo?: (video: Video) => void;
}

/**
 * A component that renders a grid of video cards.
 */
export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  onPlayVideo,
  onDeleteVideo,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px">
      {videos
        .filter((video) => video.id)
        .map((video) => {
          // Only allow deletion of user-generated videos (not the original mock videos)
          const isUserGenerated = !MOCK_VIDEOS.some(mockVideo => mockVideo.id === video.id);

          return (
            <div key={video.id} className="bg-black h-80">
              <VideoCard
                video={video}
                onPlay={onPlayVideo}
                onDelete={onDeleteVideo}
                showDelete={isUserGenerated}
              />
            </div>
          );
        })}
    </div>
  );
};
