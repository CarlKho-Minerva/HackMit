import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface VideoUploaderProps {
  onVideoPublished?: (data: { youtubeUrl: string; videoId: string }) => void;
}

interface UploadState {
  file: File | null;
  isUploading: boolean;
  isPublishing: boolean;
  gcsUrl: string;
  youtubeUrl: string;
  statusMessage: string;
  progress:
    | "idle"
    | "uploading"
    | "uploaded"
    | "publishing"
    | "published"
    | "error";
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoPublished,
}) => {
  const [state, setState] = useState<UploadState>({
    file: null,
    isUploading: false,
    isPublishing: false,
    gcsUrl: "",
    youtubeUrl: "",
    statusMessage: "Drop a video file here to begin uploading to cloud storage",
    progress: "idle",
  });

  const updateState = (updates: Partial<UploadState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    const videoFile = acceptedFiles[0];
    if (!videoFile) return;

    console.log(
      "📁 File dropped:",
      videoFile.name,
      "Size:",
      (videoFile.size / 1024 / 1024).toFixed(2) + "MB"
    );

    updateState({
      file: videoFile,
      isUploading: true,
      statusMessage: "Uploading to secure cloud storage...",
      progress: "uploading",
      gcsUrl: "",
    });

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const response = await fetch("http://localhost:3001/api/upload-to-gcs", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Upload successful:", data.url);
        updateState({
          isUploading: false,
          gcsUrl: data.url,
          statusMessage: "✅ Upload complete! Ready to publish to YouTube.",
          progress: "uploaded",
        });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      updateState({
        isUploading: false,
        statusMessage: `❌ Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        progress: "error",
      });
    }
  }, []);

  const handlePublish = async () => {
    if (!state.gcsUrl || !state.file) return;

    updateState({
      isPublishing: true,
      statusMessage: "Publishing to YouTube...",
      progress: "publishing",
    });

    try {
      const response = await fetch(
        "http://localhost:3001/api/publish-to-youtube",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoUrl: state.gcsUrl,
            title: `AI Generated Video - ${state.file.name}`,
            description:
              "This video was generated using AI and uploaded through our custom pipeline.",
            tags: ["AI", "generated", "video", "demo"],
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("🚀 YouTube publish successful:", data.youtubeUrl);
        updateState({
          isPublishing: false,
          youtubeUrl: data.youtubeUrl,
          statusMessage: `🚀 Successfully published to YouTube!`,
          progress: "published",
        });
        onVideoPublished?.(data);
      } else {
        throw new Error(data.error || "Publishing failed");
      }
    } catch (error) {
      console.error("❌ Publish error:", error);
      updateState({
        isPublishing: false,
        statusMessage: `❌ Publishing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        progress: "error",
      });
    }
  };

  const resetUploader = () => {
    setState({
      file: null,
      isUploading: false,
      isPublishing: false,
      gcsUrl: "",
      youtubeUrl: "",
      statusMessage:
        "Drop a video file here to begin uploading to cloud storage",
      progress: "idle",
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: "video/*" as any,
    maxFiles: 1,
    disabled: state.isUploading || state.isPublishing,
  });

  const getProgressColor = () => {
    switch (state.progress) {
      case "uploading":
        return "border-blue-500 bg-blue-50";
      case "uploaded":
        return "border-green-500 bg-green-50";
      case "publishing":
        return "border-yellow-500 bg-yellow-50";
      case "published":
        return "border-purple-500 bg-purple-50";
      case "error":
        return "border-red-500 bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Video Upload & Publish Pipeline
        </h2>
        <p className="text-gray-600">
          Test the complete flow from local file to YouTube
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? "border-blue-500 bg-blue-50" : getProgressColor()}
          ${
            state.isUploading || state.isPublishing
              ? "cursor-not-allowed opacity-75"
              : "hover:border-blue-400 hover:bg-blue-25"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            {state.isUploading ? (
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            ) : state.isPublishing ? (
              <div className="animate-pulse w-8 h-8 bg-yellow-500 rounded-full"></div>
            ) : (
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>

          {/* Status Message */}
          <div>
            <p className="text-lg font-medium text-gray-900">
              {state.statusMessage}
            </p>
            {state.file && (
              <p className="text-sm text-gray-500 mt-1">
                File: {state.file.name} (
                {(state.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Progress Indicator */}
          {state.progress !== "idle" && (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div
                className={`w-3 h-3 rounded-full ${
                  state.progress === "uploading"
                    ? "bg-blue-500 animate-pulse"
                    : "bg-green-500"
                }`}
              ></div>
              <span>Upload to GCS</span>
              <div className="w-4 h-px bg-gray-300"></div>
              <div
                className={`w-3 h-3 rounded-full ${
                  state.progress === "publishing"
                    ? "bg-yellow-500 animate-pulse"
                    : state.progress === "published"
                    ? "bg-purple-500"
                    : "bg-gray-300"
                }`}
              ></div>
              <span>Publish to YouTube</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handlePublish}
          disabled={
            !state.gcsUrl ||
            state.isPublishing ||
            state.progress === "published"
          }
          className={`
            px-6 py-3 rounded-lg font-medium transition-all duration-200
            ${
              state.gcsUrl && state.progress !== "published"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          {state.isPublishing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Publishing...</span>
            </div>
          ) : state.progress === "published" ? (
            "✅ Published to YouTube"
          ) : (
            "🚀 Publish to YouTube"
          )}
        </button>

        {(state.progress === "error" || state.progress === "published") && (
          <button
            onClick={resetUploader}
            className="px-6 py-3 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200"
          >
            Upload Another Video
          </button>
        )}
      </div>

      {/* GCS URL Display */}
      {state.gcsUrl && (
        <div className="bg-gray-100 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cloud Storage URL:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={state.gcsUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(state.gcsUrl)}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* YouTube URL Display */}
      {state.youtubeUrl && (
        <div className="bg-red-100 rounded-lg p-4">
          <label className="block text-sm font-medium text-red-700 mb-2">
            🎬 YouTube URL:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={state.youtubeUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-red-300 rounded-md bg-white text-sm"
            />
            <button
              onClick={() => navigator.clipboard.writeText(state.youtubeUrl)}
              className="px-3 py-2 bg-red-600 rounded-md hover:bg-red-700 text-sm"
            >
              Copy
            </button>
            <button
              onClick={() => window.open(state.youtubeUrl, "_blank")}
              className="px-3 py-2 bg-red-600 rounded-md hover:bg-red-700 text-sm"
            >
              Open
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
