import { useState, useEffect } from 'react'
import { Zap, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react'

/**
 * Fetches live product listings from Jumia via the serverless function,
 * then renders them as clickable cards beneath the quiz recommendations.
 *
 * Tries the Vercel path first (/api/jumia-search), then the Netlify path.
 * Gracefully falls back to a "view on Jumia" link if both fail.
 */
export default function LiveProducts({ query, jumiaSearchUrl }) {
  const [state, setState] = useState('idle') // idle | loading | success | error
  const [products, setProducts] = useState([])

  const fetchLive = async () => {
    setState('loading')
    const endpoints = [
      `/api/jumia-search?q=${encodeURIComponent(query)}`,
      `/.netlify/functions/jumia-search?q=${encodeURIComponent(query)}`,
    ]

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint)
        if (!res.ok) continue
        const data = await res.json()
        if (!data.products?.length) continue
        setProducts(data.products)
        setState('success')
        return
      } catch { /* try next endpoint */ }
    }

    setState('error')
  }

  useEffect(() => {
    if (query) fetchLive()
  }, [query])

  if (state === 'idle') return null

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-amber-500" />
        <h3 className="font-bold text-gray-700 text-sm">
          Live from Jumia
          <span className="ml-2 text-xs font-normal text-gray-400">real-time prices</span>
        </h3>
      </div>

      {state === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
          <RefreshCw size={14} className="animate-spin" />
          Fetching live prices from Jumia…
        </div>
      )}

      {state === 'success' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {products.map((p, i) => (
            <a
              key={i}
              href={p.link ?? jumiaSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-100 hover:border-amber-300 rounded-xl overflow-hidden shadow-sm hover:shadow transition-all group"
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-28 object-cover bg-gray-50"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-28 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-3xl">
                  🛍️
                </div>
              )}
              <div className="p-2.5">
                <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-tight">{p.name}</p>
                {p.price && (
                  <p className="text-amber-600 font-bold text-xs mt-1">{p.price}</p>
                )}
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400 group-hover:text-amber-500 transition-colors">
                  <ExternalLink size={9} />
                  Buy on Jumia
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {state === 'error' && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800 font-medium">Live prices unavailable right now</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Check Jumia directly for up-to-date pricing and stock.
            </p>
          </div>
          <button
            onClick={fetchLive}
            className="shrink-0 flex items-center gap-1 border border-amber-300 text-amber-700 hover:bg-amber-100 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            <RefreshCw size={11} />
            Retry
          </button>
          <a
            href={jumiaSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            Search Jumia
            <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  )
}
