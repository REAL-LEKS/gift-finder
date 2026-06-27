import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Gift, Sparkles, Heart, Zap, ArrowRight,
  Monitor, Shirt, Leaf, Dumbbell,
  Users, Home as HomeIcon, GraduationCap, Star, Wallet,
  Package,
} from 'lucide-react'
import giftsData from '../data/gifts.json'
import FeaturedBrands from '../components/FeaturedBrands'

const CATEGORY_TABS = [
  { value: 'all',     label: 'All',      icon: Gift },
  { value: 'tech',    label: 'Tech',     icon: Monitor },
  { value: 'fashion', label: 'Fashion',  icon: Shirt },
  { value: 'beauty',  label: 'Wellness', icon: Leaf },
  { value: 'fitness', label: 'Fitness',  icon: Dumbbell },
]

const BUDGET_FILTERS = [
  { value: 'all',     label: 'All Prices' },
  { value: 'under5k', label: 'Under ₦5k' },
  { value: '10k-20k', label: '₦10k – ₦50k' },
  { value: '50k+',    label: '₦50k+' },
]

const BUDGET_RANGES = {
  'all':     [0, Infinity],
  'under5k': [0, 5000],
  '10k-20k': [10000, 50000],
  '50k+':    [50000, Infinity],
}

const POPULAR_CATEGORIES = [
  { icon: Heart,         label: 'For Your Partner', desc: 'Romantic & anniversary gifts' },
  { icon: HomeIcon,      label: 'For Family',        desc: 'Mum, Dad, siblings & more' },
  { icon: Users,         label: 'For Friends',       desc: 'Thoughtful & fun ideas' },
  { icon: GraduationCap, label: 'Graduation',        desc: 'Celebrate their big moment' },
  { icon: Star,          label: 'Christmas & Eid',   desc: 'Festive season picks' },
  { icon: Wallet,        label: 'Under ₦10k',        desc: 'Great gifts, small budget' },
]

export default function Home() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeBudget, setActiveBudget] = useState('all')
  const [wishlist, setWishlist] = useState(new Set())
  const [imgErrors, setImgErrors] = useState(new Set())

  const toggleWishlist = (id) => {
    setWishlist(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const markImgError = (id) => {
    setImgErrors(prev => new Set(prev).add(id))
  }

  const trending = giftsData
    .filter(g => {
      const [min, max] = BUDGET_RANGES[activeBudget]
      const categoryOk = activeCategory === 'all' || g.interests.includes(activeCategory)
      const budgetOk = g.budget_min <= max && g.budget_max >= min
      return categoryOk && budgetOk
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-gold-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Sparkles size={14} className="text-gold-300" />
            Nigeria's #1 AI Gift Discovery Platform
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            Find the <span className="text-gold-400">perfect gift</span>
            <br />in under 60 seconds.
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-10 font-medium">
            Answer 5 quick questions. Get AI-curated gift recommendations
            with direct links to buy on Jumia.
          </p>

          <button
            onClick={() => navigate('/quiz')}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <Gift size={20} />
            Find a Gift Now
            <ArrowRight size={18} />
          </button>

          <p className="mt-4 text-white/50 text-sm font-medium">Free · No sign-up · Takes 60 seconds</p>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap,      step: '01', title: 'Answer 5 questions', desc: "Tell us who it's for, the occasion, and your budget." },
            { icon: Sparkles, step: '02', title: 'AI finds matches',   desc: 'Our engine scores gifts by recipient, occasion, interests, and budget.' },
            { icon: Heart,    step: '03', title: 'Buy on Jumia',       desc: 'Click any gift to buy it instantly with fast delivery.' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="bg-white rounded-3xl p-6 shadow-luxury border border-gray-100 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-50 rounded-2xl mb-4">
                <Icon size={22} className="text-gold-500" strokeWidth={1.75} />
              </div>
              <div className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-1">Step {step}</div>
              <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trending Gifts ───────────────────────────── */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4">

          {/* Header row */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
            <div className="flex items-center gap-2">
              {BUDGET_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveBudget(value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    activeBudget === value
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 mb-7 overflow-x-auto pb-1">
            {CATEGORY_TABS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={`flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-all ${
                  activeCategory === value
                    ? 'bg-brand-50 text-brand-500 border-brand-200'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600'
                }`}
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {trending.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {trending.map(gift => (
                <div
                  key={gift.id}
                  onClick={() => navigate('/quiz')}
                  className="relative cursor-pointer bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 hover:shadow-luxury transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    {!imgErrors.has(gift.id) ? (
                      <img
                        src={gift.image}
                        alt={gift.title}
                        onError={() => markImgError(gift.id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-50">
                        <Package size={32} className="text-brand-200" strokeWidth={1.5} />
                      </div>
                    )}

                    {/* Heart */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleWishlist(gift.id) }}
                      className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                    >
                      <Heart
                        size={12}
                        className={wishlist.has(gift.id) ? 'text-gold-500 fill-gold-500' : 'text-gray-400'}
                      />
                    </button>

                    {/* Price */}
                    <div className="absolute top-2.5 right-2.5 bg-white/95 rounded-full px-2 py-0.5 text-[10px] font-bold text-brand-500 shadow-sm">
                      {gift.price_label}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="font-bold text-gray-800 text-sm leading-snug">{gift.title}</div>
                    <div className="text-brand-500 text-xs font-semibold mt-0.5">{gift.price_label}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              No gifts match this filter.{' '}
              <button
                onClick={() => { setActiveCategory('all'); setActiveBudget('all') }}
                className="text-brand-500 font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Browse by Category ───────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {POPULAR_CATEGORIES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              onClick={() => navigate('/quiz')}
              className="cursor-pointer bg-white hover:bg-brand-50 border border-gray-100 hover:border-brand-200 rounded-3xl p-5 flex items-start gap-3 transition-all shadow-luxury hover:shadow-luxury-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-brand-500" strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">{label}</div>
                <div className="text-gray-400 text-xs mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Local Brands ────────────────────── */}
      <FeaturedBrands />

      {/* ── CTA Banner ───────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-500 to-brand-600 py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Still not sure?</h2>
          <p className="text-white/80 mb-8 font-medium">
            Let our AI guide you. 5 simple questions — curated ideas just for them.
          </p>
          <button
            onClick={() => navigate('/quiz')}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all active:scale-95"
          >
            <Gift size={18} />
            Start the Gift Quiz
          </button>
        </div>
      </section>

    </div>
  )
}
