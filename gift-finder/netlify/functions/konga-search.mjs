/**
 * Netlify serverless function — Konga product search.
 * Called as /.netlify/functions/konga-search?q=...
 * Logic lives in api/_lib/konga-scraper.mjs
 */

import { searchKonga, KongaError } from '../../api/_lib/konga-scraper.mjs'

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
    const data = await searchKonga(q)
    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: err instanceof KongaError ? err.message : 'Upstream request failed',
        live: false,
      }),
    }
  }
}
