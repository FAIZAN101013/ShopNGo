import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router keeps the scroll position when the route changes, so a click
// from the footer used to land you at the bottom of the next page. Scrolling
// here means every link gets it for free, instead of each one needing its own
// onClick handler.
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default ScrollToTop
