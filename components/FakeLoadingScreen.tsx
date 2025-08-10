/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { FakeGenerationJob } from '../source/fakeVideoGeneration';

interface FakeLoadingScreenProps {
  job: FakeGenerationJob;
  onComplete: (videoUrl: string) => void;
}

export const FakeLoadingScreen: React.FC<FakeLoadingScreenProps> = ({
  job,
  onComplete
}) => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    { message: 'Initializing AI agents...', duration: 1000 },
    { message: 'AI agents analyzing your prompt...', duration: 2000 },
    { message: 'Creating multi-shot script template...', duration: 3000 },
    { message: 'Generating VEO-3 optimized prompts...', duration: 2000 },
    { message: 'Rendering video with AI...', duration: 4000 },
    { message: 'Finalizing video output...', duration: 1000 },
    { message: 'Video generation complete!', duration: 500 }
  ];

  useEffect(() => {
    if (job.status === 'completed' && job.videoUrl) {
      onComplete(job.videoUrl);
      return;
    }

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 3;
        return Math.min(newProgress, 100);
      });
    }, 200);

    return () => clearInterval(timer);
  }, [job, onComplete]);

  const getStatusMessage = () => {
    switch (job.status) {
      case 'queued':
        return 'Queued for processing...';
      case 'generating':
        return 'AI agents creating script...';
      case 'processing':
        return 'Rendering video...';
      case 'completed':
        return 'Video ready!';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4 p-8 bg-black border border-white/20 text-center space-y-6">
        <div className="text-6xl mb-4">🎬</div>

        <h2 className="text-2xl font-thin text-white uppercase tracking-widest mb-4">
          Generating Video
        </h2>

        <div className="space-y-4">
          <div className="text-white/70 font-mono text-sm">
            {getStatusMessage()}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2">
            <div
              className="bg-white h-full transition-all duration-300 ease-out"
              style={{ width: `${job.progress}%` }}
            />
          </div>

          <div className="text-white/50 text-xs font-mono">
            {Math.round(job.progress)}% Complete
          </div>
        </div>

        {/* Fake AI Agent Status */}
        <div className="space-y-2 text-left bg-black/50 p-4 border border-white/10">
          <div className="text-white/60 text-xs uppercase tracking-wide mb-2">AI Agent Status:</div>
          <div className="space-y-1 text-xs font-mono">
            <div className="text-green-400">✓ Script Generator: Active</div>
            <div className="text-green-400">✓ Camera Director: Active</div>
            <div className="text-yellow-400">⚡ VEO-3 Renderer: Processing</div>
            <div className="text-white/40">○ Quality Enhancer: Standby</div>
          </div>
        </div>

        <div className="text-white/40 text-xs">
          Powered by VEO-3 & Multi-Shot AI Agents
        </div>
      </div>
    </div>
  );
};
