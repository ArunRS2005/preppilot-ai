import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { PageTransition } from '@/components/ui/motion'

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-white">
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
