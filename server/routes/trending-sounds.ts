import { Request, Response } from 'express';

const SOUNDS = [
  {
    id: 'sample-1',
    title: 'original sound - tna.music',
    artist: 'TNAe',
    durationSec: 54,
    audioUrl: 'https://sf16-ies-music-va.tiktokcdn.com/obj/ies-music-ttp-dup-us/7516564887011740458.mp3',
    source: 'curated-demo',
  },
  {
    id: 'sample-2',
    title: 'Original sound - DJ ANyelo',
    artist: 'DJ Anyelo',
    durationSec: 54,
    audioUrl: 'https://sf77-ies-music-va.tiktokcdn.com/obj/musically-maliva-obj/7317428813843876614.mp3',
    source: 'curated-demo',
  },
  {
    id: 'sample-3',
    title: 'พี่ชอบหนูที่สุดเลย (Speed Up)',
    artist: 'Ponchet',
    durationSec: 41,
    audioUrl: 'https://sf16-ies-music-sg.tiktokcdn.com/obj/tos-alisg-ve-2774/oYIxjZBmdlVkEFy2eAuDTgKtQcBfC0XLpMK8EZ',
    source: 'curated-demo',
  },
  {
    id: 'sample-4',
    title: 'GRR',
    artist: 'Fantomel',
    durationSec: 17,
    audioUrl: 'https://sf16-music.tiktokcdn-eu.com/obj/ies-music-eu2-no/7508780725572356886.mp3',
    source: 'curated-demo',
  },
  {
    id: 'sample-5',
    title: 'The Great Gig In The Sky (2011 Remastered Version)',
    artist: 'Pink Floyd',
    durationSec: 60,
    audioUrl: 'https://sf16-music.tiktokcdn-eu.com/obj/ies-music-eu2-no/7508780725572356886.mp3',
    source: 'curated-demo',
  },
];

async function fetchDeezerChart(region?: string): Promise<any[]> {
  const regionPath = (region && typeof region === 'string' && region.length <= 3)
    ? `/${encodeURIComponent(region)}`
    : '';
  // Examples: /chart (global), /chart/US, /chart/FR
  const r = await fetch(`https://api.deezer.com/chart${regionPath}/tracks`);
  if (!r.ok) return [];
  const json = await r.json();
  // Endpoint returns { data: [...] }
  return json?.data ?? [];
}

export const trendingSounds = async (req: Request, res: Response) => {
  try {
    const provider = String(req.query.provider || 'curated');
    if (provider === 'deezer') {
      const region = typeof req.query.region === 'string' ? req.query.region : undefined;
      const tracks = await fetchDeezerChart(region);
      const sounds = tracks
        .filter((t: any) => !!t.preview)
        .slice(0, 25)
        .map((t: any) => ({
          id: String(t.id),
          title: String(t.title),
          artist: String(t.artist?.name || 'Unknown'),
          durationSec: Number.isFinite(t.duration) ? Math.min(30, Number(t.duration)) : 30,
          audioUrl: String(t.preview),
          source: 'deezer-chart',
          cover: t.album?.cover_small || t.album?.cover || undefined,
        }));
      res.setHeader('Cache-Control', 'public, max-age=120');
      return res.json({ sounds });
    }

    if (provider === 'itunes') {
      const region = (typeof req.query.region === 'string' ? req.query.region : 'US').toUpperCase();
      const rssUrl = `https://rss.applemarketingtools.com/api/v2/${encodeURIComponent(region)}/music/most-played/50/songs.json`;
      const rss = await fetch(rssUrl);
      if (!rss.ok) throw new Error(`Apple RSS failed: ${rss.status}`);
      const rssJson: any = await rss.json();
      const items: any[] = rssJson?.feed?.results ?? [];

      const top = items.slice(0, 15);
      const sounds: any[] = [];
      for (const item of top) {
        const query = `${item.name} ${item.artistName}`;
        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=${encodeURIComponent(region)}&entity=song&limit=1`;
        try {
          const r = await fetch(searchUrl);
          if (!r.ok) continue;
          const j: any = await r.json();
          const match = (j.results || [])[0];
          if (match?.previewUrl) {
            sounds.push({
              id: String(match.trackId || item.id || query),
              title: String(item.name || match.trackName),
              artist: String(item.artistName || match.artistName || 'Unknown'),
              durationSec: 30,
              audioUrl: String(match.previewUrl),
              source: 'itunes-preview',
              cover: item.artworkUrl100 || match.artworkUrl100 || undefined,
            });
          }
        } catch {}
      }
      res.setHeader('Cache-Control', 'public, max-age=120');
      return res.json({ sounds });
    }

    // Fallback curated list
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.json({ sounds: SOUNDS });
  } catch (e) {
    console.error('trending-sounds error', e);
    res.status(500).json({ error: 'Failed to load trending sounds' });
  }
};


