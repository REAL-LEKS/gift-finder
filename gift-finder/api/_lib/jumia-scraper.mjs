/**
 * Shared Jumia Nigeria search scraper.
 * Used by:
 *   - api/jumia-search.js            (Vercel serverless)
 *   - netlify/functions/jumia-search.mjs
 *   - vite.config.js dev/preview middleware (local /api/jumia-search)
 *
 * Resilience against Jumia's aggressive rate limiting (it drops
 * connections instead of returning errors):
 *   - retries with backoff
 *   - single-flight: identical concurrent queries share one request
 *   - stale-while-error: cached results are served even after the
 *     TTL expires rather than failing outright
 */

const FRESH_TTL_MS = 60 * 60 * 1000      // 1 hour: serve without re-fetching
const STALE_MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24h: still better than nothing

const CACHE = new Map()   // q -> { data, at }
const INFLIGHT = new Map() // q -> Promise<data>

export class JumiaError extends Error {
  constructor(message, staleData = null) {
    super(message)
    this.name = 'JumiaError'
    this.staleData = staleData
  }
}

export async function searchJumia(q, { timeoutMs = 6500, attempts = 2 } = {}) {
  const cached = CACHE.get(q)

  if (cached && Date.now() - cached.at < FRESH_TTL_MS) {
    return cached.data
  }

  // Share a single request between identical concurrent queries
  if (INFLIGHT.has(q)) return INFLIGHT.get(q)

  const job = (async () => {
    let lastErr
    for (let i = 0; i < attempts; i++) {
      if (i > 0) await sleep(600 * i)
      try {
        const data = await fetchOnce(q, timeoutMs)
        CACHE.set(q, { data, at: Date.now() })
        return data
      } catch (err) {
        lastErr = err
      }
    }

    // All attempts failed — serve stale cache if we have anything
    if (cached && Date.now() - cached.at < STALE_MAX_AGE_MS) {
      return { ...cached.data, stale: true }
    }
    throw new JumiaError(lastErr?.message ?? 'Jumia request failed')
  })()

  INFLIGHT.set(q, job)
  try {
    return await job
  } finally {
    INFLIGHT.delete(q)
  }
}

async function fetchOnce(q, timeoutMs) {
  const url = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(q)}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-NG,en;q=0.9',
      'Referer': 'https://www.jumia.com.ng/',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(timeoutMs),
  })

  if (!res.ok) throw new Error(`Jumia HTTP ${res.status}`)

  const html = await res.text()
  if (/captcha|Attention Required|Access Denied|Just a moment/i.test(html)) {
    throw new Error('Jumia served a bot challenge page')
  }

  return {
    products: parseProducts(html, q),
    query: q,
    jumiaUrl: url,
    live: true,
    fetchedAt: Date.now(),
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

/**
 * Parse product listings from Jumia's HTML.
 * Runs two independent extraction strategies and prefers whichever
 * yields the most entries WITH prices:
 *   1. JSON-LD structured data (reliable names/links, sometimes prices)
 *   2. Article card regex (names + prices + images)
 */
function parseProducts(html, fallbackQuery) {
  const fromLd = parseJsonLd(html, fallbackQuery)
  const fromArticles = parseArticleCards(html, fallbackQuery)

  const scored = [fromArticles, fromLd]
    .map(list => ({ list, priced: list.filter(p => p.price).length }))
    .sort((a, b) => b.priced - a.priced || b.list.length - a.list.length)

  return scored[0]?.list ?? []
}

function parseJsonLd(html, fallbackQuery) {
  const products = []

  const ldScripts = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  for (const [, json] of ldScripts) {
    try {
      const obj = JSON.parse(json.trim())
      if (obj['@type'] !== 'ItemList' || !obj.itemListElement?.length) continue

      for (const item of obj.itemListElement.slice(0, 8)) {
        const node = item.item ?? item
        const name = node.name
        const url  = node.url
        const img  = Array.isArray(node.image) ? node.image[0] : node.image
        const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers
        const price = formatPrice(offer?.price, offer?.priceCurrency)
        if (name && url) {
          products.push({
            name,
            price,
            image: typeof img === 'string' ? img : null,
            link: url.startsWith('http') ? url : `https://www.jumia.com.ng${url}`,
          })
        }
      }
    } catch { /* ignore malformed JSON-LD */ }
  }

  return products
}

function parseArticleCards(html, fallbackQuery) {
  const products = []
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

function formatPrice(amount, currency) {
  if (amount == null) return null
  const symbol = currency === 'NGN' ? '₦ ' : ''
  const num = Number(amount)
  if (!Number.isFinite(num)) return null
  return `${symbol}${num.toLocaleString('en-NG')}`
}
