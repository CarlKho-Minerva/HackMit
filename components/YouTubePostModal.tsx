import React, { useState } from 'react';

interface YouTubePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (data: {
    title: string;
    description: string;
    tags: string[];
    privacy: 'public' | 'unlisted' | 'private';
    category: string;
    thumbnail?: File;
  }) => void;
  defaultTitle?: string;
  defaultDescription?: string;
}

export const YouTubePostModal: React.FC<YouTubePostModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  defaultTitle = '',
  defaultDescription = '',
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [tags, setTags] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [category, setCategory] = useState('22'); // People & Blogs
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await onPublish({
        title,
        description,
        tags: tagArray,
        privacy,
        category,
        thumbnail: thumbnail || undefined,
      });
    } catch (error) {
      console.error('Publishing failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border border-white/20-500 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border border-white/20-500/30 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
                Publish to YouTube
              </h2>
              <p className="text-white/60 mt-1">Share your video with the world</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-red-400 transition-colors text-2xl"
              disabled={isUploading}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white font-medium mb-2 uppercase tracking-wide">
              Video Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your video title..."
              className="w-full p-3  border border-white/20 text-white rounded focus:border border-white/20-500 focus:outline-none transition-colors"
              required
              maxLength={100}
              disabled={isUploading}
            />
            <div className="text-xs text-white/40 mt-1">
              {title.length}/100 characters
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-2 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video..."
              className="w-full p-3  border border-white/20 text-white rounded focus:border border-white/20-500 focus:outline-none transition-colors resize-none"
              rows={6}
              maxLength={5000}
              disabled={isUploading}
            />
            <div className="text-xs text-white/40 mt-1">
              {description.length}/5000 characters
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white font-medium mb-2 uppercase tracking-wide">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ai, video, editing, veo3, content (separate with commas)"
              className="w-full p-3  border border-white/20 text-white rounded focus:border border-white/20-500 focus:outline-none transition-colors"
              disabled={isUploading}
            />
            <div className="text-xs text-white/40 mt-1">
              Separate tags with commas. Max 15 tags.
            </div>
          </div>

          {/* Privacy & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Privacy */}
            <div>
              <label className="block text-white font-medium mb-2 uppercase tracking-wide">
                Privacy
              </label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as any)}
                className="w-full p-3  border border-white/20 text-white rounded focus:border border-white/20-500 focus:outline-none transition-colors"
                disabled={isUploading}
              >
                <option value="public">🌍 Public</option>
                <option value="unlisted">🔗 Unlisted</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-white font-medium mb-2 uppercase tracking-wide">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3  border border-white/20 text-white rounded focus:border border-white/20-500 focus:outline-none transition-colors"
                disabled={isUploading}
              >
                <option value="22">People & Blogs</option>
                <option value="23">Comedy</option>
                <option value="24">Entertainment</option>
                <option value="25">News & Politics</option>
                <option value="26">Howto & Style</option>
                <option value="27">Education</option>
                <option value="28">Science & Technology</option>
                <option value="10">Music</option>
                <option value="15">Pets & Animals</option>
                <option value="17">Sports</option>
                <option value="19">Travel & Events</option>
                <option value="20">Gaming</option>
              </select>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-white font-medium mb-2 uppercase tracking-wide">
              Custom Thumbnail (Optional)
            </label>
            <div className="border border-white/20 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="thumbnail-upload"
                className="cursor-pointer block text-white/60 hover:text-white transition-colors"
              >
                {thumbnail ? (
                  <div>
                    <span className="text-green-400">✓</span> {thumbnail.name}
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl mb-2">📷</div>
                    <div>Click to upload thumbnail</div>
                    <div className="text-xs text-white/40 mt-1">
                      Recommended: 1280x720, JPG/PNG, Max 2MB
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Publishing Info */}
          <div className=" border border-white/20 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2 uppercase tracking-wide">Publishing Details</h3>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex justify-between">
                <span>Visibility:</span>
                <span className="text-white">{privacy}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="text-white">
                  {category === '22' ? 'People & Blogs' :
                   category === '28' ? 'Science & Technology' :
                   'Other'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tags:</span>
                <span className="text-white">
                  {tags.split(',').filter(t => t.trim()).length} tags
                </span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-transparent border border-white/40 text-white hover:bg-white/10 transition-all duration-300 uppercase tracking-wide"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white transition-all duration-300 uppercase tracking-wide font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading || !title.trim()}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publishing...
                </div>
              ) : (
                '🚀 Publish to YouTube'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
