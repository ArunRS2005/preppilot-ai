import { Link } from 'react-router-dom'
import { Zap, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-navy-900/50 py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-600">
              <Zap className="h-3 w-3 text-white" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-white">
              PrepPilot <span className="text-violet-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/settings" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link to="/settings" className="hover:text-slate-300 transition-colors">
              Settings
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <Github className="h-3.5 w-3.5" aria-hidden="true" />
              GitHub
            </a>
          </div>

          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} PrepPilot AI — Interview practice tool
          </p>
        </div>
      </div>
    </footer>
  )
}
