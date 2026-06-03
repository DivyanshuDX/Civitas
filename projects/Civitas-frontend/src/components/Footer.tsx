import { Link } from 'react-router-dom'
import { Code, ExternalLink } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { NewsletterForm } from './NewsletterForm'

export const Footer = () => {
  return (
    <footer className="relative z-10 px-6 md:px-12 lg:px-20 pt-14 pb-14 bg-primary">
      <div className="max-w-6xl mx-auto text-white">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-xl font-800 tracking-tight mb-3 flex items-center gap-2.5">
              <span className="text-white">Civitas</span>
            </div>
            <p className="text-sm text-white/55 leading-relaxed mb-4">
              Privacy-first consent management on blockchain.
            </p>
            <div className="inline-block rounded-md bg-white/5 border border-white/10">
              <ThemeToggle />
            </div>
          </div>

          <div>
            <h4 className="font-display text-[11px] font-700 tracking-[0.15em] uppercase text-white/55 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-white/55">
              <li><Link to="/how-it-works" className="hover:text-white transition-colors duration-300">How it Works</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors duration-300">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors duration-300">Pricing</Link></li>
              <li><Link to="/migration" className="hover:text-white transition-colors duration-300">Migration</Link></li>
              <li><Link to="/roadmap" className="hover:text-white transition-colors duration-300">Roadmap</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-[11px] font-700 tracking-[0.15em] uppercase text-white/55 mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-white/55">
              <li><Link to="/contracts" className="hover:text-white transition-colors duration-300">Contracts</Link></li>
              <li><Link to="/intermezzo" className="hover:text-white transition-colors duration-300">Intermezzo</Link></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-[11px] font-700 tracking-[0.15em] uppercase text-white/55 mb-4">Contact Us</h4>
            <div className="flex items-center gap-3">
              <a href="https://www.linkedin.com/in/divyanshu-kumar-488262194/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="https://x.com/___venommm___" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://wa.me/+917887007214" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
              </a>
            </div>
            <p className="font-display text-[11px] font-700 tracking-[0.10em] text-white/55 mt-4 mb-1">Newsletter</p>
            <NewsletterForm />
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-display text-[11px] font-700 tracking-[0.15em] uppercase text-white mb-2 flex items-center gap-2">
              <Code className="w-3.5 h-3.5" />
              Developers
            </h4>
            <p className="text-xs text-white/55 mb-3 leading-relaxed">
              Integrate consent APIs directly into your platform
            </p>
            <a
              href="https://civitas-api.civitasv.workers.dev/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-display font-600 text-white hover:opacity-70 transition-opacity"
            >
              API Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="h-px bg-white/10 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/45">&copy; 2026 Civitas. Built on Algorand &middot; Privacy by Design</p>
          <div className="flex items-center gap-1.5 text-xs text-white/45">
            <span>Powered by</span>
            <span className="font-display font-700 text-white/60">Algorand</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
