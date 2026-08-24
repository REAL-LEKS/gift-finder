import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Gift } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Gift Quiz', path: '/quiz' },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-luxury">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5" aria-label="GiftFinder home">
          <Gift size={18} className="text-gold-500" />
          <span className="font-extrabold text-brand-500 text-lg tracking-tight">GiftFinder</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map(({ label, path }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={label}
                to={path}
                className={`text-sm font-semibold transition-colors relative pb-0.5 ${
                  isActive
                    ? 'text-gold-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold-500 after:rounded-full'
                    : 'text-gray-500 hover:text-brand-500'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/quiz')}
          className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors active:scale-95"
        >
          <Gift size={14} />
          Find a Gift
        </button>

      </div>
    </nav>
  )
}
