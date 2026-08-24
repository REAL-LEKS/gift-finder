/**
 * Netlify serverless function — scrapes Jumia Nigeria search results.
 * Called by the frontend as /.netlify/functions/jumia-search?q=rose+gold+watch
 * Scraping logic lives in api/_lib/jumia-scraper.mjs (shared with Vercel + dev server).
 */

import { searchJumia } from '../../api/_lib/jumia-scraper.mjs'

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export const handler = async (event) => {
  const q = event.queryStringParameters?.q?.trim()
  if (!q) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing ?q= query' }) }
  }

  try {
    const data = await searchJumia(q)
    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: err.message, live: false }) }
  }
}
