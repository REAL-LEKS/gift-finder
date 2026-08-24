import { Link } from 'react-router-dom'
import { Gift } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          <Link to="/" className="flex items-center gap-1.5" aria-label="GiftFinder home">
            <Gift size={16} className="text-gold-500" />
            <span className="font-extrabold text-brand-500 text-base tracking-tight">GiftFinder</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium text-gray-400">
            <Link to="/quiz" className="hover:text-brand-500 transition-colors">Gift Quiz</Link>
            <a href="https://www.jumia.com.ng" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Jumia</a>
            <a href="https://www.konga.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Konga</a>
          </nav>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} GiftFinder. Premium Gifting for Nigeria.
          </p>

        </div>
      </div>
    </footer>
  )
}
