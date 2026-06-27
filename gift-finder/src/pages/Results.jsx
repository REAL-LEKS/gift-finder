import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Gift, Search, Zap } from 'lucide-react'
import { getRecommendations, parseAnswersFromParams, matchPercent } from '../utils/recommendationEngine'
import ProductCard from '../components/ProductCard'
import LiveProducts from '../components/LiveProducts'
import giftsData from '../data/gifts.json'
import { localBrandProducts } from '../data/localBrands'

const ALL_GIFTS = [...giftsData, ...localBrandProducts]

const LABEL_MAP = {
  recipient: { boyfriend: 'Him', girlfriend: 'Her', friend: 'Your Friend', dad: 'Dad', mum: 'Mum', brother: 'Your Brother', sister: 'Your Sister', coworker: 'Your Colleague', child: 'the Little One' },
  occasion:  { birthday: 'Birthday', anniversary: 'Anniversary', graduation: 'Graduation', wedding: 'Wedding', valentine: "Valentine's Day", christmas: 'Christmas', eid: 'Eid', 'just-because': 'Just Because' },
  budget:    { 'under5k': 'Under ₦5k', '5k-10k': '₦5k – ₦10k', '10k-20k': '₦10k – ₦20k', '20k-50k': '₦20k – ₦50k', '50k+': '₦50k+' },
}

const INTEREST_FILTERS = [
  { value: 'all',     label: 'All Recommendations' },
  { value: 'fashion', label: 'Fashion & Style' },
  { value: 'tech',    label: 'Tech & Gadgets' },
  { value: 'beauty',  label: 'Beauty & Wellness' },
  { value: 'sports',  label: 'Sports & Fitness' },
  { value: 'art',     label: 'Art & Creative' },
]

export default function Results() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')

  const answers = parseAnswersFromParams(searchParams)
  const raw = getRecommendations(answers, ALL_GIFTS, 12)

  const recommendations = raw.map(gift => ({
    ...gift,
    matchPercent: matchPercent(gift.matchScore),
  }))

  const filtered = activeFilter === 'all'
    ? recommendations
    : recommendations.filter(g => g.interests.includes(activeFilter))

  const recipientLabel = LABEL_MAP.recipient[answers.recipient] ?? answers.recipient
  const occasionLabel  = LABEL_MAP.occasion[answers.occasion]   ?? answers.occasion
  const budgetLabel    = LABEL_MAP.budget[answers.budget]       ?? answers.budget

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* ── Header ───────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-6">
          <button
            onClick={() => navigate('/quiz')}
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-brand-500 text-sm font-medium mb-5 transition-colors"
          >
            <ArrowLeft size={14} />
            Retake quiz
          </button>

          <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
                Curated for {recipientLabel || 'You'}
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                We've analysed preferences and our Nigerian gift database to find these perfect matches
                {occasionLabel ? ` · ${occasionLabel}` : ''}
                {budgetLabel ? ` · ${budgetLabel}` : ''}.
              </p>
            </div>

            <button
              onClick={() => navigate('/quiz')}
              className="inline-flex items-center gap-2 border border-gray-200 hover:border-brand-300 text-gray-600 hover:text-brand-500 text-sm font-semibold px-4 py-2 rounded-full transition-all"
            >
              <RefreshCw size={13} />
              Start Over
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {INTEREST_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className={`flex-shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full border transition-all ${
                  activeFilter === value
                    ? 'bg-gold-500 text-white border-gold-500'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-500'
                }`}
              >
                {label}
                {value === 'all' && recommendations.length > 0 && (
                  <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFilter === 'all' ? 'bg-white/30 text-white' : 'bg-brand-50 text-brand-500'}`}>
                    {recommendations.length}
                  </span>
                )}
              </button>
            ))}

            {budgetLabel && (
              <div className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-full border border-gold-200 bg-gold-50 text-gold-600">
                <Zap size={10} />
                {budgetLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(gift => (
                <ProductCard key={gift.id} gift={gift} />
              ))}
            </div>

            {/* Live Jumia section */}
            <LiveProducts
              query={filtered[0]?.title ?? answers.recipient}
              jumiaSearchUrl={`https://www.jumia.com.ng/catalog/?q=${encodeURIComponent((filtered[0]?.title ?? answers.recipient) + ' gift')}`}
            />

            <div className="mt-12 bg-white rounded-4xl p-8 border border-brand-100 shadow-luxury text-center">
              <Gift size={28} className="text-gold-500 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 mb-1">Want more options?</h3>
              <p className="text-sm text-gray-400 mb-5">Adjust your answers to discover even more curated gift ideas.</p>
              <button
                onClick={() => navigate('/quiz')}
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <RefreshCw size={13} />
                Try Different Answers
              </button>
            </div>
          </>
        ) : recommendations.length > 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4 text-sm">No {activeFilter} gifts matched — showing all results.</p>
            <button onClick={() => setActiveFilter('all')} className="text-brand-500 font-semibold text-sm hover:underline">
              Clear filter
            </button>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="text-brand-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">No matches found</h2>
            <p className="text-gray-400 mb-6 text-sm">Try a different budget or occasion to see more results.</p>
            <button
              onClick={() => navigate('/quiz')}
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold px-6 py-3 rounded-full transition-all active:scale-95"
            >
              <ArrowLeft size={14} />
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
