import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { asset } from '../utils/assets.js'

export default function Nav({ scrolled = false, onBusinessModal }) {
  const [isScrolled, setIsScrolled] = useState(scrolled)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (scrolled) return
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [scrolled])

  return (
    <nav className={`nav ${isScrolled ? 'scrolled' : ''}`} id="nav">
      <div className="nav-bg"></div>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <img src={asset("/images/hp-logo-sm.png")} alt="HackPark" className="nav-logo-img"/>
          <span>HackPark</span>
        </Link>
          <div className="nav-links">
            <Link to="/#programs">Программы</Link>
            <Link to="/#leaders">Лидерборд</Link>
            <Link to="/#how">Как это работает</Link>
            <Link to="/#faq">FAQ</Link>
            <Link to="/about">HackPark</Link>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-ghost">Вход</Link>
            <Link to="/register" className="btn btn-primary">Регистрация</Link>
            <button className="btn btn-accent" onClick={() => onBusinessModal?.()}>Добавить бизнес</button>
          </div>
            <button className={`nav-menu-btn ${mobileOpen ? 'open' : ''}`} id="menuBtn" aria-label="Меню" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>
              <span></span><span></span>
            </button>
          </div>
          <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} id="mobileMenu">
              <Link to="/#programs" onClick={() => setMobileOpen(false)}>Программы</Link>
            <Link to="/#leaders" onClick={() => setMobileOpen(false)}>Лидерборд</Link>
            <Link to="/#how" onClick={() => setMobileOpen(false)}>Как это работает</Link>
            <Link to="/#faq" onClick={() => setMobileOpen(false)}>FAQ</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)}>HackPark</Link>
            <div className="mobile-menu-actions">
              <Link to="/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Регистрация</Link>
              <button className="btn btn-accent" onClick={() => { setMobileOpen(false); onBusinessModal?.() }}>Добавить бизнес</button>
            </div>
            </div>
        </nav>
  )
}