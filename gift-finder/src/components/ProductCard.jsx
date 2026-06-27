import { useState } from 'react'
import { ShoppingBag, Heart, Sparkles, MapPin } from 'lucide-react'

export default function ProductCard({ gift }) {
  const [wishlisted, setWishlisted] = useState(false)
  const [imgError,   setImgError]   = useState(false)

  const handleBuy = () => {
    window.open(gift.affiliate_link, '_blank', 'noopener,noreferrer')
  }

  const showEmoji = gift.emoji && (!gift.image || imgError)

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-luxury border border-gray-100 hover:shadow-luxury-md hover:-translate-y-1 transition-all duration-300 group flex flex-col">

      {/* Image area */}
      <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
        {showEmoji ? (
          <div className={`w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br ${gift.bg ?? 'from-brand-50 to-brand-100'} select-none group-hover:scale-105 transition-transform duration-500`}>
            {gift.emoji}
          </div>
        ) : (
          <img
            src={gift.image}
            alt={gift.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}

        {/* Heart / wishlist */}
        <button
          onClick={() => setWishlisted(w => !w)}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            size={14}
            className={wishlisted ? 'text-gold-500 fill-gold-500' : 'text-gray-400'}
          />
        </button>

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold text-brand-500 shadow-sm">
          {gift.price_label}
        </div>

        {/* Local brand badge */}
        {gift.isLocal && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            <MapPin size={9} />
            Local Brand
          </div>
        )}

        {/* Match badge */}
        {gift.matchPercent && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-brand-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            <Sparkles size={10} />
            {gift.matchPercent}% Match
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {gift.brand && (
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">{gift.brand}</div>
        )}
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{gift.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed flex-1 mb-4 line-clamp-2">"{gift.reason}"</p>

        <button
          onClick={handleBuy}
          className="w-full flex items-center justify-center gap-1.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-semibold text-sm py-2.5 rounded-2xl transition-all shadow-sm hover:shadow-md"
        >
          {gift.isLocal ? 'Shop Now' : 'Buy on Jumia'}
          <ShoppingBag size={13} />
        </button>
      </div>

    </div>
  )
}
