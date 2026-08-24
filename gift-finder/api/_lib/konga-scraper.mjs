/**
 * Shared Konga Nigeria product search.
 * Uses Konga's own storefront search service (the same public endpoint
 * and key their website ships to every visitor's browser).
 *
 * Same resilience contract as the Jumia scraper:
 *   - fresh cache (1h), stale-while-error (24h)
 *   - single-flight for identical concurrent queries
 *   - retries with backoff
 */

const FRESH_TTL_MS = 60 * 60 * 1000
const STALE_MAX_AGE_MS = 24 * 60 * 60 * 1000

const KSS_ENDPOINT = 'https://kss.igbimo.com/search'
const KSS_API_KEY = 'kss_pub_BlDPgUB4XUJwJgh7oyliGBFASQLAXR1i4'
const KSS_INDEX = 'catalog_store_konga_ranking'

const CACHE = new Map()
const INFLIGHT = new Map()

export class KongaError extends Error {
  constructor(message, staleData = null) {
    super(message)
    this.name = 'KongaError'
    this.staleData = staleData
  }
}

export async function searchKonga(q, { timeoutMs = 8000, attempts = 2 } = {}) {
  const cached = CACHE.get(q)

  if (cached && Date.now() - cached.at < FRESH_TTL_MS) {
    return cached.data
  }

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

    if (cached && Date.now() - cached.at < STALE_MAX_AGE_MS) {
      return { ...cached.data, stale: true }
    }
    throw new KongaError(lastErr?.message ?? 'Konga request failed')
  })()

  INFLIGHT.set(q, job)
  try {
    return await job
  } finally {
    INFLIGHT.delete(q)
  }
}

async function fetchOnce(q, timeoutMs) {
  const res = await fetch(KSS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'KSS-API-Key': KSS_API_KEY,
      Origin: 'https://www.konga.com',
      Referer: 'https://www.konga.com/',
    },
    body: JSON.stringify({ q, name: KSS_INDEX }),
    signal: AbortSignal.timeout(timeoutMs),
  })

  if (!res.ok) throw new Error(`Konga HTTP ${res.status}`)

  const json = await res.json()
  const hits = json?.data?.hits ?? []

  return {
    products: hits.slice(0, 8).map(h => ({
      name: h.name ?? 'Konga product',
      price: formatPrice(h.special_price || h.price),
      image: h.image_thumbnail_path
        ? `https://www-konga-com-res.cloudinary.com/media/catalog/product/${h.image_thumbnail_path.replace(/^\//, '')}`
        : null,
      link: h.url_key ? `https://www.konga.com/product/${h.url_key}` : `https://www.konga.com/search?query=${encodeURIComponent(q)}`,
      source: 'konga',
    })),
    query: q,
    kongaUrl: `https://www.konga.com/search?query=${encodeURIComponent(q)}`,
    live: true,
    fetchedAt: Date.now(),
  }
}

function formatPrice(amount) {
  const num = Number(amount)
  if (!Number.isFinite(num) || num <= 0) return null
  return `₦ ${num.toLocaleString('en-NG')}`
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
