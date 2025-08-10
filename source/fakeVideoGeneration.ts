/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Fake video generation service that simulates VEO workflow
 * but returns the Shrek video to save costs during development
 */

export interface FakeGenerationJob {
  id: string;
  status: 'queued' | 'generating' | 'processing' | 'completed' | 'error';
  progress: number;
  prompt: string;
  videoUrl?: string;
  createdAt: Date;
}

const FAKE_JOBS = new Map<string, FakeGenerationJob>();

// Simulate VEO generation phases
const GENERATION_PHASES = [
  { status: 'queued' as const, duration: 1000, message: 'Queued for processing...' },
  { status: 'generating' as const, duration: 8000, message: 'AI agents creating script...' },
  { status: 'processing' as const, duration: 4000, message: 'Rendering video...' },
  { status: 'completed' as const, duration: 0, message: 'Video ready!' }
];

export function startFakeGeneration(prompt: string): string {
  const jobId = crypto.randomUUID();

  const job: FakeGenerationJob = {
    id: jobId,
    status: 'queued',
    progress: 0,
    prompt,
    createdAt: new Date()
  };

  FAKE_JOBS.set(jobId, job);

  // Start the fake generation process
  simulateGeneration(jobId);

  return jobId;
}

export function getFakeJob(jobId: string): FakeGenerationJob | null {
  return FAKE_JOBS.get(jobId) || null;
}

async function simulateGeneration(jobId: string) {
  const job = FAKE_JOBS.get(jobId);
  if (!job) return;

  for (let i = 0; i < GENERATION_PHASES.length; i++) {
    const phase = GENERATION_PHASES[i];

    // Update job status
    job.status = phase.status;
    job.progress = (i / (GENERATION_PHASES.length - 1)) * 100;

    if (phase.status === 'completed') {
      // Use the local Shrek video
      job.videoUrl = '/Shrek_Dancing_Video_Generated.mp4';
      job.progress = 100;
    }

    FAKE_JOBS.set(jobId, job);

    // Wait for the phase duration
    if (phase.duration > 0) {
      await new Promise(resolve => setTimeout(resolve, phase.duration));
    }
  }
}

export function clearCompletedJobs() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago

  for (const [jobId, job] of FAKE_JOBS.entries()) {
    if (job.status === 'completed' && job.createdAt < cutoff) {
      FAKE_JOBS.delete(jobId);
    }
  }
}

// Clean up old jobs periodically
setInterval(clearCompletedJobs, 5 * 60 * 1000); // Every 5 minutes
