/**
 * Vercel serverless function — same logic as the Netlify version.
 * Deployed at /api/jumia-search?q=...
 */

const CACHE = new Map()
const TTL_MS = 60 * 60 * 1000

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'application/json')

  const q = (req.query?.q ?? '').trim()
  if (!q) return res.status(400).json({ error: 'Missing ?q= query' })

  const cached = CACHE.get(q)
  if (cached && Date.now() - cached.at < TTL_MS) {
    return res.status(200).json(cached.data)
  }

  try {
    const url = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(q)}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-NG,en;q=0.9',
        'Referer': 'https://www.jumia.com.ng/',
      },
      signal: AbortSignal.timeout(9000),
    })

    if (!response.ok) throw new Error(`Jumia HTTP ${response.status}`)

    const html = await response.text()
    const products = parseProducts(html, q)

    const data = { products, query: q, jumiaUrl: url, live: true, fetchedAt: Date.now() }
    CACHE.set(q, { data, at: Date.now() })

    return res.status(200).json(data)
  } catch (err) {
    return res.status(502).json({ error: err.message, live: false })
  }
}

function parseProducts(html, fallbackQuery) {
  const products = []

  const ldScripts = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  for (const [, json] of ldScripts) {
    try {
      const obj = JSON.parse(json.trim())
      if (obj['@type'] === 'ItemList' && obj.itemListElement?.length) {
        for (const item of obj.itemListElement.slice(0, 8)) {
          const name = item.name || item.item?.name
          const url  = item.url  || item.item?.url
          const img  = item.image || item.item?.image
          if (name && url) products.push({ name, price: null, image: img ?? null, link: url })
        }
        if (products.length) return products
      }
    } catch { /* ignore */ }
  }

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
        name: name.trim(),
        price: price.trim(),
        image: img ?? null,
        link: href ? `https://www.jumia.com.ng${href}` : `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(fallbackQuery)}`,
      })
    }
  }

  return products
}
