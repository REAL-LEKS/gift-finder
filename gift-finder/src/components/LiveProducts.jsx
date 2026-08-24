import { useState, useEffect, useRef } from 'react'
import { Zap, ExternalLink, AlertCircle, RefreshCw, Clock } from 'lucide-react'

/**
 * Fetches live product listings from Jumia AND Konga in parallel,
 * then renders them as clickable cards beneath the quiz recommendations.
 *
 * Tries the Vercel paths (/api/*) first, then the Netlify function paths.
 * The backends retry + serve cached results when a store throttles us;
 * this component just reflects whatever state it gets.
 */
export default function LiveProducts({ query, jumiaSearchUrl, kongaSearchUrl }) {
  const [state, setState] = useState('idle') // idle | loading | success | partial | error
  const [products, setProducts] = useState([])
  const [stale, setStale] = useState(false)
  const requestId = useRef(0)
  const autoRetried = useRef(false)

  async function fetchStore(path, fallbackPath) {
    for (const endpoint of [`${path}?q=${encodeURIComponent(query)}`, `${fallbackPath}?q=${encodeURIComponent(query)}`]) {
      try {
        const res = await fetch(endpoint)
        if (!res.ok) continue
        const data = await res.json()
        if (data.products?.length) return data
      } catch { /* try next path */ }
    }
    return null
  }

  const fetchLive = async () => {
    setState('loading')
    const id = ++requestId.current

    const [jumia, konga] = await Promise.allSettled([
      fetchStore('/api/jumia-search', '/.netlify/functions/jumia-search'),
      fetchStore('/api/konga-search', '/.netlify/functions/konga-search'),
    ])

    if (id !== requestId.current) return // superseded by a newer request

    const jumiaData = jumia.status === 'fulfilled' ? jumia.value : null
    const kongaData = konga.status === 'fulfilled' ? konga.value : null

    // Interleave both stores so the grid mixes sources
    const merged = []
    const a = jumiaData?.products ?? []
    const b = kongaData?.products ?? []
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i]) merged.push(a[i])
      if (b[i]) merged.push(b[i])
    }

    if (merged.length > 0) {
      setProducts(merged.slice(0, 8))
      setStale(Boolean(jumiaData?.stale || kongaData?.stale))
      setState(jumiaData && kongaData ? 'success' : 'partial')
      return
    }

    // Both stores failed — one automatic retry to ride out throttling
    if (!autoRetried.current) {
      autoRetried.current = true
      setTimeout(() => { if (id === requestId.current) fetchLive() }, 3000)
      return
    }
    setState('error')
  }

  useEffect(() => {
    if (query) fetchLive()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  if (state === 'idle') return null

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Zap size={16} className="text-amber-500" />
        <h3 className="font-bold text-gray-700 text-sm">
          Live from Jumia &amp; Konga
          <span className="ml-2 text-xs font-normal text-gray-400">
            {stale ? 'cached prices — tap Retry to refresh' : 'real-time prices'}
          </span>
          {stale && <Clock size={11} className="text-amber-400 inline ml-1" />}
        </h3>
        {state === 'partial' && (
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            one store unavailable
          </span>
        )}
      </div>

      {state === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
          <RefreshCw size={14} className="animate-spin" />
          Fetching live prices from Jumia &amp; Konga…
        </div>
      )}

      {(state === 'success' || state === 'partial') && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {products.map((p, i) => (
            <a
              key={`${p.source}-${i}`}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative bg-white border border-gray-100 hover:border-amber-300 rounded-xl overflow-hidden shadow-sm hover:shadow transition-all group"
            >
              <span className={`absolute top-1.5 left-1.5 z-10 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white ${
                p.source === 'konga' ? 'bg-sky-500' : 'bg-orange-500'
              }`}>
                {p.source === 'konga' ? 'Konga' : 'Jumia'}
              </span>
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-28 object-cover bg-gray-50"
                  loading="lazy"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              ) : null}
              {!p.image && (
                <div className="w-full h-28 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-3xl">
                  🛍️
                </div>
              )}
              <div className="p-2.5">
                <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-tight">{p.name}</p>
                <p className={`font-bold text-xs mt-1 ${p.price ? 'text-amber-600' : 'text-gray-400 font-medium'}`}>
                  {p.price || 'See price on ' + (p.source === 'konga' ? 'Konga' : 'Jumia')}
                </p>
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400 group-hover:text-amber-500 transition-colors">
                  <ExternalLink size={9} />
                  Buy on {p.source === 'konga' ? 'Konga' : 'Jumia'}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {state === 'error' && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 flex-wrap">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800 font-medium">Live prices unavailable right now</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Both stores are busy — check them directly for up-to-date pricing.
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
            className="shrink-0 flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            Jumia
            <ExternalLink size={11} />
          </a>
          <a
            href={kongaSearchUrl ?? `https://www.konga.com/search?query=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            Konga
            <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  )
}
