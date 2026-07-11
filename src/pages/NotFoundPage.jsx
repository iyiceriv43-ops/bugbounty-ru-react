import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function NotFoundPage() {
  useDocumentTitle('404 — HackPark')
  return (
    <>
      <Nav scrolled />
      <div className="articles-page" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="articles-page-inner" style={{ maxWidth: 520, textAlign: 'center' }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--g1)', fontFamily: 'var(--font-head)', marginBottom: 8 }}>404</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Страница не найдена</h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 15, marginBottom: 24 }}>
            Возможно, страница была перемещена или вы перешли по устаревшей ссылке.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/" className="btn btn-ghost">На главную</Link>
            <Link to="/dashboard" className="btn btn-primary">В дашборд</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
