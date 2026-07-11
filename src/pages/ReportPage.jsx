import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAllPrograms } from '../data/programs.js'
import { addReport, getReports, genReportId, addDashReport, getDashData, saveDashData } from '../data/store.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/report.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { asset } from '../utils/assets.js'

// ── Icons ──
const IconOverview = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
const IconTargets = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const IconSend = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconReports = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const IconRanking = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const IconBack = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
const IconHome = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
const IconLogout = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconLock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--g1)' }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconAttach = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
const IconFile = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
const IconCheck = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const IconPaused = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
const IconClosed = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>

const NavItem = ({ to, active, children }) => (
  <Link to={to} className={'rpt-nav-item' + (active ? ' active' : '')}>
    {children}
  </Link>
)

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
  if (score === null) return 'rpt-cvss-score'
  if (score >= 7) return 'rpt-cvss-score high-score'
  if (score >= 4) return 'rpt-cvss-score med-score'
  return 'rpt-cvss-score low-score'
}

const SEV_LIST = [
  { sev: 'Critical', cls: 'critical', reward: 'до 500 000 ₽' },
  { sev: 'High', cls: 'high', reward: 'до 200 000 ₽' },
  { sev: 'Medium', cls: 'medium', reward: 'до 50 000 ₽' },
  { sev: 'Low', cls: 'low', reward: 'до 10 000 ₽' },
]

const SEV_CLASS = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' }

export default function ReportPage() {
  useDocumentTitle('Отправить отчёт — HackPark')
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const programs = getAllPrograms()
  const lockedProgram = slug ? programs.find(p => p.slug === slug) : null

  const displayName = user ? (user.user || user.name || 'исследователь').split('@')[0] : 'исследователь'
  const dash = getDashData()
  const userRank = (dash && dash.rank) || 'Skiller'

  // ── State ──
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [target, setTarget] = useState(lockedProgram ? lockedProgram.company : '')
  const [targetSlug, setTargetSlug] = useState(lockedProgram ? lockedProgram.slug : '')
  const [selectedProgram, setSelectedProgram] = useState(lockedProgram ? lockedProgram.slug : '')
  const [title, setTitle] = useState('')
  const [selectedSev, setSelectedSev] = useState('')
  const [cvss, setCvss] = useState('')
  const [desc, setDesc] = useState('')
  const [steps, setSteps] = useState([{ id: 1, text: '' }])
  const [attachedFiles, setAttachedFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [reportId, setReportId] = useState('')
  const [succTarget, setSuccTarget] = useState('')
  const [succTitle, setSuccTitle] = useState('')
  const [succSev, setSuccSev] = useState('')
  const attachInputRef = useRef(null)
  const successRef = useRef(null)

  // If no slug or program not found, redirect to targets (after render)
  useEffect(() => {
    if (slug && !lockedProgram) {
      navigate('/dashboard#targets')
    }
  }, [slug, lockedProgram, navigate])

  // Scroll to success on submit
  useEffect(() => {
    if (submitted && successRef.current) {
      successRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [submitted])

  // ── CVSS score ──
  const cvssScore = cvss.trim() ? calcCvss(cvss.trim()) : null
  const cvssDisplay = cvssScore !== null ? cvssScore.toFixed(1) : '—'

  // ── Steps handlers ──
  const addStep = () => {
    setSteps(prev => [...prev, { id: prev.length + 1, text: '' }])
  }
  const updateStep = (id, text) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, text } : s))
  }
  const removeStep = (id) => {
    setSteps(prev => {
      const filtered = prev.filter(s => s.id !== id)
      return filtered.map((s, i) => ({ ...s, id: i + 1 }))
    })
  }

  // ── Attachments ──
  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) return
      setAttachedFiles(prev => [...prev, file])
    })
  }
  const removeFile = (idx) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx))
  }
  const handleAttachClick = () => { attachInputRef.current && attachInputRef.current.click() }
  const handleFileInput = (e) => { handleFiles(e.target.files); e.target.value = '' }
  const handleDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }
  const handleDragOver = (e) => { e.preventDefault() }
  const handleDragEnter = (e) => { e.preventDefault() }
  const handleDragLeave = (e) => { e.preventDefault() }

  // ── Program select ──
  const onProgramChange = (e) => {
    const programSlug = e.target.value
    setSelectedProgram(programSlug)
    const prog = programs.find(p => p.slug === programSlug)
    if (prog) {
      setTarget(prog.company)
      setTargetSlug(prog.slug)
    }
  }

  // ── Submit ──
  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!target) errs.program = 'Выберите программу'
    if (!title.trim()) errs.rptTitle = 'Введите название уязвимости'
    if (!selectedSev) errs.rptSeverity = 'Выберите severity'
    if (!desc.trim()) errs.rptDesc = 'Опишите уязвимость'
    const hasStep = steps.some(s => s.text.trim())
    if (!hasStep) setFormError('Добавьте хотя бы один шаг воспроизведения')
    else setFormError('')
    setErrors(errs)
    if (Object.keys(errs).length || !hasStep) return

    // Collect steps
    const stepTexts = steps.filter(s => s.text.trim()).map(s => s.text.trim())

    // Generate unique report ID
    const rid = genReportId()

    // Save report
    addReport({
      id: rid,
      reportId: rid,
      target,
      slug: targetSlug,
      title: title.trim(),
      severity: selectedSev,
      cvss: cvss.trim(),
      desc: desc.trim(),
      steps: stepTexts,
      filesCount: attachedFiles.length,
      reporter: displayName,
      reporterName: displayName,
      reporterKey: user?.authKey || null,
      status: 'triage',
      submittedAt: new Date().toISOString(),
    })

    // Update dash data
    const rewardEst = selectedSev === 'Critical' ? 100000 : selectedSev === 'High' ? 40000 : selectedSev === 'Medium' ? 10000 : 2000
    addDashReport(rewardEst)

    // Create chat for this report
    const chatKey = 'hackpark_report_chat_' + rid
    const chatMsgs = [{ from: 'admin', text: 'Отчёт «' + title.trim() + '» (' + selectedSev + ') принят на триаж. Здесь можно обсудить детали уязвимости.', ts: Date.now() }]
    localStorage.setItem(chatKey, JSON.stringify(chatMsgs))

    // Show success
    setSuccTarget(target)
    setSuccTitle(title.trim())
    setSuccSev(selectedSev)
    setReportId(rid)
    setSubmitted(true)
  }

  // ── Blocked program banner ──
  if (lockedProgram && lockedProgram.status && lockedProgram.status !== 'active') {
    const stTxt = lockedProgram.status === 'paused' ? 'приостановлена' : 'закрыта'
    return (
      <>
        <div className={'rpt-overlay' + (sidebarOpen ? ' open' : '')} onClick={() => setSidebarOpen(false)} />
        <div className="rpt-body">
          {/* Sidebar */}
          <aside className={'rpt-sidebar' + (sidebarOpen ? ' open' : '')}>
            <Link to="/dashboard" className="rpt-sidebar-head">
              <img src={asset("/images/hp-logo-sm.png")} alt="HackPark" />
              <span>HackPark</span>
            </Link>
            <nav className="rpt-nav">
              <NavItem to="/dashboard"><IconOverview />Обзор</NavItem>
              <NavItem to="/dashboard#targets"><IconTargets />Таргеты<span className="rpt-nav-badge">12</span></NavItem>
              <NavItem to="/dashboard#reports"><IconReports />Мои отчёты</NavItem>
              <span className="rpt-nav-item active"><IconSend />Отправить отчёт</span>
              <NavItem to="/dashboard#leaderboard"><IconRanking />Рейтинг</NavItem>
              <div className="rpt-nav-divider" />
              <NavItem to="/"><IconHome />На главную</NavItem>
            </nav>
            <div className="rpt-sidebar-foot">
              <div className="rpt-user-card">
                <div className="rpt-avatar">{displayName.charAt(0).toUpperCase()}</div>
                <div className="rpt-user-info">
                  <div className="rpt-user-name">{displayName}</div>
                  <div className="rpt-user-rank">{userRank}</div>
                </div>
                <Link to="/login" onClick={(e) => { e.preventDefault(); logout(); navigate('/login') }} style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'none', color: 'var(--ink-3)', cursor: 'pointer', textDecoration: 'none' }} title="Выйти">
                  <IconLogout />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="rpt-main">
            <button className="rpt-mobile-toggle" onClick={() => setSidebarOpen(true)}><span /></button>
            <Link to="/dashboard" className="rpt-back"><IconBack /> Назад к дашборду</Link>
            <div className="rpt-title-row">
              <h1>Отправка отчёта об уязвимости</h1>
              <span className="rpt-draft">Черновик</span>
            </div>
            <div className="rpt-blocked-banner">
              <div className="rpt-blocked-icon">
                {lockedProgram.status === 'paused' ? <IconPaused /> : <IconClosed />}
              </div>
              <h3>Программа {stTxt}</h3>
              <p>Приём отчётов по программе «{lockedProgram.company}» временно отключён. Выберите активную программу на дашбоарде.</p>
              <Link to="/dashboard#targets" className="btn btn-primary" style={{ marginTop: '16px' }}>К списку таргетов →</Link>
            </div>
          </main>
        </div>
      </>
    )
  }

  const navItems = [
    { to: '/dashboard', icon: <IconOverview />, label: 'Обзор' },
    { to: '/dashboard#targets', icon: <IconTargets />, label: 'Таргеты', badge: '12' },
    { to: '/report/' + (targetSlug || ''), icon: <IconSend />, label: 'Отправить отчёт', active: true },
    { to: '/dashboard#reports', icon: <IconReports />, label: 'Мои отчёты' },
    { to: '/dashboard#leaderboard', icon: <IconRanking />, label: 'Рейтинг' },
  ]

  return (
    <>
      <div className={'rpt-overlay' + (sidebarOpen ? ' open' : '')} onClick={() => setSidebarOpen(false)} />
      <div className="rpt-body">
        {/* Sidebar */}
        <aside className={'rpt-sidebar' + (sidebarOpen ? ' open' : '')}>
          <Link to="/dashboard" className="rpt-sidebar-head">
            <img src={asset("/images/hp-logo-sm.png")} alt="HackPark" />
            <span>HackPark</span>
          </Link>
          <nav className="rpt-nav">
            {navItems.map((item, i) => (
              <NavItem key={i} to={item.to} active={item.active}>
                {item.icon}
                {item.label}
                {item.badge && <span className="rpt-nav-badge">{item.badge}</span>}
              </NavItem>
            ))}
            <div className="rpt-nav-divider" />
            <NavItem to="/">
              <IconHome />
              На главную
            </NavItem>
          </nav>
          <div className="rpt-sidebar-foot">
            <div className="rpt-user-card">
              <div className="rpt-avatar">{displayName.charAt(0).toUpperCase()}</div>
              <div className="rpt-user-info">
                <div className="rpt-user-name">{displayName}</div>
                <div className="rpt-user-rank">{userRank}</div>
              </div>
              <Link to="/login" onClick={(e) => { e.preventDefault(); logout(); navigate('/login') }} style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'none', color: 'var(--ink-3)', cursor: 'pointer', textDecoration: 'none' }} title="Выйти">
                <IconLogout />
              </Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="rpt-main">
          <button className="rpt-mobile-toggle" onClick={() => setSidebarOpen(true)}><span /></button>
          <Link to="/dashboard" className="rpt-back"><IconBack /> Назад к дашборду</Link>
          <div className="rpt-title-row">
            <h1>Отправка отчёта об уязвимости</h1>
            {!submitted && <span className="rpt-draft">Черновик</span>}
          </div>

          {!submitted && (
            <form className="rpt-form" noValidate onSubmit={handleSubmit}>
              {/* Program */}
              <div className="rpt-field">
                <label>Программа <span className="req">*</span></label>
                {lockedProgram ? (
                  <div className="rpt-locked-target">
                    <IconLock />
                    <span>{lockedProgram.company}</span>
                  </div>
                ) : (
                  <select value={selectedProgram} onChange={onProgramChange}>
                    <option value="">— Выберите программу —</option>
                    {programs.filter(p => p.status === 'active').map(p => (
                      <option key={p.slug} value={p.slug}>{p.company}</option>
                    ))}
                  </select>
                )}
                {errors.program && <span className="rpt-err">{errors.program}</span>}
              </div>

              {/* Title */}
              <div className="rpt-field">
                <label htmlFor="rptTitle">Название уязвимости <span className="req">*</span><span className="hint">— краткое описание проблемы</span></label>
                <input type="text" id="rptTitle" placeholder="Например: XSS в форме обратной связи на главной странице" value={title} onChange={(e) => setTitle(e.target.value)} />
                {errors.rptTitle && <span className="rpt-err">{errors.rptTitle}</span>}
              </div>

              {/* Severity */}
              <div className="rpt-field">
                <label>Severity <span className="req">*</span><span className="hint">— выберите критичность</span></label>
                <div className="rpt-sev-grid">
                  {SEV_LIST.map(s => (
                    <div
                      key={s.sev}
                      className={'rpt-sev-card ' + s.cls + (selectedSev === s.sev ? ' selected' : '')}
                      onClick={() => { setSelectedSev(s.sev); setErrors(prev => ({ ...prev, rptSeverity: '' })) }}
                    >
                      <div className="rpt-sev-dot" />
                      <div className="rpt-sev-name">{s.sev}</div>
                      <div className="rpt-sev-reward">{s.reward}</div>
                    </div>
                  ))}
                </div>
                {errors.rptSeverity && <span className="rpt-err">{errors.rptSeverity}</span>}
              </div>

              {/* CVSS */}
              <div className="rpt-field">
                <label htmlFor="rptCvss">CVSS вектор <span className="hint">— необязательно, но рекомендуется</span></label>
                <div className="rpt-cvss-row">
                  <input type="text" id="rptCvss" placeholder="AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" value={cvss} onChange={(e) => setCvss(e.target.value)} />
                  <span className={cvssScoreClass(cvssScore)}>{cvssDisplay}</span>
                </div>
              </div>

              {/* Description */}
              <div className="rpt-field">
                <label htmlFor="rptDesc">Описание уязвимости <span className="req">*</span><span className="hint">— подробное описание, impact</span></label>
                <textarea id="rptDesc" placeholder="Опишите уязвимость подробно: что именно vulnerable, какой компонент, какие данные или функции затронуты, какой потенциальный ущерб. Чем детальнее — тем быстрее триадж." value={desc} onChange={(e) => setDesc(e.target.value)} />
                {errors.rptDesc && <span className="rpt-err">{errors.rptDesc}</span>}
              </div>

              {/* Steps to reproduce */}
              <div className="rpt-steps-section">
                <div className="rpt-steps-header">
                  <strong>Шаги воспроизведения <span className="req">*</span></strong>
                  <button type="button" className="rpt-step-add" onClick={addStep}>+ Добавить шаг</button>
                </div>
                <div className="rpt-steps-list">
                  {steps.map((step, idx) => (
                    <div key={step.id} className="rpt-step-item">
                      <div className="rpt-step-num">{idx + 1}</div>
                      <div className="rpt-step-content">
                        <input
                          type="text"
                          className="rpt-step-input"
                          placeholder={'Опишите шаг ' + (idx + 1) + '...'}
                          value={step.text}
                          onChange={(e) => updateStep(step.id, e.target.value)}
                        />
                      </div>
                      {steps.length > 1 && (
                        <button type="button" className="rpt-step-remove" onClick={() => removeStep(step.id)}>×</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div className="rpt-field">
                <label>Вложения <span className="hint">— скриншоты, PoC, логи</span></label>
                <div
                  className="rpt-attach"
                  onClick={handleAttachClick}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                >
                  <div className="rpt-attach-icon"><IconAttach /></div>
                  <div className="rpt-attach-text"><strong>Нажмите для загрузки</strong> или перетащите файлы сюда</div>
                  <div className="rpt-attach-sub">PNG, JPG, PDF, TXT, — до 10 МБ каждый</div>
                  <input
                    type="file"
                    ref={attachInputRef}
                    multiple
                    style={{ display: 'none' }}
                    accept=".png,.jpg,.jpeg,.pdf,.txt,.gif,.webp"
                    onChange={handleFileInput}
                  />
                </div>
                {attachedFiles.length > 0 && (
                  <div className="rpt-attach-files">
                    {attachedFiles.map((file, idx) => (
                      <div key={idx} className="rpt-attach-file">
                        <IconFile />
                        <span>{file.name} ({(file.size / 1024).toFixed(0)} КБ)</span>
                        <button type="button" className="rpt-file-remove" onClick={() => removeFile(idx)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {formError && <span className="rpt-err" style={{ textAlign: 'center', fontSize: '13px' }}>{formError}</span>}

              {/* Actions */}
              <div className="rpt-actions">
                <Link to="/dashboard" className="btn btn-ghost btn-lg">Отмена</Link>
                <button type="submit" className="btn btn-primary btn-lg">Отправить на триадж →</button>
              </div>
            </form>
          )}

          {/* Success */}
          <div className="rpt-success" ref={successRef} style={{ display: submitted ? 'block' : 'none' }}>
            <div className="rpt-success-icon"><IconCheck /></div>
            <h2>Отчёт отправлен</h2>
            <p>Ваш отчёт передан на триадж. Очки и награда будут начислены после подтверждения уязвимости. Результат придёт в течение 3 рабочих дней.</p>
            <div className="rpt-success-info">
              <div className="rpt-success-row"><span>Программа:</span><strong>{succTarget}</strong></div>
              <div className="rpt-success-row"><span>Уязвимость:</span><strong>{succTitle}</strong></div>
              <div className="rpt-success-row"><span>Severity:</span><strong>{succSev}</strong></div>
              <div className="rpt-success-row"><span>ID отчёта:</span><strong style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--g1)' }}>{reportId}</strong></div>
              <div className="rpt-success-row"><span>Статус:</span><span className="rpt-success-badge">На триаже</span></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard#reports" className="btn btn-primary btn-lg">Мои отчёты</Link>
              <Link to="/dashboard#targets" className="btn btn-ghost btn-lg">К списку таргетов</Link>
              <Link to="/dashboard#reports" className="btn btn-ghost btn-lg">Перейти к чату →</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
