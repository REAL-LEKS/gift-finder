/**
 * Vercel serverless function — same logic as the Netlify version.
 * Deployed at /api/jumia-search?q=...
 * Scraping logic lives in ./_lib/jumia-scraper.mjs (shared with Netlify + dev server).
 */

import { searchJumia } from './_lib/jumia-scraper.mjs'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  const q = (req.query?.q ?? '').trim()
  if (!q) return res.status(400).json({ error: 'Missing ?q= query' })

  try {
    const data = await searchJumia(q)
    return res.status(200).json(data)
  } catch (err) {
    return res.status(502).json({ error: err.message, live: false })
  }
}
