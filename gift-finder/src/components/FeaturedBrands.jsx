import { ExternalLink, MapPin } from 'lucide-react'
import { localBrands } from '../data/localBrands'

export default function FeaturedBrands() {
  if (!localBrands.length) return null

  return (
    <section className="bg-gradient-to-br from-brand-50 to-gold-50 py-14">
      <div className="max-w-4xl mx-auto px-4">

        <div className="flex items-center gap-2 mb-2">
          <MapPin size={18} className="text-gold-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Made in Nigeria</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop local brands</h2>
        <p className="text-gray-500 text-sm mb-8">
          Support Nigerian creators. Every purchase goes directly to a local business.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {localBrands.map(brand => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BrandCard({ brand }) {
  const handleVisit = () => {
    const url = brand.website || brand.instagram || brand.whatsapp
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">

      {/* Header gradient */}
      <div className={`bg-gradient-to-r ${brand.bg} h-20 flex items-center px-5 gap-3`}>
        <span className="text-4xl">{brand.emoji}</span>
        <div>
          <div className="text-white font-extrabold text-lg leading-none">{brand.name}</div>
          <div className="text-white/70 text-xs mt-0.5">{brand.handle}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="inline-block bg-brand-100 text-brand-600 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
          {brand.category}
        </div>
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{brand.tagline}</p>

        {/* Product previews */}
        {brand.products.length > 0 && (
          <div className="flex gap-2 mb-4">
            {brand.products.slice(0, 3).map(p => (
              <div
                key={p.id}
                className={`flex-1 bg-gradient-to-br ${p.bg} rounded-xl h-12 flex items-center justify-center text-xl`}
                title={p.title}
              >
                {p.emoji}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {brand.instagram && (
            <button
              onClick={() => window.open(brand.instagram, '_blank', 'noopener,noreferrer')}
              className="flex-1 flex items-center justify-center gap-1.5 border border-brand-200 text-gold-600 hover:bg-brand-50 text-xs font-semibold py-2 rounded-xl transition-colors"
            >
              Instagram
              <ExternalLink size={11} />
            </button>
          )}
          {(brand.website || brand.whatsapp) && (
            <button
              onClick={handleVisit}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors"
            >
              {brand.website ? 'Visit Shop' : 'WhatsApp'}
              <ExternalLink size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
