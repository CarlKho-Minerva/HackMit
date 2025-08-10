/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Interface defining the structure of a video object, including its ID, URL,
 * title, and description.
 */
export interface Video {
  id: string;
  videoUrl: string;
  title: string;
  description: string;
  editData?: {
    videoSrc: string;
    aspectRatio: string;
    captions: Array<{ start: number; end: number; text: string }>;
    title: string;
    subtitleStyle: any;
    duration: number;
    fps: number;
  };
  youtubeId?: string;
}
