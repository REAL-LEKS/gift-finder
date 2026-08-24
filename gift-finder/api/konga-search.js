/**
 * Vercel serverless function — Konga product search.
 * Deployed at /api/konga-search?q=...
 * Logic lives in ./_lib/konga-scraper.mjs
 */

import { searchKonga, KongaError } from './_lib/konga-scraper.mjs'

export const maxDuration = 20

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  const q = (req.query?.q ?? '').trim()
  if (!q) return res.status(400).json({ error: 'Missing ?q= query' })

  try {
    const data = await searchKonga(q)
    return res.status(200).json(data)
  } catch (err) {
    return res.status(502).json({
      error: err instanceof KongaError ? err.message : 'Upstream request failed',
      live: false,
    })
  }
}
