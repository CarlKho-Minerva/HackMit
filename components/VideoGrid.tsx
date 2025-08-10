/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from "react";
import { Video } from "../types";
import { VideoCard } from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
  onPlayVideo: (video: Video) => void;
}

/**
 * A component that renders a grid of video cards.
 */
export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  onPlayVideo,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px">
      {videos.map((video, index) => (
        <div key={video.id || index} className="bg-black h-80">
          <VideoCard video={video} onPlay={onPlayVideo} />
        </div>
      ))}
    </div>
  );
};
