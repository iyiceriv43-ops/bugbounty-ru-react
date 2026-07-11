import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAllPrograms, getProgram, logoStyle } from '../data/programs.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getReports, addReport, genReportId, getDashData, addDashReport } from '../data/store.js'
import '../styles/target.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { asset } from '../utils/assets.js'

// ── Severity helpers ──
const SEVS = ['Critical', 'High', 'Medium', 'Low']
const SEV_CLASS = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' }

const MOCK_NAMES = ['ne0n_h4wk','kr0pt_x','v3nom_str1ke','gh0st_w1re','by7e_f4ng','qu4nt_l3ak','sh4d0_p1ng','d4rk_p0rt']

function esc(s) { return s ? String(s) : '' }

function fmtDate(dateStr, opts) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('ru-RU', opts)
  } catch { return '—' }
}

// ── CVSS calc ──
function calcCvss(v) {
  if (!v) return null
  const metrics = {}
  v.split('/').forEach(m => { const p = m.split(':'); if (p.length === 2) metrics[p[0]] = p[1] })
  const av = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 }[metrics.AV] || 0
  const ac = { L: 0.77, H: 0.44 }[metrics.AC] || 0
  const pr = { N: 0.85, L: 0.62, H: 0.27 }[metrics.PR] || 0
  const ui = { N: 0.85, R: 0.62 }[metrics.UI] || 0
  const cI = { H: 0.56, L: 0.22, N: 0 }[metrics.C] || 0
  const iI = { H: 0.56, L: 0.22, N: 0 }[metrics.I] || 0
  const aI = { H: 0.56, L: 0.22, N: 0 }[metrics.A] || 0
  const iss = 1 - ((1 - cI) * (1 - iI) * (1 - aI))
  const sc = metrics.S === 'C'
  const impact = sc ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15) : 6.42 * iss
  const exploit = 8.22 * av * ac * pr * ui
  const base = impact <= 0 ? 0 : (sc ? Math.min(10, 1.08 * (impact + exploit)) : Math.min(10, impact + exploit))
  const score = Math.ceil(base * 10) / 10
  if (isNaN(score) || score < 0) return null
  return score
}

function cvssScoreClass(score) {
  if (score === null) return 'tgt-rpt-cvss-score'
  if (score >= 7) return 'tgt-rpt-cvss-score high-score'
  if (score >= 4) return 'tgt-rpt-cvss-score med-score'
  return 'tgt-rpt-cvss-score low-score'
}

// ── Icons ──
const IconOverview = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
const IconTargets = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IconSend = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconReports = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconRanking = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const IconArticles = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
const IconActivity = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IconBack = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
const IconHome = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
const IconLogout = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconWarn = () => <svg className="tgt-warn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
const IconX = () => <svg className="tgt-x-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
const IconExtLink = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
const IconSend2 = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IconCheck = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconChevron = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>

const NavItem = ({ to, active, children }) => (
  <Link to={to} className={'tgt-nav-item' + (active ? ' active' : '')}>
    {children}
  </Link>
)

export default function TargetPage() {
  useDocumentTitle('Таргет — HackPark')
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const programs = getAllPrograms()
  const program = slug ? getProgram(slug) : null
  useDocumentTitle(program ? (program.company + ' — HackPark') : 'Таргет — HackPark')

  // ── User info ──
  const authed = !!user
  const dashData = getDashData()
  const username = (user && (user.user || user.name)) || 'исследователь'
  const displayName = username.split('@')[0] || username
  const userRank = dashData.rank || 'Skiller'

  // ── Mobile sidebar ──
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Program switcher dropdown ──
  const [progSwitcherOpen, setProgSwitcherOpen] = useState(false)
  const progSwitcherRef = useRef(null)

  // ── Active tab ──
  const [activeTab, setActiveTab] = useState('description')

  // ── Report form state ──
  const [rptTitle, setRptTitle] = useState('')
  const [rptDesc, setRptDesc] = useState('')
  const [rptSev, setRptSev] = useState('')
  const [rptCvss, setRptCvss] = useState('')
  const [rptSteps, setRptSteps] = useState([''])
  const [rptErrors, setRptErrors] = useState({})
  const [rptFormErr, setRptFormErr] = useState('')
  const [rptSuccess, setRptSuccess] = useState(false)

  // ── Chat state ──
  const [chatKeys, setChatKeys] = useState([])
  const [activeChatKey, setActiveChatKey] = useState(null)
  const [chatMsgs, setChatMsgs] = useState([])
  const [chatInput, setChatInput] = useState('')

  // ── Close program switcher on outside click ──
  useEffect(() => {
    const onClick = (e) => {
      if (progSwitcherRef.current && !progSwitcherRef.current.contains(e.target)) {
        setProgSwitcherOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // ── Reset state when slug changes ──
  useEffect(() => {
    setActiveTab('description')
    setRptTitle(''); setRptDesc(''); setRptSev(''); setRptCvss(''); setRptSteps([''])
    setRptErrors({}); setRptFormErr(''); setRptSuccess(false)
    setChatKeys([]); setActiveChatKey(null); setChatMsgs([]); setChatInput('')
    setProgSwitcherOpen(false)
  }, [slug])

  // ── Chat: load messages for active chat ──
  useEffect(() => {
    if (!activeChatKey) { setChatMsgs([]); return }
    try {
      setChatMsgs(JSON.parse(localStorage.getItem(activeChatKey) || '[]'))
    } catch { setChatMsgs([]) }
  }, [activeChatKey])

  // ── Chat: load chat list from saved reports ──
  useEffect(() => {
    if (!slug) return
    const reports = getReports().filter(r => r.slug === slug)
    const keys = reports.map(r => 'hackpark_report_chat_' + r.id)
    setChatKeys(keys)
  }, [slug, rptSuccess])

  if (!authed) {
    return null
  }

  if (!program) {
    return (
      <>
        <div className={'tgt-overlay' + (sidebarOpen ? ' open' : '')} onClick={() => setSidebarOpen(false)} />
        <div className="tgt-body">
          <Sidebar activeSlug={slug} sidebarOpen={sidebarOpen} displayName={displayName} userRank={userRank} onLogout={() => { logout(); navigate('/login') }} />
          <main className="tgt-main">
            <button className="tgt-mobile-toggle" onClick={() => setSidebarOpen(true)}><span /></button>
            <Link to="/dashboard#targets" className="tgt-back"><IconBack /> Назад</Link>
            <div className="tgt-notfound">
              <h1>Программа не найдена</h1>
              <p>Возможно, программа была удалена или ссылка некорректна.</p>
              <Link to="/dashboard#targets" className="btn btn-primary">К списку таргетов</Link>
            </div>
          </main>
        </div>
      </>
    )
  }

  const launchedDate = program.launchedAt
    ? fmtDate(program.launchedAt, { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const editedDate = program.editedAt
    ? fmtDate(program.editedAt, { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  // ── Handlers ──
  const handleSwitchProgram = (newSlug) => {
    setProgSwitcherOpen(false)
    navigate('/target/' + newSlug)
  }

  // Report form: severity select
  const selectSev = (sev) => {
    setRptSev(sev)
    setRptErrors(e => ({ ...e, tgtRptSev: '' }))
  }

  // Report form: CVSS
  const cvssScore = rptCvss.trim() ? calcCvss(rptCvss.trim()) : null
  const cvssDisplay = cvssScore !== null ? cvssScore.toFixed(1) : '—'

  // Report form: steps
  const addStep = () => setRptSteps(s => [...s, ''])
  const updateStep = (i, v) => setRptSteps(s => { const n = [...s]; n[i] = v; return n })
  const removeStep = (i) => setRptSteps(s => s.filter((_, idx) => idx !== i))

  // Report form: submit
  const submitReport = () => {
    const errs = {}
    if (!rptTitle.trim()) errs.tgtRptTitle = 'Введите название уязвимости'
    if (!rptSev) errs.tgtRptSev = 'Выберите severity'
    if (!rptDesc.trim()) errs.tgtRptDesc = 'Опишите уязвимость'
    const hasStep = rptSteps.some(s => s.trim())
    if (!hasStep) { setRptFormErr('Добавьте хотя бы один шаг воспроизведения') } else { setRptFormErr('') }
    setRptErrors(errs)
    if (Object.keys(errs).length || !hasStep) return

    const steps = rptSteps.filter(s => s.trim())
    const reportId = genReportId()
    const report = {
      id: reportId,
      target: program.company,
      slug: program.slug,
      title: rptTitle.trim(),
      severity: rptSev,
      cvss: rptCvss.trim(),
      desc: rptDesc.trim(),
      steps,
      status: 'triage',
      submittedAt: new Date().toISOString(),
    }
    addReport(report)
    addDashReport(0)

    const chatKey = 'hackpark_report_chat_' + reportId
    const initialMsgs = [
      { from: 'admin', text: `Отчёт «${report.title}» (${rptSev}) принят на триаж. Здесь можно обсудить детали уязвимости.`, ts: Date.now() },
    ]
    localStorage.setItem(chatKey, JSON.stringify(initialMsgs))

    setRptSuccess(true)
  }

  // Chat: send message
  const sendChatMsg = () => {
    const text = chatInput.trim()
    if (!text || !activeChatKey) return
    const msgs = [...chatMsgs, { from: 'me', text, ts: Date.now() }]
    localStorage.setItem(activeChatKey, JSON.stringify(msgs))
    setChatMsgs(msgs)
    setChatInput('')
    setTimeout(() => {
      const reply = 'Спасибо за сообщение! Администратор рассмотрит ваш вопрос и ответит в ближайшее время.'
      const cur = JSON.parse(localStorage.getItem(activeChatKey) || '[]')
      if (cur.length > 0 && cur[cur.length - 1].from === 'me') {
        cur.push({ from: 'admin', text: reply, ts: Date.now() })
        localStorage.setItem(activeChatKey, JSON.stringify(cur))
        setChatMsgs(cur)
      }
    }, 2000)
  }

  const ctaBtn = program.status === 'active'
    ? <Link to={'/report/' + encodeURIComponent(program.slug)} className="btn btn-primary btn-lg">Отправить отчёт →</Link>
    : <span className="btn btn-primary btn-lg" style={{ opacity: '.5', pointerEvents: 'none' }}>Отчёты не принимаются</span>

  const navItems = [
    { to: '/dashboard', icon: <IconOverview />, label: 'Обзор' },
    { to: '/dashboard#targets', icon: <IconTargets />, label: 'Таргеты', badge: '12', active: true },
    { to: '/report/' + (slug || ''), icon: <IconSend />, label: 'Отправить отчёт' },
    { to: '/dashboard#reports', icon: <IconReports />, label: 'Мои отчёты' },
    { to: '/dashboard#articles', icon: <IconArticles />, label: 'Статьи' },
    { to: '/dashboard#activity', icon: <IconActivity />, label: 'Активность' },
    { to: '/dashboard#leaderboard', icon: <IconRanking />, label: 'Рейтинг' },
  ]

  return (
    <>
      <div className={'tgt-overlay' + (sidebarOpen ? ' open' : '')} onClick={() => setSidebarOpen(false)} />
      <div className="tgt-body">
        {/* Sidebar */}
        <aside className={'tgt-sidebar' + (sidebarOpen ? ' open' : '')}>
          <Link to="/dashboard" className="tgt-sidebar-head">
            <img src={asset("/images/hp-logo-sm.png")} alt="HackPark" />
            <span>HackPark</span>
          </Link>
          <nav className="tgt-nav">
            {navItems.map((item, i) => (
              <NavItem key={i} to={item.to} active={item.active}>
                {item.icon}
                {item.label}
                {item.badge && <span className="tgt-nav-badge">{item.badge}</span>}
              </NavItem>
            ))}
            <div className="tgt-nav-divider" />
            <NavItem to="/">
              <IconHome />
              На главную
            </NavItem>
          </nav>
          <div className="tgt-sidebar-foot">
            <div className="tgt-user-card">
              <div className="tgt-avatar">{displayName.charAt(0).toUpperCase()}</div>
              <div className="tgt-user-info">
                <div className="tgt-user-name">{displayName}</div>
                <div className="tgt-user-rank">{userRank}</div>
              </div>
              <Link to="/login" onClick={(e) => { e.preventDefault(); logout(); navigate('/login') }} style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'none', color: 'var(--ink-3)', cursor: 'pointer', textDecoration: 'none' }} title="Выйти">
                <IconLogout />
              </Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="tgt-main">
          <button className="tgt-mobile-toggle" onClick={() => setSidebarOpen(true)}><span /></button>
          {/* Program switcher dropdown */}
          <div className="tgt-prog-switcher" ref={progSwitcherRef} style={{ position: 'relative', marginBottom: '20px' }}>
            <button
              className="btn btn-ghost"
              onClick={() => setProgSwitcherOpen(o => !o)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {program.company}
              <IconChevron />
            </button>
            {progSwitcherOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '6px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '12px', padding: '6px', zIndex: 200, minWidth: '220px', boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}>
                {programs.map(p => (
                  <div
                    key={p.slug}
                    onClick={() => handleSwitchProgram(p.slug)}
                    style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: p.slug === slug ? 700 : 500, color: p.slug === slug ? 'var(--g1)' : 'var(--ink-2)', background: p.slug === slug ? 'rgba(94,92,224,.08)' : 'transparent' }}
                    onMouseEnter={e => { if (p.slug !== slug) e.currentTarget.style.background = 'var(--bg-2)' }}
                    onMouseLeave={e => { if (p.slug !== slug) e.currentTarget.style.background = 'transparent' }}
                  >
                    {p.logo} {p.company}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Header */}
          <div className="tgt-header">
            <div className="tgt-logo" style={{ background: program.logoImg ? undefined : logoStyle(program.company) }}>
              {program.logoImg ? <img src={program.logoImg} alt={esc(program.company)} style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'contain', padding: '8px' }} /> : esc(program.logo || program.company.charAt(0))}
            </div>
            <div className="tgt-header-info">
              <h1>{esc(program.company)}</h1>
              {program.parentCompany && <div className="tgt-parent">Company: {esc(program.parentCompany)}</div>}
              <div className="tgt-desc">{esc(program.description)}</div>
              <div className="tgt-header-meta">
                {program.status === 'active' && <span className="tgt-status-badge"><span className="dot" />Активна</span>}
                {program.status === 'closed' && <span className="tgt-status-badge closed"><span className="dot" />Завершена</span>}
                {program.languages && program.languages.length > 0 && <span className="tgt-lang-badge">Языки: {program.languages.join(', ')}</span>}
                <span className="tgt-max-bounty"><span className="lbl">до</span>{esc(program.maxBounty)}</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="tgt-stats-row">
            <div className="tgt-stat-cell"><div className="v">{program.reportsAccepted || 0}</div><div className="l">Отчётов принято</div></div>
            <div className="tgt-stat-cell"><div className="v">{esc(program.responseTime || '—')}</div><div className="l">Время ответа</div></div>
            <div className="tgt-stat-cell"><div className="v">{esc(program.rewardTime || '—')}</div><div className="l">Выплата награды</div></div>
            <div className="tgt-stat-cell"><div className="v">{launchedDate}</div><div className="l">Запущена</div></div>
          </div>

          {/* Tabs */}
          <div className="tgt-tabs">
            {[
              { id: 'description', label: 'Описание' },
              { id: 'vulns', label: 'Уязвимости' },
              { id: 'ranking', label: 'Рейтинг' },
              { id: 'report', label: 'Отправить отчёт' },
              { id: 'chat', label: 'Чат с админом' },
              { id: 'versions', label: 'Версии' },
            ].map(tab => (
              <button
                key={tab.id}
                className={'tgt-tab' + (activeTab === tab.id ? ' active' : '')}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Tab: Description ── */}
          {activeTab === 'description' && (
            <div className="tgt-tab-content active">
              {program.description && (
                <div className="tgt-sec">
                  <div className="tgt-sec-title">Описание программы</div>
                  <div className="tgt-prose"><p>{esc(program.description)}</p></div>
                </div>
              )}

              {/* Scope */}
              <div className="tgt-sec">
                <div className="tgt-sec-title">Scope программы</div>
                {program.scope && program.scope.domains && program.scope.domains.length > 0 && (
                  <>
                    <div className="tgt-sec-subtitle">Домены</div>
                    <div className="tgt-scope-domains">
                      {program.scope.domains.map((d, i) => <span key={i} className="tgt-scope-domain">{esc(d)}</span>)}
                    </div>
                  </>
                )}
                {program.scope && program.scope.platforms && program.scope.platforms.length > 0 && (
                  <>
                    <div className="tgt-sec-subtitle">Платформы</div>
                    <div className="tgt-scope-platforms">
                      {program.scope.platforms.map((pl, i) => <span key={i} className="tgt-scope-platform">{esc(pl)}</span>)}
                    </div>
                  </>
                )}
                {program.scope && program.scope.docs && program.scope.docs.length > 0 && (
                  <>
                    <div className="tgt-sec-subtitle">Документация</div>
                    <div className="tgt-scope-docs">
                      {program.scope.docs.map((d, i) => (
                        <a key={i} href={d} target="_blank" rel="noopener noreferrer">
                          {esc(d)} <IconExtLink />
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Important notices */}
              {program.important && program.important.length > 0 && (
                <div className="tgt-sec">
                  <div className="tgt-sec-title">Важно</div>
                  <div className="tgt-important">
                    {program.important.map((item, i) => (
                      <div key={i} className="tgt-important-item">
                        <IconWarn />
                        <span>{esc(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Out of scope */}
              {program.outOfScope && program.outOfScope.length > 0 && (
                <div className="tgt-sec">
                  <div className="tgt-sec-title">Вне scope (не принимается)</div>
                  <div className="tgt-oos">
                    {program.outOfScope.map((item, i) => (
                      <div key={i} className="tgt-oos-item">
                        <IconX />
                        <span>{esc(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {program.rules && program.rules.length > 0 && (
                <div className="tgt-sec">
                  <div className="tgt-sec-title">Правила программы</div>
                  <div className="tgt-rules">
                    {program.rules.map((rule, i) => (
                      <div key={i} className="tgt-rule-item">
                        <div className="tgt-rule-num">{i + 1}</div>
                        <span>{esc(rule)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General info */}
              <div className="tgt-sec">
                <div className="tgt-sec-title">Общая информация</div>
                <div className="tgt-info-grid">
                  <div className="tgt-info-card"><div className="lbl">Время ответа</div><div className="val">{esc(program.responseTime || '—')}</div></div>
                  <div className="tgt-info-card"><div className="lbl">Выплата награды</div><div className="val">{esc(program.rewardTime || '—')}</div></div>
                  <div className="tgt-info-card"><div className="lbl">Запущена</div><div className="val">{launchedDate}</div></div>
                  <div className="tgt-info-card"><div className="lbl">Обновлена</div><div className="val">{editedDate}</div></div>
                </div>
              </div>

              {/* CTA */}
              <div className="tgt-cta">
                <div className="tgt-cta-text">
                  <h3>Нашёл уязвимость?</h3>
                  <p>Изучи scope и отправь отчёт на триадж.</p>
                </div>
                {ctaBtn}
              </div>
            </div>
          )}

          {/* ── Tab: Vulnerabilities ── */}
          {activeTab === 'vulns' && (
            <div className="tgt-tab-content active">
              {program.rewards && program.rewards.length > 0 ? (
                <div className="tgt-sec">
                  <div className="tgt-sec-title">Rewards: типы уязвимостей и награды</div>
                  <table className="tgt-rewards-table">
                    <thead>
                      <tr>
                        <th>Уязвимость</th>
                        <th style={{ textAlign: 'right' }}>Максимальная награда</th>
                      </tr>
                    </thead>
                    <tbody>
                      {program.rewards.map((r, i) => (
                        <tr key={i}>
                          <td>{esc(r.vuln)}</td>
                          <td className="tgt-bounty-cell">{esc(r.bounty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="tgt-sec"><p className="tgt-prose">Информация о наградах будет добавлена позже.</p></div>
              )}

              {program.important && program.important.length > 0 && (
                <div className="tgt-sec">
                  <div className="tgt-sec-title">Важно</div>
                  <div className="tgt-important">
                    {program.important.map((item, i) => (
                      <div key={i} className="tgt-important-item">
                        <IconWarn />
                        <span>{esc(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {program.outOfScope && program.outOfScope.length > 0 && (
                <div className="tgt-sec">
                  <div className="tgt-sec-title">Вне scope</div>
                  <div className="tgt-oos">
                    {program.outOfScope.map((item, i) => (
                      <div key={i} className="tgt-oos-item">
                        <IconX />
                        <span>{esc(item)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Ranking ── */}
          {activeTab === 'ranking' && (
            <div className="tgt-tab-content active">
              <div className="tgt-sec">
                <div className="tgt-sec-title">Топ исследователей программы</div>
                {program.reportsAccepted > 0 ? (
                  <div className="tgt-ranking">
                    {(() => {
                      const count = Math.min(8, Math.max(5, Math.ceil(program.reportsAccepted / 20)))
                      const rows = []
                      for (let i = 0; i < count; i++) {
                        const sev = SEVS[i % 3]
                        const sevClass = SEV_CLASS[sev]
                        const reward = 8000 - i * 800 > 1000 ? 8000 - i * 800 : 1000
                        rows.push(
                          <div key={i} className="tgt-rank-row">
                            <span className="tgt-rank-num">{i + 1}</span>
                            <span className="tgt-rank-name">{MOCK_NAMES[i % MOCK_NAMES.length]}</span>
                            <span className={'tgt-rank-sev ' + sevClass}>{sev}</span>
                            <span className="tgt-rank-reward">{reward.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        )
                      }
                      return rows
                    })()}
                  </div>
                ) : (
                  <div className="tgt-ranking">
                    <div className="tgt-rank-empty">Рейтинг пока пуст — стань первым!</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Report form ── */}
          {activeTab === 'report' && (
            <div className="tgt-tab-content active">
              <div className="tgt-sec">
                <div className="tgt-sec-title">Отправить отчёт по программе {esc(program.company)}</div>
                {program.status === 'active' && !rptSuccess && (
                  <div>
                    <div className="tgt-rpt-field">
                      <label>Программа</label>
                      <input type="text" value={program.company} readOnly style={{ background: 'var(--bg-2)', color: 'var(--ink-2)' }} />
                    </div>
                    <div className="tgt-rpt-field">
                      <label>Название уязвимости <span className="req">*</span></label>
                      <input type="text" value={rptTitle} onChange={e => { setRptTitle(e.target.value); setRptErrors(er => ({ ...er, tgtRptTitle: '' })) }} placeholder="Например: XSS в форме обратной связи" />
                      <span className="tgt-rpt-err">{rptErrors.tgtRptTitle || ''}</span>
                    </div>
                    <div className="tgt-rpt-field">
                      <label>Severity <span className="req">*</span></label>
                      <div className="tgt-rpt-sev-grid">
                        {[
                          { sev: 'Critical', cls: 'critical', reward: 'до ' + program.maxBounty },
                          { sev: 'High', cls: 'high', reward: 'до 200 000 ₽' },
                          { sev: 'Medium', cls: 'medium', reward: 'до 50 000 ₽' },
                          { sev: 'Low', cls: 'low', reward: 'до 10 000 ₽' },
                        ].map(s => (
                          <div
                            key={s.sev}
                            className={'tgt-rpt-sev-card ' + s.cls + (rptSev === s.sev ? ' selected' : '')}
                            onClick={() => selectSev(s.sev)}
                          >
                            <div className="tgt-rpt-sev-dot" />
                            <div className="tgt-rpt-sev-name">{s.sev}</div>
                            <div className="tgt-rpt-sev-reward">{s.reward}</div>
                          </div>
                        ))}
                      </div>
                      <span className="tgt-rpt-err">{rptErrors.tgtRptSev || ''}</span>
                    </div>
                    <div className="tgt-rpt-field">
                      <label>CVSS вектор <span className="hint">необязательно</span></label>
                      <div className="tgt-rpt-cvss-row">
                        <input type="text" value={rptCvss} onChange={e => setRptCvss(e.target.value)} placeholder="AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" />
                        <span className={cvssScoreClass(cvssScore)}>{cvssDisplay}</span>
                      </div>
                    </div>
                    <div className="tgt-rpt-field">
                      <label>Описание уязвимости <span className="req">*</span></label>
                      <textarea value={rptDesc} onChange={e => { setRptDesc(e.target.value); setRptErrors(er => ({ ...er, tgtRptDesc: '' })) }} placeholder="Опишите уязвимость подробно: что vulnerable, какой компонент, impact..." />
                      <span className="tgt-rpt-err">{rptErrors.tgtRptDesc || ''}</span>
                    </div>
                    <div className="tgt-rpt-field">
                      <div className="tgt-rpt-steps-header">
                        <strong>Шаги воспроизведения <span className="req">*</span></strong>
                        <button type="button" className="tgt-rpt-step-add" onClick={addStep}>+ Добавить шаг</button>
                      </div>
                      <div>
                        {rptSteps.map((step, i) => (
                          <div key={i} className="tgt-rpt-step-item">
                            <div className="tgt-rpt-step-num">{i + 1}</div>
                            <input type="text" value={step} onChange={e => updateStep(i, e.target.value)} placeholder={'Опишите шаг ' + (i + 1) + '...'} />
                            {rptSteps.length > 1 && (
                              <button type="button" className="tgt-rpt-step-remove" onClick={() => removeStep(i)}>×</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <span className="tgt-rpt-err" style={{ textAlign: 'center', fontSize: '13px', marginBottom: '12px', display: 'block' }}>{rptFormErr}</span>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button type="button" className="btn btn-primary btn-lg" onClick={submitReport}>Отправить отчёт →</button>
                    </div>
                  </div>
                )}
                {program.status === 'active' && rptSuccess && (
                  <div className="tgt-rpt-success">
                    <div className="tgt-rpt-check"><IconCheck /></div>
                    <h3>Отчёт передан на триадж</h3>
                    <p>Спасибо! Отчёт по программе <strong>{program.company}</strong> отправлен.<br />Статус: <strong>На триаже</strong>. Мы сообщим о решении.</p>
                    <Link to="/dashboard#reports" className="btn btn-primary">Мои отчёты →</Link>{' '}
                    <Link to="/dashboard#reports" className="btn btn-ghost">Чат с админом →</Link>
                  </div>
                )}
                {program.status !== 'active' && (
                  <div className="tgt-paused-banner">
                    {program.status === 'paused'
                      ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                      : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    }
                    <div>
                      <strong>Приём отчётов отключён</strong>
                      <span>Сейчас {program.status === 'paused' ? 'программа приостановлена' : 'программа закрыта'}. Отчёты не принимаются до изменения статуса.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Chat ── */}
          {activeTab === 'chat' && (
            <div className="tgt-tab-content active">
              <div className="tgt-sec">
                <div className="tgt-sec-title">Чат с администратором</div>
                {chatKeys.length > 0 ? (
                  <>
                    {/* Chat selector */}
                    {chatKeys.length > 1 && (
                      <div className="tgt-rpt-field">
                        <label>Выберите отчёт</label>
                        <select value={activeChatKey || ''} onChange={e => setActiveChatKey(e.target.value)}>
                          <option value="" disabled>— выберите —</option>
                          {chatKeys.map((k, i) => {
                            const r = getReports().find(r => 'hackpark_report_chat_' + r.id === k)
                            return <option key={k} value={k}>{r ? r.title : 'Чат ' + (i + 1)}</option>
                          })}
                        </select>
                      </div>
                    )}
                    {activeChatKey || chatKeys.length === 1 ? (
                      <div className="tgt-chat-box">
                        <div className="tgt-chat-head">
                          <div className="tgt-chat-avatar">A</div>
                          <div className="tgt-chat-info">
                            <strong>Администратор HackPark</strong>
                            <span><span className="dot" />онлайн</span>
                          </div>
                        </div>
                        <div className="tgt-chat-msgs">
                          {chatMsgs.length === 0
                            ? <div className="tgt-chat-empty">Нет сообщений. Напишите администратору — например, вопрос по scope программы или уточнение по отчёту.</div>
                            : chatMsgs.map((m, i) => {
                              const time = new Date(m.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                              const cls = m.from === 'me' ? 'me' : 'admin'
                              const avatar = m.from === 'me' ? displayName.charAt(0).toUpperCase() : 'A'
                              return (
                                <div key={i} className={'tgt-chat-msg ' + cls}>
                                  <div className="tgt-chat-msg-avatar">{avatar}</div>
                                  <div>
                                    <div className="tgt-chat-msg-bubble">{esc(m.text)}</div>
                                    <div className="tgt-chat-msg-time">{time}</div>
                                  </div>
                                </div>
                              )
                            })
                          }
                        </div>
                        <div className="tgt-chat-input-row">
                          <textarea
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMsg() } }}
                            placeholder="Напишите сообщение..."
                            rows="1"
                          />
                          <button className="tgt-chat-send" disabled={!chatInput.trim()} onClick={sendChatMsg}>
                            <IconSend2 />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-3)', fontSize: '14px', lineHeight: '1.6' }}>
                        Выберите отчёт, чтобы начать чат с админом.
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-3)', fontSize: '14px', lineHeight: '1.6' }}>
                    Чат создаётся автоматически при отправке отчёта.<br />
                    Отправьте отчёт во вкладке «Отправить отчёт»,<br />
                    затем вернитесь сюда, чтобы обсудить его с админом.<br /><br />
                    <Link to="/dashboard#reports" style={{ color: 'var(--g1)', fontWeight: 600 }}>Мои отчёты →</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Tab: Versions ── */}
          {activeTab === 'versions' && (
            <div className="tgt-tab-content active">
              <div className="tgt-sec">
                <div className="tgt-sec-title">История изменений</div>
                <div className="tgt-versions">
                  <div className="tgt-version">
                    <div className="tgt-version-date">{editedDate}</div>
                    <div className="tgt-version-changes">
                      Текущая версия
                      <ul>
                        <li>Обновлены правила программы</li>
                        <li>Обновлён scope</li>
                      </ul>
                    </div>
                  </div>
                  <div className="tgt-version">
                    <div className="tgt-version-date">{launchedDate}</div>
                    <div className="tgt-version-changes">
                      Программа запущена
                      <ul>
                        <li>Опубликованы правила и scope</li>
                        <li>Открыт приём отчётов</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

// ── Sidebar sub-component (for reuse in not-found) ──
function Sidebar({ activeSlug, sidebarOpen, displayName, userRank, onLogout }) {
  const navItems = [
    { to: '/dashboard', icon: <IconOverview />, label: 'Обзор' },
    { to: '/dashboard#targets', icon: <IconTargets />, label: 'Таргеты', badge: '12', active: true },
    { to: '/report/' + (activeSlug || ''), icon: <IconSend />, label: 'Отправить отчёт' },
    { to: '/dashboard#reports', icon: <IconReports />, label: 'Мои отчёты' },
    { to: '/dashboard#articles', icon: <IconArticles />, label: 'Статьи' },
    { to: '/dashboard#activity', icon: <IconActivity />, label: 'Активность' },
    { to: '/dashboard#leaderboard', icon: <IconRanking />, label: 'Рейтинг' },
  ]
  return (
    <aside className={'tgt-sidebar' + (sidebarOpen ? ' open' : '')}>
      <Link to="/dashboard" className="tgt-sidebar-head">
        <img src={asset("/images/hp-logo-sm.png")} alt="HackPark" />
        <span>HackPark</span>
      </Link>
      <nav className="tgt-nav">
        {navItems.map((item, i) => (
          <NavItem key={i} to={item.to} active={item.active}>
            {item.icon}
            {item.label}
            {item.badge && <span className="tgt-nav-badge">{item.badge}</span>}
          </NavItem>
        ))}
        <div className="tgt-nav-divider" />
        <NavItem to="/">
          <IconHome />
          На главную
        </NavItem>
      </nav>
      <div className="tgt-sidebar-foot">
        <div className="tgt-user-card">
          <div className="tgt-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div className="tgt-user-info">
            <div className="tgt-user-name">{displayName}</div>
            <div className="tgt-user-rank">{userRank}</div>
          </div>
          <Link to="/login" onClick={(e) => { e.preventDefault(); onLogout() }} style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'none', color: 'var(--ink-3)', cursor: 'pointer', textDecoration: 'none' }} title="Выйти">
            <IconLogout />
          </Link>
        </div>
      </div>
    </aside>
  )
}
