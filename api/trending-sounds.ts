import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple curated list for demo. Replace with a real fetcher when you have an API/token.
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

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'public, max-age=600');
  res.status(200).json({ sounds: SOUNDS });
}


