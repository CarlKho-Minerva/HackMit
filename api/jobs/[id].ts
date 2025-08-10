import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const runpodBase = process.env.VITE_RUNPOD_BASE || '';
    if (!runpodBase) {
      return res.status(500).json({ error: 'VITE_RUNPOD_BASE not configured' });
    }

    const response = await fetch(`${runpodBase}/jobs/${encodeURIComponent(id as string)}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `RunPod API error: ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}
