export type GenerateReq = {
  prompt: string;
  seconds?: number;
  steps?: number;
  width?: number;
  height?: number;
  // fps intentionally not exposed; fixed on backend
  aspect?: "9:16" | "1:1" | "16:9";
};
export type GenerateResp = { job_id: string };
export type Job =
  | { status: "queued" | "running" }
  | { status: "done"; url: string }
  | { status: "error"; error: string };

const BASE = (import.meta.env.VITE_RUNPOD_BASE as string || "")
  .trim()
  .replace(/\/$/, "");

// Use local proxy in development to avoid CORS issues
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : BASE;

if (!BASE) {
  console.warn("VITE_RUNPOD_BASE is missing. Set it in .env.local");
}

/**
 * Client-side safety: keep resolutions small and divisible by 64.
 * Backend should enforce its own limits too.
 */
const ASPECT_PRESETS = {
  "16:9": { width: 576, height: 320 },
  "1:1": { width: 512, height: 512 },
  "9:16": { width: 320, height: 576 },
} as const;

const DEFAULT_FPS = 12; // fixed assumption; server may override
const MAX_FRAMES = 48;

function sanitize(body: GenerateReq) {
  const aspect =
    body.aspect && ASPECT_PRESETS[body.aspect]
      ? body.aspect
      : ("16:9" as const);

  const { width, height } =
    body.width && body.height
      ? // If custom was ever passed, clamp to multiples of 64 and reasonable size
        {
          width: Math.max(64, Math.round(body.width / 64) * 64),
          height: Math.max(64, Math.round(body.height / 64) * 64),
        }
      : ASPECT_PRESETS[aspect];

  const seconds = Number.isFinite(body.seconds) ? (body.seconds as number) : 6;
  const frames = Math.min(Math.round(seconds * DEFAULT_FPS), MAX_FRAMES);

  const steps = Number.isFinite(body.steps) ? (body.steps as number) : 14;

  return {
    prompt: body.prompt,
    // Send both computed and original hints; server can choose what to use.
    seconds,
    aspect,
    steps,
    width,
    height,
    frames,
  };
}

export async function startJob(body: GenerateReq): Promise<string> {
  const payload = sanitize(body);

  const r = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.ok) throw new Error(`startJob failed: ${r.status}`);
  const json = (await r.json()) as GenerateResp;
  if (!json.job_id) throw new Error("No job_id in response");
  return json.job_id;
}

export async function getJob(id: string): Promise<Job> {
  const r = await fetch(`${API_BASE}/jobs/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`getJob failed: ${r.status}`);
  return (await r.json()) as Job;
}

export async function pollUntilDone(
  id: string,
  ms = 3000,
  signal?: AbortSignal
): Promise<string> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (signal?.aborted) throw new Error("Cancelled");
    const r = await fetch(`${API_BASE}/jobs/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!r.ok) throw new Error(`getJob failed: ${r.status}`);
    const j = (await r.json()) as any;
    if (j.status === "done") {
      // Ensure absolute URL
      const url =
        typeof j.url === "string" && /^https?:\/\//i.test(j.url)
          ? j.url
          : new URL(j.url, BASE).toString();
      return url;
    }
    if (j.status === "error") throw new Error(j.error || "Job failed");
    await new Promise((res) => setTimeout(res, ms));
  }
}