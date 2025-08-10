export type GenerateReq = {
  prompt: string;
  seconds?: number;
  steps?: number;
  width?: number;
  height?: number;
  fps?: number;
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

if (!BASE) {
  // Optional: helpful log so you notice if the env isn't set
  console.warn("VITE_RUNPOD_BASE is missing. Set it in .env.local");
}


const DEFAULT_FPS = 12;
const MAX_FRAMES = 48;

const { seconds, aspect } = req.body;
const { width, height } = ASPECT_PRESETS[aspect]; // same mapping as UI

const fps = DEFAULT_FPS;
const frames = Math.min(Math.max(1, Math.round(seconds * fps)), MAX_FRAMES);

// NOW pass these to the subprocess:
const args = [
  "scripts/evaluation/inference.py",
  "--mode","base",
  "--ckpt_path", MODEL,
  "--config", CONFIG,
  "--savedir", outDir,
  "--n_samples","1","--bs","1",
  "--height", String(height),
  "--width",  String(width),
  "--ddim_steps", String(ddimSteps),               // from UI if you like
  "--unconditional_guidance_scale", String(guide), // from UI if you like
  "--fps", String(fps),
  "--frames", String(frames),
];

export async function startJob(body: GenerateReq): Promise<string> {
  console.log(BASE);
  console.log(JSON.stringify(body),);
  const r = await fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`startJob failed: ${r.status}`);
  const json = (await r.json()) as GenerateResp;
  if (!json.job_id) throw new Error("No job_id in response");
  return json.job_id;
}

export async function getJob(id: string): Promise<Job> {
  const r = await fetch(`${BASE}/jobs/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`getJob failed: ${r.status}`);
  return (await r.json()) as Job;
}

export async function pollUntilDone(id: string, ms = 3000, signal?: AbortSignal): Promise<string> {
  const BASE = (import.meta.env.VITE_RUNPOD_BASE as string).replace(/\/$/, "");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (signal?.aborted) throw new Error("Cancelled");
    const r = await fetch(`${BASE}/jobs/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`getJob failed: ${r.status}`);
    const j = await r.json() as any;
    if (j.status === "done") return new URL(j.url, BASE).toString(); // <— absolute!
    if (j.status === "error") throw new Error(j.error || "Job failed");
    await new Promise(res => setTimeout(res, ms));
  }
}