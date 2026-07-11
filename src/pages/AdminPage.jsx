import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { getAllPrograms, saveProgram, deleteProgram, savePrograms, resetPrograms, logoStyle } from '../data/programs.js'
import { getReports, saveReports, getChats, saveChats, getRewardMap, saveRewardMap, getXPMap, saveXPMap, isAdminAuthed, adminLogin, adminLogout, ADMIN_PASSWORD, addNotification } from '../data/store.js'
import { getUsers, saveUsers } from '../context/AuthContext.jsx'
import { getProfileSettings } from '../data/store.js'
import '../styles/admin.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { asset } from '../utils/assets.js'
import AdminName from '../components/AdminName.jsx'

// ── Helpers ────────────────────────────────────────
const CHAT_PREFIX = 'hackpark_report_chat_'
const DASH_KEY = 'hackpark_dash_data'
const AUTH_KEY = 'hackpark_auth'

function esc(s) { return s ? String(s) : '' }

function getReportChat(reportId) {
  try { return JSON.parse(localStorage.getItem(CHAT_PREFIX + reportId) || '[]') } catch { return [] }
}
function setReportChat(reportId, msgs) {
  localStorage.setItem(CHAT_PREFIX + reportId, JSON.stringify(msgs))
}
function getDashData() {
  try { return JSON.parse(localStorage.getItem(DASH_KEY) || '{}') } catch { return {} }
}
function setDashData(d) {
  localStorage.setItem(DASH_KEY, JSON.stringify(d))
}

const STATUS_MAP = {
  triage:    { label: 'На триаже',   cls: 'rpt-st-triage',    pill: 'triage',    pillLabel: 'На триаже' },
  confirmed: { label: 'Подтверждён', cls: 'rpt-st-confirmed', pill: 'confirmed', pillLabel: 'Подтверждён' },
  rejected:  { label: 'Отклонён',    cls: 'rpt-st-rejected',  pill: 'rejected',  pillLabel: 'Отклонён' },
}
function statusInfo(s) { return STATUS_MAP[s] || STATUS_MAP.triage }

const SEV_COLOR = { critical: '#ff3b30', high: '#ff9500', medium: '#ffcc00', low: '#34c759' }
const REWARD_MAP = { critical: 15000, high: 8000, medium: 3000, low: 1000 }
const XP_MAP = { critical: 500, high: 300, medium: 150, low: 50 }

const LIST_PLACEHOLDERS = {
  domains: 'https://example.com',
  platforms: 'Web',
  docs: 'https://docs.example.com',
  important: 'Важное замечание...',
  outOfScope: 'Не принимается...',
  rules: 'Правило программы...',
}

// ── Small SVG icon helpers ───────────────────────────
const Ico = {
  programs: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>),
  newProg: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  chat: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  report: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
  users: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  home: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>),
  dash: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>),
  logout: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>),
  plus16: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
  edit: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
  trash: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>),
  eye: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>),
  chevron: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>),
  send: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>),
  check: (n) => (<svg width={n||14} height={n||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  cross: (n) => (<svg width={n||14} height={n||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  gift: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>),
  requests: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
  doc: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>),
}

// ── Login screen ────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { if (inputRef.current) inputRef.current.focus() }, [])

  const submit = (e) => {
    e.preventDefault()
    if (adminLogin(pass)) {
      setErr('')
      onLogin()
    } else {
      setErr('Неверный пароль')
    }
  }

  return (
    <div className="adm-login">
      <div className="adm-login-box">
        <div className="adm-login-logo">
          <img src={asset("/images/hp-logo-sm.png")} alt="HackPark" />
          <span>HackPark</span>
          <span className="adm-tag">ADMIN</span>
        </div>
        <h1>Вход в админ-панель</h1>
        <p>Доступ только для администраторов платформы</p>
        <div className="adm-login-err">{err}</div>
        <form onSubmit={submit}>
          <div className="adm-field">
            <label htmlFor="admPass">Пароль администратора</label>
            <input type="password" id="admPass" ref={inputRef} autoFocus placeholder="Введите пароль"
              value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-full">Войти →</button>
        </form>
        <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none' }}>← На главную</Link>
      </div>
    </div>
  )
}

// ── Sidebar ─────────────────────────────────────────
function Sidebar({ view, onNav, authed, sidebarOpen, onCloseSidebar, pendingUsers, pendingReports, pendingBizRequests }) {
  const navItems = [
    { v: 'list',   label: 'Программы',        Icon: Ico.programs },
    { v: 'new',    label: 'Новая программа',  Icon: Ico.newProg },
    { v: 'chats',  label: 'Чаты',             Icon: Ico.chat },
    { v: 'reports', label: 'Отчёты',          Icon: Ico.report, badge: pendingReports },
    { v: 'users',  label: 'Пользователи',      Icon: Ico.users,  badge: pendingUsers },
    { v: 'requests', label: 'Заявки',           Icon: Ico.requests, badge: pendingBizRequests },
  ]
  return (
    <>
      {sidebarOpen && <div className={'adm-overlay' + (sidebarOpen ? ' open' : '')} onClick={onCloseSidebar} />}
      <aside className={'adm-sidebar' + (sidebarOpen ? ' open' : '')}>
        <Link to="/admin" className="adm-sidebar-head" onClick={onCloseSidebar}>
          <img src={asset("/images/hp-logo-sm.png")} alt="HackPark" />
          <span>HackPark</span>
          <span className="adm-sidebar-tag">ADMIN</span>
        </Link>
        <nav className="adm-nav">
          {navItems.map(({ v, label, Icon, badge }) => (
            <button key={v} className={'adm-nav-item' + (view === v || (v === 'list' && view === 'editor') ? ' active' : '')}
              onClick={() => onNav(v)}>
              <Icon /> {label}
              {badge > 0 && <span className="adm-nav-badge">{badge}</span>}
            </button>
          ))}
          <div className="adm-nav-divider" />
          <Link to="/" className="adm-nav-item" onClick={onCloseSidebar}><Ico.home /> На главную</Link>
          <Link to="/dashboard" className="adm-nav-item" onClick={onCloseSidebar}><Ico.dash /> Дашборд</Link>
        </nav>
        <div className="adm-sidebar-foot">
          <div className="adm-user-card">
            <div className="adm-avatar">A</div>
            <div className="adm-user-info">
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Администратор</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>admin@hackpark.ru</div>
            </div>
            <button onClick={authed.logout} title="Выйти"
              style={{ padding: 6, borderRadius: 8, border: 'none', background: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>
              <Ico.logout />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

// ── Toast ───────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [toast, onClose])
  if (!toast) return null
  return <div className={'adm-toast ' + (toast.type || '') + ' show'}>{toast.msg}</div>
}

// ── Program list view ───────────────────────────────
function ProgramListView({ programs, onEdit, onDelete, onNew }) {
  const total = programs.length
  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Программы Bug Bounty</h1>
          <div className="adm-sub">{total} программ</div>
        </div>
        <button className="btn btn-primary" onClick={onNew}><Ico.plus16 /> Новая программа</button>
      </div>
      <div className="adm-prog-list">
        {total === 0 ? (
          <div className="adm-empty">Нет программ. Создайте первую.</div>
        ) : programs.map(p => {
          const edited = p.editedAt ? new Date(p.editedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) : '—'
          return (
            <div className="adm-prog-row" key={p.slug}>
              <div className="adm-prog-logo" style={{ background: p.logoImg ? undefined : logoStyle(p.company), overflow: 'hidden' }}>{p.logoImg ? <img src={p.logoImg} alt={p.company} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.logo || (p.company && p.company.charAt(0)))}</div>
              <div className="adm-prog-main">
                <div className="adm-prog-name">{p.company}</div>
                <div className="adm-prog-meta">{p.reportsAccepted || 0} отчётов · обновлено {edited}</div>
              </div>
              <span className={'adm-prog-status ' + (p.status === 'active' ? 'active' : 'closed')}>
                {p.status === 'active' ? 'Активна' : 'Завершена'}
              </span>
              <div className="adm-prog-bounty">до {p.maxBounty}</div>
              <div className="adm-prog-actions">
                <Link to={'/target/' + p.slug} className="adm-icon-btn" title="Просмотр"><Ico.eye /></Link>
                <button className="adm-icon-btn" onClick={() => onEdit(p.slug)} title="Редактировать"><Ico.edit /></button>
                <button className="adm-icon-btn danger" onClick={() => onDelete(p.slug)} title="Удалить"><Ico.trash /></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Dynamic list control (string items) ─────────────
function StringListField({ title, listKey, items, placeholder, onChange }) {
  const add = () => onChange(listKey, [...items, ''])
  const remove = (i) => onChange(listKey, items.filter((_, idx) => idx !== i))
  const update = (i, val) => {
    const next = items.slice()
    next[i] = val
    onChange(listKey, next)
  }
  return (
    <div className="adm-list-section">
      <div className="adm-list-title">{title}
        <button type="button" className="adm-list-add" onClick={add}>+ Добавить</button>
      </div>
      <div id={'list-' + listKey}>
        {items.length === 0
          ? <div className="adm-list-empty">Нет элементов. Нажмите «+ Добавить»</div>
          : items.map((val, i) => (
            <div className="adm-list-item" key={i}>
              <input type="text" placeholder={placeholder} value={val}
                onChange={e => update(i, e.target.value)} />
              <button type="button" className="adm-list-remove" onClick={() => remove(i)}>×</button>
            </div>
          ))}
      </div>
    </div>
  )
}

// ── Rewards list control ────────────────────────────
function RewardListField({ items, onChange }) {
  const add = () => onChange([...items, { vuln: '', bounty: '' }])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i, field, val) => {
    const next = items.slice()
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }
  return (
    <div className="adm-list-section">
      <div className="adm-list-title">Награды (Rewards)
        <button type="button" className="adm-list-add" onClick={add}>+ Добавить</button>
      </div>
      <div id="list-rewards">
        {items.length === 0
          ? <div className="adm-list-empty">Нет наград. Нажмите «+ Добавить»</div>
          : items.map((r, i) => (
            <div className="adm-reward-row" key={i}>
              <input type="text" className="vuln" placeholder="Тип уязвимости" value={r.vuln || ''}
                onChange={e => update(i, 'vuln', e.target.value)} />
              <input type="text" className="bounty" placeholder="до 100 000 ₽" value={r.bounty || ''}
                onChange={e => update(i, 'bounty', e.target.value)} />
              <button type="button" className="adm-list-remove" onClick={() => remove(i)}>×</button>
            </div>
          ))}
      </div>
    </div>
  )
}

const EMPTY_PROGRAM = () => ({
  company: '', slug: '', parentCompany: '', logo: '', logoImg: '', description: '',
  languages: '', status: 'active', reportsAccepted: 0,
  maxBounty: '', responseTime: '', rewardTime: '',
  domains: [''], platforms: [''], docs: [''],
  important: [''], outOfScope: [''], rules: [''], rewards: [{ vuln: '', bounty: '' }],
})

// ── Editor view ─────────────────────────────────────
function EditorView({ initialSlug, onBack, onSaved }) {
  const editing = initialSlug != null
  const [form, setForm] = useState(() => {
    if (initialSlug) {
      const p = getAllPrograms().find(x => x.slug === initialSlug)
      if (p) {
        return {
          company: p.company || '', slug: p.slug || '', parentCompany: p.parentCompany || '',
          logo: p.logo || '', logoImg: p.logoImg || '', description: p.description || '',
          languages: (p.languages || []).join(', '),
          status: p.status || 'active', reportsAccepted: p.reportsAccepted || 0,
          maxBounty: p.maxBounty || '', responseTime: p.responseTime || '', rewardTime: p.rewardTime || '',
          domains: (p.scope && p.scope.domains || []).length ? p.scope.domains : [''],
          platforms: (p.scope && p.scope.platforms || []).length ? p.scope.platforms : [''],
          docs: (p.scope && p.scope.docs || []).length ? p.scope.docs : [''],
          important: (p.important || []).length ? p.important : [''],
          outOfScope: (p.outOfScope || []).length ? p.outOfScope : [''],
          rules: (p.rules || []).length ? p.rules : [''],
          rewards: (p.rewards || []).length ? p.rewards : [{ vuln: '', bounty: '' }],
          launchedAt: p.launchedAt,
        }
      }
    }
    return EMPTY_PROGRAM()
  })

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))
  const setList = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const submit = (e) => {
    e.preventDefault()
    const company = form.company.trim()
    let slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    if (!company) { onSaved('Введите название программы', 'error'); return }
    if (!slug) slug = company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const languages = form.languages.split(',').map(s => s.trim()).filter(Boolean)
    const cleanList = arr => arr.map(v => (typeof v === 'string' ? v.trim() : v)).filter(v => typeof v === 'string' ? v : (v && (v.vuln || v.bounty)))
    const program = {
      slug,
      company,
      parentCompany: form.parentCompany.trim(),
      logo: form.logo.trim() || company.charAt(0),
      logoImg: form.logoImg || null,
      description: form.description.trim(),
      languages,
      status: form.status,
      launchedAt: editing ? (form.launchedAt || new Date().toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10),
      editedAt: new Date().toISOString().slice(0, 10),
      responseTime: form.responseTime.trim(),
      rewardTime: form.rewardTime.trim(),
      maxBounty: form.maxBounty.trim(),
      reportsAccepted: parseInt(form.reportsAccepted, 10) || 0,
      scope: {
        domains: cleanList(form.domains),
        platforms: cleanList(form.platforms),
        docs: cleanList(form.docs),
      },
      important: cleanList(form.important),
      outOfScope: cleanList(form.outOfScope),
      rules: cleanList(form.rules),
      rewards: form.rewards.map(r => ({ vuln: (r.vuln || '').trim(), bounty: (r.bounty || '').trim() })).filter(r => r.vuln || r.bounty),
    }
    saveProgram(program)
    onSaved('Программа сохранена', 'success')
    onBack()
  }

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>{editing ? 'Редактирование: ' + form.company : 'Новая программа'}</h1>
          <div className="adm-sub">Редактирование программы Bug Bounty</div>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>← К списку</button>
      </div>
      <form onSubmit={submit}>
        <div className="adm-field-row">
          <div className="adm-field">
            <label>Название программы <span className="hint">*</span></label>
            <input type="text" placeholder="Например: Сбер" value={form.company} onChange={e => set('company', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Slug (URL) <span className="hint">* латиница, для URL</span></label>
            <input type="text" placeholder="sber" value={form.slug} onChange={e => set('slug', e.target.value)} />
          </div>
        </div>
        <div className="adm-field-row">
          <div className="adm-field">
            <label>Родительская компания</label>
            <input type="text" placeholder="Сбербанк" value={form.parentCompany} onChange={e => set('parentCompany', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Логотип таргета</label>
            <div className="adm-logo-upload">
              <div className="adm-logo-prev" style={{ background: form.logoImg ? undefined : logoStyle(form.company || form.logo || '?'), overflow: 'hidden' }}>
                {form.logoImg
                  ? <img src={form.logoImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (form.logo || (form.company || '?').charAt(0)).toUpperCase()}
              </div>
              <div className="adm-logo-actions">
                <label className="btn btn-ghost btn-sm dash-settings-file-btn">
                  Загрузить изображение
                  <input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      const img = new Image()
                      img.onload = () => {
                        const canvas = document.createElement('canvas')
                        const size = 128
                        canvas.width = size; canvas.height = size
                        canvas.getContext('2d').drawImage(img, 0, 0, size, size)
                        set('logoImg', canvas.toDataURL('image/jpeg', 0.85))
                      }
                      img.src = reader.result
                    }
                    reader.readAsDataURL(file)
                  }} hidden />
                </label>
                {form.logoImg && <button type="button" className="btn btn-ghost btn-sm" onClick={() => set('logoImg', '')}>Удалить</button>}
              </div>
            </div>
            <input type="text" placeholder="Или буква/символ (если нет изображения)" maxLength={2} value={form.logo} onChange={e => set('logo', e.target.value)} style={{ marginTop: 10 }} />
          </div>
        </div>
        <div className="adm-field">
          <label>Описание программы</label>
          <textarea placeholder="Описание компании и сервисов..." value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="adm-field-row-3">
          <div className="adm-field">
            <label>Максимальная награда</label>
            <input type="text" placeholder="500 000 ₽" value={form.maxBounty} onChange={e => set('maxBounty', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Время ответа</label>
            <input type="text" placeholder="3 рабочих дня" value={form.responseTime} onChange={e => set('responseTime', e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Срок выплаты</label>
            <input type="text" placeholder="до 10 рабочих дней" value={form.rewardTime} onChange={e => set('rewardTime', e.target.value)} />
          </div>
        </div>
        <div className="adm-field-row">
          <div className="adm-field">
            <label>Статус</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Активна</option>
              <option value="closed">Завершена</option>
            </select>
          </div>
          <div className="adm-field">
            <label>Отчётов принято</label>
            <input type="number" placeholder="0" value={form.reportsAccepted} onChange={e => set('reportsAccepted', e.target.value)} />
          </div>
        </div>
        <div className="adm-field">
          <label>Языки <span className="hint">через запятую</span></label>
          <input type="text" placeholder="Русский, English" value={form.languages} onChange={e => set('languages', e.target.value)} />
        </div>

        <StringListField title="Домены (Scope)" listKey="domains" items={form.domains}
          placeholder={LIST_PLACEHOLDERS.domains} onChange={setList} />
        <StringListField title="Платформы" listKey="platforms" items={form.platforms}
          placeholder={LIST_PLACEHOLDERS.platforms} onChange={setList} />
        <StringListField title="Документация (ссылки)" listKey="docs" items={form.docs}
          placeholder={LIST_PLACEHOLDERS.docs} onChange={setList} />
        <StringListField title="Важно (важные замечания)" listKey="important" items={form.important}
          placeholder={LIST_PLACEHOLDERS.important} onChange={setList} />
        <StringListField title="Вне scope (не принимается)" listKey="outOfScope" items={form.outOfScope}
          placeholder={LIST_PLACEHOLDERS.outOfScope} onChange={setList} />
        <StringListField title="Правила программы" listKey="rules" items={form.rules}
          placeholder={LIST_PLACEHOLDERS.rules} onChange={setList} />
        <RewardListField items={form.rewards} onChange={r => setList('rewards', r)} />

        <div className="adm-editor-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>Отмена</button>
          <button type="submit" className="btn btn-primary">Сохранить</button>
        </div>
      </form>
    </div>
  )
}

// ── Chat view ──────────────────────────────────────
function ChatView({ onToast, onGotoReport }) {
  const reports = getReports()
  const [activeChatKey, setActiveChatKey] = useState(null)
  const [chatInput, setChatInput] = useState('')
  const [refresh, setRefresh] = useState(0)
  const msgsRef = useRef(null)
  const inputRef = useRef(null)

  const allChats = reports.map(r => {
    const key = CHAT_PREFIX + r.id
    const msgs = getReportChat(r.id)
    let lastAdminIdx = -1
    msgs.forEach((m, i) => { if (m.from === 'admin') lastAdminIdx = i })
    let unread = 0, lastMsg = '', lastTs = 0
    msgs.forEach((m, i) => { if (m.from === 'me' && i > lastAdminIdx) unread++; lastTs = m.ts; lastMsg = m.text })
    return { key, reportId: r.id, report: r, msgs, unread, lastMsg, lastTs }
  }).sort((a, b) => b.lastTs - a.lastTs)

  const totalUnread = allChats.reduce((s, c) => s + c.unread, 0)

  const activeChat = allChats.find(c => c.key === activeChatKey) || null
  const activeReport = activeChat ? activeChat.report : null
  const activeMsgs = activeChat ? activeChat.msgs : []
  const rptStatus = activeReport ? (activeReport.status || 'triage') : 'triage'
  const stPill = statusInfo(rptStatus)
  const isResolved = rptStatus === 'confirmed' || rptStatus === 'rejected'

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [activeChatKey, refresh])

  const sendMsg = () => {
    const text = chatInput.trim()
    if (!text || !activeChatKey) return
    const msgs = [...getReportChat(activeChat.key.replace('hackpark_report_chat_', '')), { from: 'admin', text, ts: Date.now() }]
    setReportChat(activeChat.key.replace('hackpark_report_chat_', ''), msgs)
    setChatInput('')
    setRefresh(x => x + 1)
  }
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() }
  }

  const acceptReport = () => {
    const reportId = activeChat.key.replace('hackpark_report_chat_', '') //'hackpark_report_chat_'
    const reps = getReports()
    const idx = reps.findIndex(r => r.id === reportId)
    if (idx < 0) return
    reps[idx].status = 'confirmed'
    reps[idx].resolvedAt = new Date().toISOString()
    const sev = (reps[idx].severity || '').toLowerCase()
    const reward = REWARD_MAP[sev] || 1000
    const xp = XP_MAP[sev] || 50
    reps[idx].reward = reward
    saveReports(reps)
    const msgs = [...getReportChat(reportId), { from: 'admin', text: '✅ Отчёт подтверждён! Уязвимость принята. Награда: ' + reward.toLocaleString('ru-RU') + ' ₽ начислена на ваш баланс. XP: +' + xp + '.', ts: Date.now() }]
    setReportChat(reportId, msgs)
    const dash = getDashData()
    dash.earnings = (dash.earnings || 0) + reward
    dash.points = (dash.points || 0) + xp
    setDashData(dash)
    // Send notification to report author
    if (report && report.reporterKey) {
      addNotification(report.reporterKey, {
        type: 'report_confirmed',
        actorKey: 'admin',
        actorName: 'Админ',
        reportId: reportId,
        reportTitle: report.title || 'отчёт',
        reward: reward,
        xp: xp,
        text: 'Ваш отчёт «' + (report.title || '') + '» подтверждён! Награда: ' + reward.toLocaleString('ru-RU') + ' ₽, +' + xp + ' XP'
      })
    }
    onToast('Отчёт подтверждён. Награда ' + reward.toLocaleString('ru-RU') + ' ₽', 'success')
    setRefresh(x => x + 1)
  }
  const rejectReport = () => {
    const reportId = activeChat.key.replace('hackpark_report_chat_', '') //'hackpark_report_chat_'
    const reps = getReports()
    const idx = reps.findIndex(r => r.id === reportId)
    if (idx < 0) return
    reps[idx].status = 'rejected'
    reps[idx].resolvedAt = new Date().toISOString()
    saveReports(reps)
    const msgs = [...getReportChat(reportId), { from: 'admin', text: '❌ Отчёт отклонён. Уязвимость не подтверждена или не соответствует scope программы. Подробности можно обсудить в этом чате.', ts: Date.now() }]
    setReportChat(reportId, msgs)
    // Send notification to report author
    if (report && report.reporterKey) {
      addNotification(report.reporterKey, {
        type: 'report_rejected',
        actorKey: 'admin',
        actorName: 'Админ',
        reportId: reportId,
        reportTitle: report.title || 'отчёт',
        text: 'Ваш отчёт «' + (report.title || '') + '» отклонён. Подробности можно обсудить в чате.'
      })
    }
    onToast('Отчёт отклонён', '')
    setRefresh(x => x + 1)
  }

  const selectChat = (key) => { setActiveChatKey(key); setChatInput(''); setRefresh(x => x + 1) }

  const sev = activeReport ? (activeReport.severity || '') : ''
  const sevColor = SEV_COLOR[(sev || '').toLowerCase()] || '#34c759'

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Чаты с пользователями</h1>
          <div className="adm-sub">Обратная связь и вопросы по программам</div>
        </div>
        {totalUnread > 0 && <span className="adm-nav-badge" style={{ background: 'var(--accent2)' }}>{totalUnread}</span>}
      </div>
      <div className="adm-chat-layout">
        <div className="adm-chat-sidebar">
          <div className="adm-chat-sidebar-head">Диалоги</div>
          <div id="admChatUsers">
            {allChats.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13, lineHeight: 1.6 }}>
                Нет диалогов.<br />Чаты создаются автоматически<br />при отправке отчётов.
              </div>
            ) : allChats.map(c => {
              const rpt = c.report || {}
              const title = rpt.title || 'Отчёт'
              const target = rpt.target || ''
              const cls = (rpt.severity || 'R').charAt(0)
              const time = new Date(c.lastTs).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
              const rst = statusInfo(rpt.status)
              return (
                <div key={c.key} className={'adm-chat-user' + (c.key === activeChatKey ? ' active' : '')} onClick={() => selectChat(c.key)}>
                  <div className="adm-chat-user-avatar" style={{ background: SEV_COLOR[(rpt.severity || '').toLowerCase()] || '#34c759' }}>{cls}</div>
                  <div className="adm-chat-user-info">
                    <div className="adm-chat-user-name">{title}</div>
                    <div className="adm-chat-user-prog">{target}{rpt.reporterName ? ' · @' + rpt.reporterName : ''} · {time}</div>
                  </div>
                  <span className={'adm-chat-user-status ' + rst.pill}>{rst.label === 'На триаже' ? 'Триаж' : rst.label === 'Подтверждён' ? 'OK' : 'Нет'}</span>
                  {c.unread > 0 && <span className="adm-chat-user-badge">{c.unread}</span>}
                </div>
              )
            })}
          </div>
        </div>
        <div className="adm-chat-main" id="admChatMain">
          {!activeChat ? (
            <div className="adm-chat-no-select">Выберите диалог слева</div>
          ) : (
            <>
              <div className="adm-chat-topbar">
                <div className="adm-chat-topbar-avatar">U</div>
                <div>
                  <strong>{activeReport ? activeReport.title : 'Отчёт'}</strong>
                  <span>#{activeChat.key.replace(CHAT_PREFIX, '').replace('rpt-', '').split('-')[0]} · {activeReport ? activeReport.target : ''}{activeReport && activeReport.reporterName ? ' · @' + (activeReport.reporterKey ? <Link to={'/profile/' + activeReport.reporterKey} state={{ from: 'admin' }} style={{color:'var(--g1)',textDecoration:'none'}} onClick={e=>e.stopPropagation()}>{activeReport.reporterName}</Link> : activeReport.reporterName) : ''} · {sev}</span>
                </div>
                <div className="adm-chat-topbar-actions">
                  <span className={'adm-chat-status-pill ' + stPill.pill}>{stPill.pillLabel}</span>
                  {!isResolved && (
                    <>
                      <button className="adm-chat-triage-btn reject" onClick={rejectReport}>{Ico.cross()}Отклонить</button>
                      <button className="adm-chat-triage-btn accept" onClick={acceptReport}>{Ico.check()}Принять</button>
                    </>
                  )}
                  <a className="adm-chat-to-rpt" onClick={() => onGotoReport(activeChat.key.replace(CHAT_PREFIX, ''))}>{Ico.doc()}К отчёту</a>
                </div>
              </div>
              <div className="adm-chat-msgs" id="admChatMsgs" ref={msgsRef}>
                {activeMsgs.length === 0 ? (
                  <div className="adm-chat-empty-state">Нет сообщений</div>
                ) : activeMsgs.map((m, i) => {
                  const time = new Date(m.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                  const cls = m.from === 'me' ? 'user' : 'me'
                  const avatar = m.from === 'me' ? 'U' : 'A'
                  return (
                    <div className={'adm-chat-msg ' + cls} key={i}>
                      <div className="adm-chat-msg-avatar">{avatar}</div>
                      <div>
                        <div className="adm-chat-msg-bubble">{m.text}</div>
                        <div className="adm-chat-msg-time">{time}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="adm-chat-input-row">
                <textarea placeholder="Ответить..." rows={1} value={chatInput}
                  ref={inputRef}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={onKeyDown} />
                <button className="adm-chat-send" disabled={!chatInput.trim()} onClick={sendMsg}>{Ico.send()}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Reports list view ───────────────────────────────
const RPT_FILTERS = [
  { v: 'all', label: 'Все' },
  { v: 'triage', label: 'На триаже' },
  { v: 'confirmed', label: 'Принятые' },
  { v: 'rejected', label: 'Отклонённые' },
  { v: 'revision', label: 'Доработка' },
  { v: 'rewarded', label: 'Вознаграждён' },
]

function ReportsListView({ onOpenReport, onChatReport }) {
  const [filter, setFilter] = useState('all')
  const [, force] = useState(0)
  const reports = getReports()
  const triageCount = reports.filter(r => r.status === 'triage' || !r.status).length

  let filtered = reports
  if (filter === 'triage') filtered = reports.filter(r => r.status === 'triage' || !r.status)
  else if (filter === 'confirmed') filtered = reports.filter(r => r.status === 'confirmed')
  else if (filter === 'rejected') filtered = reports.filter(r => r.status === 'rejected')
  else if (filter === 'revision') filtered = reports.filter(r => r.status === 'needs_revision')
  else if (filter === 'rewarded') filtered = reports.filter(r => r.reward && r.reward > 0)

  filtered = filtered.slice().sort((a, b) => {
    const sa = (a.status === 'triage' || !a.status) ? 0 : 1
    const sb = (b.status === 'triage' || !b.status) ? 0 : 1
    if (sa !== sb) return sa - sb
    return new Date(b.submittedAt) - new Date(a.submittedAt)
  })

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Отчёты на триаж</h1>
          <div className="adm-sub">Входящие отчёты от исследователей</div>
        </div>
        {triageCount > 0 && <span className="adm-nav-badge" style={{ background: 'var(--bg-3)' }}>{triageCount}</span>}
      </div>
      <div className="adm-rpt-filters">
        {RPT_FILTERS.map(f => (
          <button key={f.v} className={'adm-rpt-filter' + (filter === f.v ? ' active' : '')} onClick={() => setFilter(f.v)}>{f.label}</button>
        ))}
      </div>
      <div id="rptListContainer">
        {filtered.length === 0 ? (
          <div className="adm-rpt-empty">Нет отчётов в этой категории.</div>
        ) : filtered.map(r => {
          const st = statusInfo(r.status)
          const sev = (r.severity || '').toLowerCase()
          const date = new Date(r.submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
          return (
            <div className="adm-rpt-row" key={r.id} onClick={() => onOpenReport(r.id)} style={{ cursor: 'pointer' }}>
              <div className={'adm-rpt-sev ' + sev}>{r.severity}</div>
              <div className="adm-rpt-info">
                <div className="adm-rpt-title">{r.title}</div>
                <div className="adm-rpt-meta">{r.target} · {date}</div>
              </div>
              <span className={'adm-rpt-status ' + st.cls}>{st.label}</span>
              <button className="adm-icon-btn" title="Чат с исследователем"
                onClick={e => { e.stopPropagation(); onChatReport(r.id) }}><Ico.chat /></button>
              <button className="adm-icon-btn" title="Подробнее"
                onClick={e => { e.stopPropagation(); onOpenReport(r.id) }}><Ico.chevron /></button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Report detail view ─────────────────────────────
function ReportDetailView({ reportId, onBack, onToast }) {
  const reports = getReports()
  const report = reports.find(r => r.id === reportId)
  const [chatInput, setChatInput] = useState('')
  const [refresh, setRefresh] = useState(0)
  const msgsRef = useRef(null)

  const chatKey = CHAT_PREFIX + reportId
  const chatMsgs = getReportChat(reportId)
  const st = statusInfo(report ? report.status : 'triage')
  const sev = (report ? report.severity : '').toLowerCase()
  const isResolved = report && (report.status === 'confirmed' || report.status === 'rejected' || report.status === 'needs_revision')

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight
  }, [refresh, reportId])

  if (!report) return (
    <div>
      <div className="adm-page-head">
        <div><h1>Отчёт</h1><div className="adm-sub">Просмотр и триаж</div></div>
        <button className="btn btn-ghost" onClick={onBack}>← К отчётам</button>
      </div>
      <div className="adm-rpt-empty">Отчёт не найден.</div>
    </div>
  )

  const date = new Date(report.submittedAt).toLocaleString('ru-RU')
  const stepsHtml = (report.steps || []).map((s, i) => (
    <div className="adm-rpt-step" key={i}>
      <span className="adm-rpt-step-num">{i + 1}</span>
      <span>{s}</span>
    </div>
  ))
  const lastAdminIdx = chatMsgs.reduce((acc, m, i) => m.from === 'admin' ? i : acc, -1)
  const unread = chatMsgs.filter((m, i) => m.from === 'me' && i > lastAdminIdx).length

  const detailReply = () => {
    const text = chatInput.trim()
    if (!text) return
    const msgs = [...getReportChat(reportId), { from: 'admin', text, ts: Date.now() }]
    setReportChat(reportId, msgs)
    setChatInput('')
    setRefresh(x => x + 1)
  }

  const acceptReport = () => {
    const reps = getReports()
    const idx = reps.findIndex(r => r.id === reportId)
    if (idx < 0) return
    reps[idx].status = 'confirmed'
    reps[idx].resolvedAt = new Date().toISOString()
    const sevL = (reps[idx].severity || '').toLowerCase()
    const reward = REWARD_MAP[sevL] || 1000
    const xp = XP_MAP[sevL] || 50
    reps[idx].reward = reward
    saveReports(reps)
    const msgs = [...getReportChat(reportId), { from: 'admin', text: '✅ Отчёт подтверждён! Уязвимость принята. Награда: ' + reward.toLocaleString('ru-RU') + ' ₽ начислена на ваш баланс. XP: +' + xp + '.', ts: Date.now() }]
    setReportChat(reportId, msgs)
    const dash = getDashData()
    dash.earnings = (dash.earnings || 0) + reward
    dash.points = (dash.points || 0) + xp
    setDashData(dash)
    // Send notification to report author
    if (activeReport && activeReport.reporterKey) {
      addNotification(activeReport.reporterKey, {
        type: 'report_confirmed',
        actorKey: 'admin',
        actorName: 'Админ',
        reportId: reportId,
        reportTitle: activeReport.title || 'отчёт',
        reward: reward,
        xp: xp,
        text: 'Ваш отчёт «' + (activeReport.title || '') + '» подтверждён! Награда: ' + reward.toLocaleString('ru-RU') + ' ₽, +' + xp + ' XP'
      })
    }
    onToast('Отчёт подтверждён. Награда ' + reward.toLocaleString('ru-RU') + ' ₽', 'success')
    setRefresh(x => x + 1)
  }
  const rejectReport = () => {
    const reps = getReports()
    const idx = reps.findIndex(r => r.id === reportId)
    if (idx < 0) return
    reps[idx].status = 'rejected'
    reps[idx].resolvedAt = new Date().toISOString()
    saveReports(reps)
    const msgs = [...getReportChat(reportId), { from: 'admin', text: '❌ Отчёт отклонён. Уязвимость не подтверждена или не соответствует scope программы. Подробности можно обсудить в этом чате.', ts: Date.now() }]
    setReportChat(reportId, msgs)
    // Send notification to report author
    if (activeReport && activeReport.reporterKey) {
      addNotification(activeReport.reporterKey, {
        type: 'report_rejected',
        actorKey: 'admin',
        actorName: 'Админ',
        reportId: reportId,
        reportTitle: activeReport.title || 'отчёт',
        text: 'Ваш отчёт «' + (activeReport.title || '') + '» отклонён. Подробности можно обсудить в чате.'
      })
    }
    onToast('Отчёт отклонён', '')
    setRefresh(x => x + 1)
  }

  const needsRevision = () => {
    const reps = getReports()
    const idx = reps.findIndex(r => r.id === reportId)
    if (idx < 0) return
    reps[idx].status = 'needs_revision'
    reps[idx].resolvedAt = new Date().toISOString()
    saveReports(reps)
    const msgs = [...getReportChat(reportId), { from: 'admin', text: '📝 Отчёт требует доработки. Пожалуйста, предоставьте дополнительные детали: шаги воспроизведения, PoC, скриншоты или описание влияния.', ts: Date.now() }]
    setReportChat(reportId, msgs)
    if (report && report.reporterKey) {
      addNotification(report.reporterKey, {
        type: 'report_revision',
        actorKey: 'admin',
        actorName: 'Админ',
        reportId: reportId,
        reportTitle: report.title || 'отчёт',
        text: 'Ваш отчёт «' + (report.title || '') + '» требует доработки. Проверьте чат для деталей.'
      })
    }
    onToast('Запрошена доработка', '')
    setRefresh(x => x + 1)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); detailReply() }
  }

  return (
    <div>
      <div className="adm-page-head">
        <div><h1>Отчёт</h1><div className="adm-sub">Просмотр и триаж</div></div>
        <button className="btn btn-ghost" onClick={onBack}>← К отчётам</button>
      </div>
      <div className="adm-rpt-detail-wrap">
        <div className="adm-rpt-detail-left">
          <div className="adm-rpt-detail-head">
            <div className={'adm-rpt-detail-sev ' + sev}>{report.severity}</div>
            <div className="adm-rpt-detail-title">
              <h2>{report.title}</h2>
              <span className={'adm-rpt-status ' + st.cls}>{st.label}</span>
            </div>
          </div>
          <div className="adm-rpt-detail-grid">
            <div className="adm-rpt-detail-section"><div className="adm-rpt-detail-label">ID отчёта</div><div className="adm-rpt-detail-val" style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--g1)' }}>{reportId}</div></div>
            <div className="adm-rpt-detail-section"><div className="adm-rpt-detail-label">Исследователь</div><div className="adm-rpt-detail-val">{report.reporterKey ? <Link to={"/profile/" + report.reporterKey} state={{ from: "admin" }} style={{color:"var(--g1)",textDecoration:"none"}}>{report.reporterName || report.reporter || '—'}</Link> : (report.reporterName || report.reporter || '—')}</div></div>
            <div className="adm-rpt-detail-section"><div className="adm-rpt-detail-label">Программа</div><div className="adm-rpt-detail-val">{report.target}</div></div>
            <div className="adm-rpt-detail-section"><div className="adm-rpt-detail-label">Severity</div><div className="adm-rpt-detail-val">{report.severity}</div></div>
            <div className="adm-rpt-detail-section"><div className="adm-rpt-detail-label">CVSS</div><div className="adm-rpt-detail-val">{report.cvss || '—'}</div></div>
            <div className="adm-rpt-detail-section"><div className="adm-rpt-detail-label">Дата</div><div className="adm-rpt-detail-val">{date}</div></div>
          </div>
          <div className="adm-rpt-detail-section">
            <div className="adm-rpt-detail-label">Описание уязвимости</div>
            <div className="adm-rpt-detail-text">{report.desc}</div>
          </div>
          {stepsHtml.length > 0 && (
            <div className="adm-rpt-detail-section">
              <div className="adm-rpt-detail-label">Шаги воспроизведения</div>
              <div className="adm-rpt-steps">{stepsHtml}</div>
            </div>
          )}
          <div className="adm-rpt-detail-section">
            <div className="adm-rpt-detail-label">Файлов прикреплено</div>
            <div className="adm-rpt-detail-val">{report.filesCount || 0}</div>
          </div>
          {!isResolved && (
            <div className="adm-rpt-actions">
              <button className="btn adm-btn-reject" onClick={rejectReport}>{Ico.cross(18)}Отклонить</button>
              <button className="btn adm-btn-revision" onClick={needsRevision}>📝 Доработка</button>
              <button className="btn adm-btn-accept" onClick={acceptReport}>{Ico.check(18)}Принять и начислить награду</button>
            </div>
          )}
        </div>
        <div className="adm-rpt-detail-chat">
          <div className="adm-rpt-chat-head">
            <div className="adm-rpt-chat-head-title">
              <Ico.chat /> Чат с исследователем
              {unread > 0 && <span className="adm-chat-user-badge">{unread}</span>}
            </div>
          </div>
          <div className="adm-rpt-chat-msgs" id="rptDetailChatMsgs" ref={msgsRef}>
            {chatMsgs.length === 0 ? (
              <div className="adm-rpt-chat-empty">Нет сообщений.<br />Начните диалог с исследователем.</div>
            ) : chatMsgs.map((m, i) => {
              const time = new Date(m.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
              const cls = m.from === 'me' ? 'user' : 'me'
              const avatar = m.from === 'me' ? 'U' : 'A'
              return (
                <div className={'adm-chat-msg ' + cls} key={i}>
                  <div className="adm-chat-msg-avatar">{avatar}</div>
                  <div>
                    <div className="adm-chat-msg-bubble">{m.text}</div>
                    <div className="adm-chat-msg-time">{time}</div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="adm-rpt-chat-input">
            <textarea placeholder="Ответить исследователю..." rows={1} value={chatInput}
              onChange={e => setChatInput(e.target.value)} onKeyDown={onKeyDown} />
            <button className="adm-rpt-chat-send" disabled={!chatInput.trim()} onClick={detailReply}>{Ico.send()}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Users view ─────────────────────────────────────
const USR_FILTERS = [
  { v: 'all', label: 'Все' },
  { v: 'pending', label: 'Ожидают' },
  { v: 'approved', label: 'Подтверждённые' },
  { v: 'banned', label: 'Заблокированные' },
]

const USER_STATUS_MAP = {
  pending:  { label: 'Ожидает',         cls: 'rpt-st-triage' },
  approved: { label: 'Подтверждён',     cls: 'rpt-st-confirmed' },
  banned:   { label: 'Заблокирован',    cls: 'rpt-st-rejected' },
}

function UsersView({ onToast }) {
  const [filter, setFilter] = useState('all')
  const [, force] = useState(0)
  const refresh = () => force(x => x + 1)
  const [rewardDialog, setRewardDialog] = useState(null)

  const users = getUsers()
  let filtered = users
  if (filter !== 'all') filtered = users.filter(u => u.status === filter)
  filtered = filtered.slice().sort((a, b) => {
    const order = { pending: 0, approved: 1, banned: 2 }
    const sa = order[a.status] != null ? order[a.status] : 3
    const sb = order[b.status] != null ? order[b.status] : 3
    if (sa !== sb) return sa - sb
    return new Date(b.submittedAt) - new Date(a.submittedAt)
  })

  const approveUser = (user) => {
    const list = getUsers()
    const realIdx = list.findIndex(u => u === user || u.authKey === user.authKey)
    if (realIdx < 0) return
    list[realIdx].status = 'approved'
    list[realIdx].approvedAt = new Date().toISOString()
    saveUsers(list)
    onToast('Пользователь «' + user.name + '» подтверждён. Ключ: ' + user.authKey, 'success')
    refresh()
  }
  const banUser = (user, isBan) => {
    if (isBan && !confirm('Заблокировать пользователя «' + user.name + '»?')) return
    const list = getUsers()
    const realIdx = list.findIndex(u => u === user || u.authKey === user.authKey)
    if (realIdx < 0) return
    if (isBan) {
      list[realIdx].status = 'banned'
      list[realIdx].bannedAt = new Date().toISOString()
      onToast('Пользователь «' + user.name + '» заблокирован', 'error')
    } else {
      list[realIdx].status = 'approved'
      delete list[realIdx].bannedAt
      onToast('Пользователь «' + user.name + '» разблокирован', 'success')
    }
    saveUsers(list)
    refresh()
  }
  const openReward = (user) => setRewardDialog({ user, reward: user.reward || 0, xp: user.bonusPoints || 0 })
  const saveReward = () => {
    if (!rewardDialog) return
    const reward = parseInt(rewardDialog.reward, 10)
    const xp = parseInt(rewardDialog.xp, 10)
    if (isNaN(reward) || reward < 0) { onToast('Неверная сумма', 'error'); return }
    const points = isNaN(xp) || xp < 0 ? 0 : xp
    const list = getUsers()
    const realIdx = list.findIndex(u => u === rewardDialog.user || u.authKey === rewardDialog.user.authKey)
    if (realIdx < 0) return
    list[realIdx].reward = reward
    list[realIdx].bonusPoints = points
    list[realIdx].rewardAt = new Date().toISOString()
    saveUsers(list)
    // Sync dash data for logged-in user
    try {
      const authData = JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
      if (authData && authData.authKey === rewardDialog.user.authKey) {
        const dash = getDashData()
        dash.bonusEarnings = reward
        dash.bonusPoints = points
        setDashData(dash)
      }
    } catch {}
    // Send notification to user
    addNotification(rewardDialog.user.authKey, {
      type: 'reward',
      actorKey: 'admin',
      actorName: 'Админ',
      reward: reward,
      xp: points,
      text: 'Админ начислил вам награду: ' + reward.toLocaleString('ru-RU') + ' ₽' + (points > 0 ? ' и ' + points + ' XP' : '')
    })
    onToast('Награда обновлена: ' + reward.toLocaleString('ru-RU') + ' ₽ / ' + points + ' XP', 'success')
    setRewardDialog(null)
    refresh()
  }

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h1>Пользователи</h1>
          <div className="adm-sub">{users.length} пользователей</div>
        </div>
      </div>
      <div className="adm-rpt-filters">
        {USR_FILTERS.map(f => (
          <button key={f.v} className={'adm-usr-filter' + (filter === f.v ? ' active' : '')} onClick={() => setFilter(f.v)}>{f.label}</button>
        ))}
      </div>
      <div id="usrListContainer">
        {filtered.length === 0 ? (
          <div className="adm-rpt-empty">Нет пользователей в этой категории.</div>
        ) : filtered.map((u) => {
          const st = USER_STATUS_MAP[u.status] || USER_STATUS_MAP.pending
          const date = new Date(u.submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
          const initial = (u.name || '?').charAt(0).toUpperCase()
          const rewardVal = u.reward || 0
          const pointsVal = u.bonusPoints || 0
          return (
            <div className="adm-prog-row" key={(u.authKey || u.email) + (u.submittedAt || '')} style={{ alignItems: 'center' }}>
              <div className="adm-prog-logo" style={{ width: 40, height: 40, fontSize: 16, overflow: 'hidden', background: (() => { let h=0; for(let i=0;i<(u.name||'').length;i++) h=(h*31+(u.name||'').charCodeAt(i))|0; return "linear-gradient(135deg,hsl("+Math.abs(h)%360+",65%,52%),hsl("+((Math.abs(h)%360)+40)%360+",60%,45%))" })() }}>
                {(() => { try { const ps = getProfileSettings(u.authKey); if (ps.avatar) return <img src={ps.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> } catch {} return initial })()}
              </div>
              <div className="adm-prog-main">
                <div className="adm-prog-name"><Link to={"/profile/" + u.authKey} state={{ from: "admin" }} style={{color:"inherit",textDecoration:"none"}} onClick={e=>e.stopPropagation()}><AdminName name={u.name} role={u.role} /></Link></div>
                <div className="adm-prog-meta">{u.email} · @{u.telegram} · рег. {date}</div>
                {u.authKey && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--g1)', marginTop: 4 }}>{u.authKey}</div>}
                {rewardVal > 0 && <div style={{ marginTop: 6, fontSize: 13, color: 'var(--accent3)' }}>★ Награда: {rewardVal.toLocaleString('ru-RU')} ₽</div>}
                {pointsVal > 0 && <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>+ {pointsVal} XP</div>}
              </div>
              <div className="adm-usr-actions-wrap">
                <span className={'adm-usr-status-pill ' + st.cls}>{st.label}</span>
                {u.role === 'admin' && <span style={{fontSize:11,fontWeight:600,padding:'3px 8px',borderRadius:'6px',background:'rgba(255,59,48,.12)',color:'#ff3b30'}}>АДМИН</span>}
                <div className="adm-prog-actions" style={{ gap: 8 }}>
                  {u.status === 'pending' && (
                    <>
                      <button className="btn btn-primary adm-usr-btn" onClick={() => approveUser(u)}>{Ico.check()}Подтвердить</button>
                      <button className="btn btn-ghost adm-usr-btn adm-usr-btn-deny" onClick={() => banUser(u, true)}>Отклонить</button>
                    </>
                  )}
                  {u.status === 'approved' && u.role !== 'admin' && (
                    <>
                      <button className="btn btn-primary adm-usr-btn" onClick={() => openReward(u)}>{Ico.gift()}Награда</button>
                      <button className="btn btn-ghost adm-usr-btn adm-usr-btn-deny" onClick={() => banUser(u, true)}>Заблокировать</button>
                    </>
                  )}
                  {u.status === 'banned' && u.role !== 'admin' && (
                    <button className="btn btn-ghost adm-usr-btn adm-usr-btn-unban" onClick={() => banUser(u, false)}>Разблокировать</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {rewardDialog && (
        <div className="adm-dialog-overlay open" onClick={() => setRewardDialog(null)}>
          <div className="adm-login-box" style={{ maxWidth: 380, position: 'relative', zIndex: 1001 }} onClick={e => e.stopPropagation()}>
            <h1>Награда для «{rewardDialog.user.name}»</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
              Текущая: {(rewardDialog.user.reward || 0).toLocaleString('ru-RU')} ₽ ({rewardDialog.user.bonusPoints || 0} XP)
            </p>
            <div className="adm-field">
              <label>Сумма награды (₽)</label>
              <input type="number" placeholder="0" value={rewardDialog.reward}
                onChange={e => setRewardDialog(d => ({ ...d, reward: e.target.value }))} autoFocus />
            </div>
            <div className="adm-field">
              <label>Бонусные XP</label>
              <input type="number" placeholder="0" value={rewardDialog.xp}
                onChange={e => setRewardDialog(d => ({ ...d, xp: e.target.value }))} />
            </div>
            <div className="adm-editor-actions">
              <button className="btn btn-ghost" onClick={() => setRewardDialog(null)}>Отмена</button>
              <button className="btn btn-primary" onClick={saveReward}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// BusinessRequestsView
// ═══════════════════════════════════════════════════
function BusinessRequestsView({ onToast }) {
  const [requests, setRequests] = useState([])
  const [, force] = useState(0)
  const refresh = () => force(x => x + 1)

  const loadRequests = () => {
    try {
      return JSON.parse(localStorage.getItem('hackpark_business_requests') || '[]')
    } catch { return [] }
  }

  useState(() => { setRequests(loadRequests()) })

  useEffect(() => { setRequests(loadRequests()) }, [])

  const updateStatus = (id, status) => {
    const reqs = loadRequests()
    const idx = reqs.findIndex(r => r.id === id)
    if (idx >= 0) {
      reqs[idx].status = status
      localStorage.setItem('hackpark_business_requests', JSON.stringify(reqs))
      setRequests([...reqs])
      onToast('Статус заявки обновлён', 'success')
    }
  }

  const deleteRequest = (id) => {
    const reqs = loadRequests().filter(r => r.id !== id)
    localStorage.setItem('hackpark_business_requests', JSON.stringify(reqs))
    setRequests([...reqs])
    onToast('Заявка удалена', '')
  }

  const STATUS_MAP = {
    new:     { label: 'Новая',     cls: 'rpt-st-triage' },
    in_progress: { label: 'В работе',   cls: 'rpt-st-review' },
    done:    { label: 'Завершена',  cls: 'rpt-st-resolved' },
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>Заявки от бизнеса</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Заявки на запуск программ баг-баунти</p>
        </div>
        <span className="adm-nav-badge">{requests.filter(r => r.status === 'new').length}</span>
      </div>

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
          <p style={{ fontSize: 15 }}>Заявок пока нет</p>
        </div>
      ) : (
        <div className="adm-rpt-list">
          {requests.slice().reverse().map(r => {
            const st = STATUS_MAP[r.status] || STATUS_MAP.new
            return (
              <div className="adm-rpt-row" key={r.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{r.bizCompany || 'Без названия'}</span>
                    <span className={'adm-rpt-st ' + st.cls}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                    <div><strong>Контакт:</strong> {r.bizName || '—'}</div>
                    <div><strong>Телефон:</strong> {r.bizPhone || '—'}</div>
                    <div><strong>Email:</strong> {r.bizEmail || '—'}</div>
                    <div><strong>Размер:</strong> {r.bizSize || '—'}</div>
                    <div><strong>Сфера:</strong> {r.bizScope || '—'}</div>
                    {r.bizComment && <div><strong>Комментарий:</strong> {r.bizComment}</div>}
                    <div style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 6 }}>
                      {new Date(r.submittedAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {r.status === 'new' && (
                    <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => updateStatus(r.id, 'in_progress')}>В работу</button>
                  )}
                  {r.status === 'in_progress' && (
                    <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => updateStatus(r.id, 'done')}>Завершить</button>
                  )}
                  <button className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13, color: 'var(--accent2)' }} onClick={() => deleteRequest(r.id)}>Удалить</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// AdminPage
// ═══════════════════════════════════════════════════
export default function AdminPage() {
  useDocumentTitle('Админка — HackPark')
  const [authed, setAuthed] = useState(isAdminAuthed())
  const [view, setView] = useState(() => { try { return localStorage.getItem('hackpark_admin_view') || 'list' } catch { return 'list' } })
  const [editingSlug, setEditingSlug] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [currentReportId, setCurrentReportId] = useState(null)
  const [, force] = useState(0)
  const refresh = useCallback(() => force(x => x + 1), [])

  const programs = getAllPrograms()
  const reports = getReports()
  const users = getUsers()
  const pendingUsers = users.filter(u => u.status === 'pending').length
  const pendingReports = reports.filter(r => r.status === 'triage' || !r.status).length
  const pendingBizRequests = (() => { try { return JSON.parse(localStorage.getItem('hackpark_business_requests') || '[]').filter(r => r.status === 'new').length } catch { return 0 } })()

  const showToast = useCallback((msg, type) => setToast({ msg, type }), [])

  const handleLogin = () => { setAuthed(true) }
  const handleLogout = useCallback(() => {
    adminLogout()
    setAuthed(false)
    setView('list')
    showToast('Вы вышли', '')
  }, [showToast])

  const handleNav = (v) => {
    if (v === 'list') { setView('list'); setEditingSlug(null) }
    else if (v === 'new') { setEditingSlug(null); setView('editor') }
    else if (v === 'chats') setView('chats')
    else if (v === 'reports') setView('reports')
    else if (v === 'users') setView('users')
    else if (v === 'requests') setView('requests')
    try { localStorage.setItem('hackpark_admin_view', v) } catch {}
    setSidebarOpen(false)
  }

  const handleEdit = (slug) => {
    setEditingSlug(slug)
    setView('editor')
    try { localStorage.setItem('hackpark_admin_view', 'editor') } catch {}
  }
  const handleDelete = (slug) => {
    const prog = programs.find(p => p.slug === slug)
    if (!prog) return
    if (confirm('Удалить программу «' + prog.company + '»? Это действие нельзя отменить.')) {
      deleteProgram(slug)
      showToast('Программа удалена', 'error')
      refresh()
    }
  }

  const onOpenReport = (id) => { setCurrentReportId(id); setView('report-detail') }
  const onChatReport = (id) => {
    setActiveChatReportId(id)
    setView('chats')
  }
  const [activeChatReportId, setActiveChatReportId] = useState(null)

  if (!authed) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <>
      <div className="adm-body">
        <Sidebar
          view={view}
          onNav={handleNav}
          authed={{ logout: handleLogout }}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          pendingUsers={pendingUsers}
          pendingReports={pendingReports}
          pendingBizRequests={pendingBizRequests}
        />
        <main className="adm-main">
          <button className="adm-mobile-toggle" onClick={() => setSidebarOpen(o => !o)}><span /></button>

          {view === 'list' && (
            <ProgramListView
              programs={programs}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onNew={() => { setEditingSlug(null); setView('editor') }}
            />
          )}

          {view === 'editor' && (
            <EditorView
              initialSlug={editingSlug}
              onBack={() => { setView('list'); setEditingSlug(null); refresh() }}
              onSaved={showToast}
            />
          )}

          {view === 'chats' && (
            <ChatView
              onToast={showToast}
              onGotoReport={onOpenReport}
            />
          )}

          {view === 'reports' && (
            <ReportsListView
              onOpenReport={onOpenReport}
              onChatReport={onChatReport}
            />
          )}

          {view === 'report-detail' && (
            <ReportDetailView
              reportId={currentReportId}
              onBack={() => setView('reports')}
              onToast={showToast}
            />
          )}

          {view === 'users' && (
            <UsersView onToast={showToast} />
          )}

          {view === 'requests' && (
            <BusinessRequestsView onToast={showToast} />
          )}
        </main>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}
