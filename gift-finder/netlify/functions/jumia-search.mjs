/**
 * Netlify serverless function — scrapes Jumia Nigeria search results.
 * Called by the frontend as /.netlify/functions/jumia-search?q=rose+gold+watch
 *
 * In-process cache keeps us from hammering Jumia on every page load.
 * TTL is 1 hour; deploy restarts clear the cache automatically.
 */

const CACHE = new Map()
const TTL_MS = 60 * 60 * 1000 // 1 hour

export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  const q = event.queryStringParameters?.q?.trim()
  if (!q) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing ?q= query' }) }
  }

  // Serve from cache if fresh
  const cached = CACHE.get(q)
  if (cached && Date.now() - cached.at < TTL_MS) {
    return { statusCode: 200, headers, body: JSON.stringify(cached.data) }
  }

  try {
    const url = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(q)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-NG,en;q=0.9',
        'Referer': 'https://www.jumia.com.ng/',
      },
      signal: AbortSignal.timeout(9000),
    })

    if (!res.ok) throw new Error(`Jumia HTTP ${res.status}`)

    const html = await res.text()
    const products = parseProducts(html, q)

    const data = { products, query: q, jumiaUrl: url, live: true, fetchedAt: Date.now() }
    CACHE.set(q, { data, at: Date.now() })

    return { statusCode: 200, headers, body: JSON.stringify(data) }
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: err.message, live: false }),
    }
  }
}

/**
 * Parse product listings from Jumia's HTML.
 * Tries JSON-LD structured data first (most reliable),
 * then falls back to regex extraction of article cards.
 */
function parseProducts(html, fallbackQuery) {
  const products = []

  // ── Method 1: JSON-LD ItemList ───────────────────────────────
  const ldScripts = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  for (const [, json] of ldScripts) {
    try {
      const obj = JSON.parse(json.trim())
      const list = obj['@type'] === 'ItemList' ? obj : null
      if (list?.itemListElement?.length) {
        for (const item of list.itemListElement.slice(0, 8)) {
          const name = item.name || item.item?.name
          const url  = item.url  || item.item?.url
          const img  = item.image || item.item?.image
          if (name && url) {
            products.push({ name, price: null, image: img ?? null, link: url })
          }
        }
        if (products.length) return products
      }
    } catch { /* ignore malformed JSON-LD */ }
  }

  // ── Method 2: Article card regex ────────────────────────────
  const articleRe = /<article[^>]*class="[^"]*prd[^"]*"[^>]*>([\s\S]*?)<\/article>/gi
  let m
  while ((m = articleRe.exec(html)) !== null && products.length < 8) {
    const block = m[1]
    const name  = block.match(/class="name"[^>]*>\s*([^<]+?)\s*</)?.[1]
    const price = block.match(/class="prc"[^>]*>\s*([^<]+?)\s*</)?.[1]
    const img   = block.match(/(?:data-src|src)="(https:\/\/[^"]*jumia[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i)?.[1]
    const href  = block.match(/href="(\/[^"]+\.html[^"]*)"/)?.[1]

    if (name && price) {
      products.push({
        name:  name.trim(),
        price: price.trim(),
        image: img ?? null,
        link:  href ? `https://www.jumia.com.ng${href}` : `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(fallbackQuery)}`,
      })
    }
  }

  return products
}
