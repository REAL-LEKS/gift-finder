import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Gift, Search, Heart, User } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const navLinks = [
    { label: 'Concierge', path: '/' },
    { label: 'Curated', path: '/results' },
    { label: 'Occasions', path: '/quiz' },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-luxury">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5">
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

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-brand-500">
            <Search size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gold-500">
            <Heart size={16} />
          </button>
          <button
            onClick={() => navigate('/quiz')}
            className="ml-1 w-8 h-8 flex items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            <User size={14} />
          </button>
        </div>

      </div>
    </nav>
  )
}
