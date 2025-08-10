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
          statusMessage: "Upload complete! Ready to publish to YouTube.",
          progress: "uploaded",
        });
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      updateState({
        isUploading: false,
        statusMessage: `Upload failed: ${
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
    <div className="max-w-4xl mx-auto p-8 space-y-16 bg-black" style={{backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)", backgroundSize: "32px 32px"}}>
      <div className="text-center">
        <h2 className="text-4xl font-thin text-white mb-6 uppercase tracking-widest">
          Upload System
        </h2>
        <p className="text-xl text-white/60 font-light uppercase tracking-wide">
          Cloud Storage + YouTube Publishing
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed p-24 text-center cursor-pointer transition-all duration-300
          ${isDragActive ? "border-white bg-white/5" : "border-white/20"}
          ${
            state.isUploading || state.isPublishing
              ? "cursor-not-allowed opacity-50"
              : "hover:border-white hover:bg-white/5"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="space-y-8">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 border border-white/20 bg-black flex items-center justify-center">
            {state.isUploading ? (
              <div className="animate-spin w-12 h-12 border-2 border-white/30 border-t-white"></div>
            ) : state.isPublishing ? (
              <div className="animate-pulse w-12 h-12 bg-white"></div>
            ) : (
              <svg
                className="w-12 h-12 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            )}
          </div>

          {/* Status Message */}
          <div>
            <p className="text-2xl font-thin text-white mb-4 uppercase tracking-wide">
              {state.statusMessage}
            </p>
            {state.file && (
              <p className="text-lg text-white/60 font-mono">
                {state.file.name} / {(state.file.size / 1024 / 1024).toFixed(2)}MB
              </p>
            )}
          </div>

          {/* Progress Indicator */}
          {state.progress !== "idle" && (
            <div className="flex items-center justify-center space-x-4">
              <div className={`w-4 h-4 border transition-all duration-300 ${
                  state.progress === "uploading" || state.progress === "uploaded" || state.progress === "publishing" || state.progress === "published"
                    ? "bg-white border-white"
                    : "bg-transparent border-white/30"
                }`}
              ></div>
              <div className="w-24 h-px bg-white/20">
                <div className={`h-full bg-white transition-all duration-1000 ${
                    state.progress === "uploaded" || state.progress === "publishing" || state.progress === "published"
                      ? "w-full"
                      : state.progress === "uploading"
                      ? "w-1/2"
                      : "w-0"
                  }`}
                ></div>
              </div>
              <div className={`w-4 h-4 border transition-all duration-300 ${
                  state.progress === "publishing" || state.progress === "published"
                    ? "bg-white border-white"
                    : "bg-transparent border-white/30"
                }`}
              ></div>
              <div className="w-24 h-px bg-white/20">
                <div className={`h-full bg-white transition-all duration-1000 ${
                    state.progress === "published"
                      ? "w-full"
                      : state.progress === "publishing"
                      ? "w-1/2"
                      : "w-0"
                  }`}
                ></div>
              </div>
              <div className={`w-4 h-4 border transition-all duration-300 ${
                  state.progress === "published"
                    ? "bg-white border-white"
                    : "bg-transparent border-white/30"
                }`}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-0">
        <button
          onClick={handlePublish}
          disabled={
            !state.gcsUrl ||
            state.isPublishing ||
            state.progress === "published"
          }
          className={`
            px-12 py-6 font-medium transition-all duration-300 text-lg uppercase tracking-wider
            ${
              state.gcsUrl && state.progress !== "published"
                ? "bg-white text-black hover:bg-white/90"
                : "bg-transparent text-white/40 cursor-not-allowed border border-white/20"
            }
          `}
        >
          {state.isPublishing ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent"></div>
              <span>Publishing</span>
            </div>
          ) : state.progress === "published" ? (
            "Published"
          ) : (
            "Publish"
          )}
        </button>

        {(state.progress === "error" || state.progress === "published") && (
          <button
            onClick={resetUploader}
            className="px-12 py-6 font-medium bg-transparent text-white border border-white/40 hover:bg-white hover:text-black transition-all duration-300 text-lg uppercase tracking-wider"
          >
            Reset
          </button>
        )}
      </div>

      {/* GCS URL Display */}
      {state.gcsUrl && (
        <div className="border border-white/20 bg-black p-6">
          <label className="block text-lg font-medium text-white/80 mb-4 uppercase tracking-wide">
            Cloud Storage:
          </label>
          <div className="flex items-center space-x-0">
            <input
              type="text"
              value={state.gcsUrl}
              readOnly
              className="flex-1 px-4 py-3 border border-white/20 bg-black text-white text-sm font-mono focus:outline-none focus:border-white"
            />
            <button
              onClick={() => navigator.clipboard.writeText(state.gcsUrl)}
              className="px-4 py-3 bg-white text-black hover:bg-white/90 transition-all duration-300 border border-white uppercase tracking-wide text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* YouTube URL Display */}
      {state.youtubeUrl && (
        <div className="border border-white/20 bg-black p-6">
          <label className="block text-lg font-medium text-white/80 mb-4 uppercase tracking-wide">
            YouTube:
          </label>
          <div className="flex items-center space-x-0">
            <input
              type="text"
              value={state.youtubeUrl}
              readOnly
              className="flex-1 px-4 py-3 border border-white/20 bg-black text-white text-sm font-mono focus:outline-none focus:border-white"
            />
            <a
              href={state.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-black hover:bg-white/90 font-medium transition-all duration-300 border border-white uppercase tracking-wide text-sm"
            >
              View
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
