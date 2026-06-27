import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ArrowRight, Check,
  Heart, Users, User, Home, Briefcase, Star, Baby,
  Gift, GraduationCap, Moon, Gem, TreePine, PartyPopper,
  Wallet, CreditCard, Crown,
  Shirt, Smartphone, Gamepad2, Trophy, BookOpen, ChefHat,
  Sparkles, Dumbbell, Palette, Music,
  Laugh, Fingerprint, Wrench, Zap, Shield,
} from 'lucide-react'
import { answersToParams } from '../utils/recommendationEngine'

const QUESTIONS = [
  {
    id: 'recipient',
    title: 'Who are you shopping for?',
    subtitle: 'Tell us a bit about them to help our AI curate the perfect selection.',
    type: 'single',
    options: [
      { value: 'boyfriend',  label: 'Boyfriend',  icon: Heart },
      { value: 'girlfriend', label: 'Girlfriend',  icon: Sparkles },
      { value: 'friend',     label: 'Friend',      icon: Users },
      { value: 'dad',        label: 'Dad',         icon: Shield },
      { value: 'mum',        label: 'Mum',         icon: Home },
      { value: 'brother',    label: 'Brother',     icon: User },
      { value: 'sister',     label: 'Sister',      icon: Star },
      { value: 'coworker',   label: 'Colleague',   icon: Briefcase },
      { value: 'child',      label: 'Child',       icon: Baby },
    ],
  },
  {
    id: 'occasion',
    title: "What's the occasion?",
    subtitle: 'This helps us find the right vibe for the moment.',
    type: 'single',
    options: [
      { value: 'birthday',     label: 'Birthday',     icon: PartyPopper },
      { value: 'anniversary',  label: 'Anniversary',  icon: Heart },
      { value: 'graduation',   label: 'Graduation',   icon: GraduationCap },
      { value: 'wedding',      label: 'Wedding',      icon: Gem },
      { value: 'valentine',    label: "Valentine's",  icon: Heart },
      { value: 'christmas',    label: 'Christmas',    icon: TreePine },
      { value: 'eid',          label: 'Eid',          icon: Moon },
      { value: 'just-because', label: 'Just Because', icon: Gift },
    ],
  },
  {
    id: 'budget',
    title: "What's your budget?",
    subtitle: 'We have curated picks at every price point.',
    type: 'single',
    options: [
      { value: 'under5k',  label: 'Under ₦5,000',       icon: Wallet },
      { value: '5k-10k',   label: '₦5,000 – ₦10,000',   icon: Wallet },
      { value: '10k-20k',  label: '₦10,000 – ₦20,000',  icon: CreditCard },
      { value: '20k-50k',  label: '₦20,000 – ₦50,000',  icon: CreditCard },
      { value: '50k+',     label: '₦50,000+',            icon: Crown },
    ],
  },
  {
    id: 'interests',
    title: 'What do they love?',
    subtitle: 'Select all that apply — more picks = better matches.',
    type: 'multi',
    options: [
      { value: 'fashion',  label: 'Fashion',  icon: Shirt },
      { value: 'tech',     label: 'Tech',     icon: Smartphone },
      { value: 'gaming',   label: 'Gaming',   icon: Gamepad2 },
      { value: 'sports',   label: 'Sports',   icon: Trophy },
      { value: 'books',    label: 'Books',    icon: BookOpen },
      { value: 'cooking',  label: 'Cooking',  icon: ChefHat },
      { value: 'beauty',   label: 'Beauty',   icon: Sparkles },
      { value: 'fitness',  label: 'Fitness',  icon: Dumbbell },
      { value: 'art',      label: 'Art',      icon: Palette },
      { value: 'music',    label: 'Music',    icon: Music },
    ],
  },
  {
    id: 'giftType',
    title: 'What feeling should it convey?',
    subtitle: 'Pick the mood that matches your intention.',
    type: 'single',
    options: [
      { value: 'romantic',     label: 'Romantic',     icon: Heart },
      { value: 'funny',        label: 'Funny',        icon: Laugh },
      { value: 'luxury',       label: 'Luxury',       icon: Crown },
      { value: 'personalized', label: 'Personalized', icon: Fingerprint },
      { value: 'practical',    label: 'Practical',    icon: Wrench },
      { value: 'surprise',     label: 'Surprise',     icon: Zap },
    ],
  },
]

const EMPTY = { recipient: '', occasion: '', budget: '', interests: [], giftType: '' }

const CUSTOM_PLACEHOLDERS = {
  recipient:  'e.g. Grandma, Boss, Neighbour…',
  occasion:   'e.g. Promotion, New Baby, Farewell…',
  budget:     'Type a specific amount, e.g. ₦15,000…',
  interests:  'e.g. Gardening, Photography, Travel…',
  giftType:   'e.g. Educational, Nostalgic, Handmade…',
}

export default function Quiz() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(EMPTY)
  const [customText, setCustomText] = useState({})

  const question = QUESTIONS[step]
  const isMulti = question.type === 'multi'
  const currentValue = answers[question.id]

  const isSelected = (val) =>
    isMulti ? currentValue.includes(val) : currentValue === val

  const handleSelect = (val) => {
    if (isMulti) {
      setAnswers(prev => {
        const arr = prev.interests
        return { ...prev, interests: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] }
      })
    } else {
      setAnswers(prev => ({ ...prev, [question.id]: val }))
      setCustomText(prev => ({ ...prev, [question.id]: '' }))
    }
  }

  const handleCustomChange = (e) => {
    const text = e.target.value
    setCustomText(prev => ({ ...prev, [question.id]: text }))
    if (!isMulti && text) {
      setAnswers(prev => ({ ...prev, [question.id]: '' }))
    }
  }

  const hasCustom = !!(customText[question.id]?.trim())
  const canAdvance = isMulti ? (currentValue.length > 0 || hasCustom) : (!!currentValue || hasCustom)

  const handleNext = () => {
    if (!canAdvance) return
    if (step < QUESTIONS.length - 1) setStep(s => s + 1)
    else navigate(`/results?${answersToParams(answers)}`)
  }

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1)
    else navigate('/')
  }

  const progress = ((step + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAFAF8]">

      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-100/50 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

      {/* Top progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-gold-500 transition-all duration-500 rounded-r-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top navigation */}
      <div className="flex items-center justify-between px-5 py-4 relative z-10">
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:border-brand-200 transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-500">
          Step {step + 1} of {QUESTIONS.length}
        </span>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-gray-400 hover:text-brand-500 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto px-5 pb-32 pt-4">

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-500 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" />
          Curated Gifting
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
          {question.title}
        </h2>
        <p className="text-gray-400 text-sm font-medium mb-8">{question.subtitle}</p>

        {/* Options grid */}
        <div className={`grid gap-3 ${
          question.options.length <= 6 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'
        }`}>
          {question.options.map(({ value, label, icon: Icon }) => {
            const selected = isSelected(value)
            return (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className={`relative flex flex-col items-center justify-center py-6 px-4 rounded-3xl border-2 transition-all duration-200 bg-white group ${
                  selected
                    ? 'border-gold-500 shadow-md shadow-gold-100/60'
                    : 'border-gray-100 hover:border-brand-200 hover:shadow-sm'
                }`}
              >
                {/* Checkmark badge */}
                {selected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Icon circle */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  selected ? 'bg-gold-50' : 'bg-gray-50 group-hover:bg-brand-50'
                }`}>
                  <Icon
                    size={24}
                    className={selected ? 'text-gold-600' : 'text-gray-400 group-hover:text-brand-500'}
                    strokeWidth={1.75}
                  />
                </div>

                <span className={`text-sm font-semibold transition-colors ${
                  selected ? 'text-gold-600' : 'text-gray-700'
                }`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {isMulti && (
          <p className="mt-4 text-xs font-medium text-brand-400">
            Select one or more — then tap Continue
          </p>
        )}

        {/* Custom text input */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
            Or type your own
          </p>
          <input
            type="text"
            value={customText[question.id] ?? ''}
            onChange={handleCustomChange}
            placeholder={CUSTOM_PLACEHOLDERS[question.id]}
            className="w-full rounded-2xl border-2 border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-300 outline-none focus:border-gold-400 focus:ring-0 transition-colors"
          />
        </div>
      </div>

      {/* Fixed Continue button */}
      <div className="fixed bottom-8 right-6 z-20">
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className={`flex items-center gap-2 font-bold px-7 py-3.5 rounded-full text-sm transition-all shadow-lg ${
            canAdvance
              ? 'bg-gold-500 hover:bg-gold-600 text-white hover:scale-105 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          {step === QUESTIONS.length - 1 ? 'See Gifts' : 'Continue'}
          <ArrowRight size={15} />
        </button>
      </div>

    </div>
  )
}
