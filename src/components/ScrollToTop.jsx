import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Reset scroll position to the top on every route change,
// or scroll to the element matching location.hash when present.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // Wait one frame so the target page/section is mounted, then smooth-scroll.
      const el = document.getElementById(hash.slice(1))
      if (el) {
        const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 0)
        return () => clearTimeout(t)
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}