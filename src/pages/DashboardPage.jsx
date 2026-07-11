import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getDashData, saveDashData, getReports, getProfileSettings, saveProfileSettings, getArticles, addArticle, deleteArticle, updateArticle, toggleArticleLike, addArticleComment, incArticleViews, addNotification, getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount } from '../data/store.js'
import { getAllPrograms, logoStyle } from '../data/programs.js'
import { useAuth, getUsers } from '../context/AuthContext.jsx'
import '../styles/dashboard.css'
import '../styles/awards-reports.css'
import '../styles/articles.css'
import '../styles/quill-override.css'
import '../styles/quill-override.css'
import { CATEGORIES, categoryIcon, categoryName, categoryColor, categoryDesc, getParentCategory, normalizeCategory, getCategory } from '../data/categories.js'
import CategoryIcon from '../components/CategoryIcon.jsx'
import ArticleEditor from '../components/ArticleEditor.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { asset } from '../utils/assets.js'

// ── Ranks ──
const RANKS = [
  { name: 'Skiller', xp: 0 },
  { name: 'Expert', xp: 1000 },
  { name: 'Elite', xp: 3000 },
  { name: 'Legend', xp: 8000 },
]


const TARGET_FILTERS = [
  { key: 'all', label: 'Все' },
  { key: 'web', label: 'Web' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'api', label: 'API' },
  { key: 'infra', label: 'Инфра' },
  { key: 'blockchain', label: 'Web3' },
]

const REPORT_STATUS = {
  triage: { label: 'На триаже', cls: 'st-triage' },
  confirmed: { label: 'Принят',       cls: 'st-confirmed' },
  needs_revision: { label: 'Доработка',    cls: 'st-revision' },
  rejected: { label: 'Отклонён', cls: 'st-rejected' },
}

// ── Achievement reward definitions (premium system) ──
const REWARDS = [
  { icon: 'M12 2l2.4 7.4H22l-6.2 4.6 2.4 7.4-6.2-4.6L5.8 21.4l2.4-7.4L2 9.4h7.6z', name: 'Первый отчёт', desc: 'Отправить первый отчёт на триаж', rarity: 'common', category: 'reports', progressMax: 1 },
  { icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01 9 11.01', name: 'Пять отчётов', desc: 'Отправить 5 отчётов', rarity: 'rare', category: 'reports', progressMax: 5 },
  { icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', name: 'Первая награда', desc: 'Заработать первую награду за отчёт', rarity: 'rare', category: 'earnings' },
  { icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', name: 'Опытный', desc: 'Набрать 1000 XP', rarity: 'epic', category: 'xp', progressMax: 1000 },
  { icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5', name: 'Эксперт', desc: 'Достичь ранга Expert', rarity: 'epic', category: 'rank' },
  { icon: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z', name: 'Чемпион', desc: 'Достичь ранга Legend', rarity: 'legendary', category: 'rank' },
  // Secret awards (hidden until unlocked)
  { icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z', name: '???', desc: 'Секретное достижение', rarity: 'legendary', category: 'secret', secret: true },
]

// ── Leaderboard mock entries ──
const LEADERBOARD = [
  { rank: 1, medal: 'gold', name: 'ne0n_h4wk', rankLabel: 'Legend', bugs: 142, earnings: '32 000 ₽' },
  { rank: 2, medal: 'silver', name: 'kr0pt_x', rankLabel: 'Elite', bugs: 98, earnings: '24 000 ₽' },
  { rank: 3, medal: 'bronze', name: 'v3nom_str1ke', rankLabel: 'Elite', bugs: 87, earnings: '20 000 ₽' },
  { rank: 4, name: 'gh0st_w1re', rankLabel: 'Expert', bugs: 76, earnings: '18 000 ₽' },
  { rank: 5, name: 'by7e_f4ng', rankLabel: 'Expert', bugs: 64, earnings: '12 000 ₽' },
  { rank: 6, name: 'qu4nt_l3ak', rankLabel: 'Expert', bugs: 58, earnings: '10 000 ₽' },
  { rank: 7, name: 'sh4d0_p1ng', rankLabel: 'Skiller', bugs: 51, earnings: '8 000 ₽' },
]

const ARTICLE_AUDIENCE_LABEL = { all: 'Все уровни', beginner: 'Новички', specialist: 'Специалисты', expert: 'Эксперты' }

// ── Helper: derive target category from program scope ──
function deriveCat(platforms) {
  const p = (platforms || []).map(x => String(x).toLowerCase())
  if (p.some(x => x.includes('smart contract') || x.includes('web3'))) return 'blockchain'
  if (p.some(x => x.includes('infra'))) return 'infra'
  if (p.some(x => x.includes('mobile') && !x.includes('api'))) return 'mobile'
  if (p.some(x => x.includes('api') && !p.some(x => x.includes('web')))) return 'api'
  if (p.some(x => x.includes('mobile'))) return 'mobile'
  return 'web'
}

function parseBountyNum(s) {
  if (!s) return 0
  const n = parseInt(String(s).replace(/\D/g, ''), 10)
  return isNaN(n) ? 0 : n
}

function deriveBadge(maxBounty) {
  const n = parseBountyNum(maxBounty)
  if (n >= 400000) return { badge: 'critical', badgeText: 'Critical' }
  if (n >= 120000) return { badge: 'high', badgeText: 'High' }
  return { badge: 'medium', badgeText: 'Medium' }
}

function getUnreadCount(chatKey) {
  try {
    const msgs = JSON.parse(localStorage.getItem(chatKey) || '[]')
    let lastUserIdx = -1
    msgs.forEach((m, i) => { if (m.from === 'me') lastUserIdx = i })
    let unread = 0
    msgs.forEach((m, i) => { if (m.from === 'admin' && i > lastUserIdx) unread++ })
    return unread
  } catch { return 0 }
}

function esc(s) {
  return s ? String(s) : ''
}

// ═══════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════
export default function DashboardPage() {
  useDocumentTitle('Дашборд — HackPark')
  const { user, logout, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeView, setActiveView] = useState(() => { try { return localStorage.getItem('hackpark_dash_view') || 'overview' } catch { return 'overview' } })

  // ── Map URL hash to active view (e.g. /dashboard#articles → articles) ──
  const HASH_VIEW_MAP = { targets: 'targets', reports: 'reports', articles: 'articles', activity: 'activity', leaderboard: 'leaderboard', users: 'users', notifications: 'notifications', overview: 'overview' }
  useEffect(() => {
    const h = (location.hash || '').replace('#', '')
    if (h && HASH_VIEW_MAP[h] && HASH_VIEW_MAP[h] !== activeView) {
      setActiveView(HASH_VIEW_MAP[h])
      try { localStorage.setItem('hackpark_dash_view', HASH_VIEW_MAP[h]) } catch {}
    }
  }, [location.hash])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data initialization
  const initialDash = getDashData()
  const [dashData, setDashData] = useState(initialDash)
  const initialSettings = getProfileSettings(user?.authKey)
  const [profileSettings, setProfileSettings] = useState(initialSettings)
  const [reports, setReports] = useState(getReports().filter(r => r.reporterKey === (user?.authKey || null)))

  // Targets (programs)
  const allPrograms = getAllPrograms()
  const allTargets = allPrograms.map(p => {
    const { badge, badgeText } = deriveBadge(p.maxBounty)
    return {
      slug: p.slug,
      company: p.company,
      scope: (p.scope && p.scope.platforms ? p.scope.platforms : []),
      maxBounty: p.maxBounty,
      badge,
      badgeText,
      cat: deriveCat(p.scope && p.scope.platforms ? p.scope.platforms : []),
      logoImg: p.logoImg || null,
      lname: p.company,
      reports: p.reportsAccepted || 0,
      status: p.status || 'active',
    }
  })
  const [targetFilter, setTargetFilter] = useState('all')
  const [targetSearch, setTargetSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsForm, setSettingsForm] = useState({ displayName: '', email: '', telegram: '', avatar: '', banner: '' })

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatReportId, setChatReportId] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const chatInputRef = useRef(null)
  const chatMsgsRef = useRef(null)


  // ── User display name (needed by article callbacks) ──
  const username = (user && (user.user || user.name)) || 'исследователь'
  const profileDisplayName = profileSettings.displayName || username.split('@')[0] || username
  const displayName = profileDisplayName
  const initial = displayName.charAt(0).toUpperCase()

  // ── Profile sub-tab state (Награды / Статьи) ──
  const [profileTab, setProfileTab] = useState('awards')
  const [awardFilter, setAwardFilter] = useState('all')
  const [awardSearch, setAwardSearch] = useState('')
  const [awardSort, setAwardSort] = useState('rarity')
  const [pinnedAwards, setPinnedAwards] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hackpark_pinned_awards') || '[]') } catch { return [] }
  })
  const [awardUnlock, setAwardUnlock] = useState(null)
  const [articles, setArticles] = useState(getArticles())
  const [newArticlesCount, setNewArticlesCount] = useState(() => {
    const lastSeen = (() => { try { return parseInt(localStorage.getItem('hackpark_articles_last_seen') || '0') } catch { return 0 } })()
    return getArticles().filter(a => new Date(a.createdAt || 0).getTime() > lastSeen && a.authorKey !== (user?.authKey || 'me')).length
  })
  const [articleDraft, setArticleDraft] = useState(false)
  const [articleForm, setArticleForm] = useState({ title: '', body: '', category: '' })
  const [editingArticleId, setEditingArticleId] = useState(null)
  const [expandedArticle, setExpandedArticle] = useState(null)
  const [commentsOpen, setCommentsOpen] = useState(null)
  const [commentDrafts, setCommentDrafts] = useState({})
  const [articleCategory, setArticleCategoryRaw] = useState('')

  const setArticleCategory = useCallback((categoryId, skipHistory) => {
    const prev = categoryId
    setArticleCategoryRaw(categoryId)
    if (!skipHistory) {
      try { window.history.pushState({ hackparkArticleCategory: categoryId, dashArticle: true }, '') } catch {}
    }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      const st = e.state
      if (st && typeof st.hackparkArticleCategory === "string") {
        setArticleCategoryRaw(st.hackparkArticleCategory)
      } else if (st && st.dashArticle) {
        setArticleCategoryRaw('')
      } else {
        // Not our state (e.g. React Router history entry) — go to articles overview
        setArticleCategoryRaw('')
      }
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
  const [articleSort, setArticleSort] = useState('new')
  const [articleSearch, setArticleSearch] = useState('')

  // ── Article helpers ──
  const refreshArticles = useCallback(() => {
    const arts = getArticles()
    setArticles(arts)
  }, [])

    const handleSaveArticle = useCallback(() => {
      if (!articleForm.title.trim() || !articleForm.body.trim()) return
      if (editingArticleId) {
        updateArticle(editingArticleId, {
          title: articleForm.title.trim(),
          body: articleForm.body.trim(),
          category: articleForm.category || '',
        })
      } else {
        const art = {
          id: 'art-' + Date.now(),
          title: articleForm.title.trim(),
          body: articleForm.body.trim(),
          category: articleForm.category || '',
          author: displayName,
          authorKey: user?.authKey || 'me',
          createdAt: new Date().toISOString(),
          likes: [],
          comments: [],
          views: 0,
        }
        addArticle(art)
      }
      setArticleForm({ title: '', body: '', category: '' })
      setEditingArticleId(null)
      setArticleDraft(false)
      refreshArticles()
    }, [articleForm, editingArticleId, displayName, user, refreshArticles])

    const handleEditArticle = useCallback((article) => {
      setArticleForm({ title: article.title || '', body: article.body || '', category: article.category || '' })
      setEditingArticleId(article.id)
      setArticleDraft(true)
    }, [])

    const handleCancelArticle = useCallback(() => {
      setArticleDraft(false)
      setEditingArticleId(null)
      setArticleForm({ title: '', body: '', category: '' })
    }, [])

  const handleDeleteArticle = useCallback((id) => {
    deleteArticle(id)
    refreshArticles()
  }, [refreshArticles])

  const handleLikeArticle = useCallback((articleId) => {
    const userId = user?.authKey || 'me'
    const updated = toggleArticleLike(articleId, userId)
    // Notify article owner if like is new and not self
    if (updated && updated.authorKey && updated.authorKey !== userId) {
      const liked = (updated.likes || []).includes(userId)
      if (liked) {
        addNotification(updated.authorKey, {
          type: 'like',
          actorKey: userId,
          actorName: displayName,
          articleId: articleId,
          articleTitle: updated.title || 'статья',
          text: displayName + ' оценил(а) вашу статью «' + (updated.title || '') + '»'
        })
      }
    }
    refreshArticles()
  }, [user, refreshArticles, displayName])

  const handleAddComment = useCallback((articleId, text) => {
    if (!text.trim()) return
    const c = {
      id: 'c-' + Date.now(),
      author: displayName,
      authorKey: user?.authKey || 'me',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }
    const updated = addArticleComment(articleId, c)
    // Notify article owner if not self
    if (updated && updated.authorKey && updated.authorKey !== (user?.authKey || 'me')) {
      addNotification(updated.authorKey, {
        type: 'comment',
        actorKey: user?.authKey || 'me',
        actorName: displayName,
        articleId: articleId,
        articleTitle: updated.title || 'статья',
        text: displayName + ' оставил(а) комментарий под вашей статьёй «' + (updated.title || '') + '»'
      })
    }
setCommentDrafts(d => ({ ...d, [articleId]: '' }))
      refreshArticles()
    }, [displayName, user, refreshArticles])

  // ── Article expand (increments views, like the public page) ──
  const handleExpandArticle = useCallback((articleId) => {
    const willExpand = expandedArticle !== articleId
    setExpandedArticle(willExpand ? articleId : null)
    if (willExpand) {
      incArticleViews(articleId)
      refreshArticles()
    }
    }, [expandedArticle, refreshArticles])

  // ── Articles view: derived data for the selected category ──
  const articlesViewNormalizedCat = articleCategory ? normalizeCategory(articleCategory) : ''

  // ── Start new article (pre-fills category from selected subcategory) ──
    const handleStartArticle = useCallback(() => {
      setArticleForm({ title: '', body: '', category: articlesViewNormalizedCat || '' })
      setEditingArticleId(null)
      setArticleDraft(true)
    }, [articlesViewNormalizedCat])
  const articlesViewActiveCat = articlesViewNormalizedCat ? getCategory(articlesViewNormalizedCat) : null
  const articlesViewParentCat = articlesViewActiveCat?.parentId ? getParentCategory(articlesViewNormalizedCat) : null
  const articlesViewFiltered = (() => {
    let list = !articlesViewNormalizedCat
      ? articles
      : articles.filter(a => normalizeCategory(a.category) === articlesViewNormalizedCat || a.category === articlesViewNormalizedCat)
    const q = articleSearch.trim().toLowerCase()
    if (q) list = list.filter(a => (a.title || '').toLowerCase().includes(q) || (a.body || '').toLowerCase().includes(q))
    const sorted = [...list]
    if (articleSort === 'new') sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    else if (articleSort === 'old') sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
    else if (articleSort === 'likes') sorted.sort((a, b) => ((b.likes || []).length) - ((a.likes || []).length))
    else if (articleSort === 'views') sorted.sort((a, b) => ((b.views || 0)) - ((a.views || 0)))
    return sorted
  })()

  // ── Notifications ──
  const [notifList, setNotifList] = useState(() => getNotifications(user?.authKey))
  const [notifUnread, setNotifUnread] = useState(() => getUnreadNotificationCount(user?.authKey))
  const refreshNotifs = useCallback(() => { setNotifList(getNotifications(user?.authKey)); setNotifUnread(getUnreadNotificationCount(user?.authKey)) }, [user])

  // ── Admin-panel quick access ──
  const isAdmin = user?.role === 'admin'
  const goAdmin = useCallback(() => navigate('/admin'), [navigate])

  const handleMarkNotifRead = useCallback((id) => {
    markNotificationRead(id, user?.authKey)
    refreshNotifs()
  }, [user, refreshNotifs])

  const handleMarkAllNotifsRead = useCallback(() => {
    markAllNotificationsRead(user?.authKey)
    refreshNotifs()
  }, [user, refreshNotifs])

  const fmtArticleDate = (iso) => {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    const now = new Date()
    const diff = (now - d) / 1000
    if (diff < 60) return 'только что'
    if (diff < 3600) return Math.floor(diff / 60) + ' мин назад'
    if (diff < 86400) return Math.floor(diff / 3600) + ' ч назад'
    if (diff < 604800) return Math.floor(diff / 86400) + ' д назад'
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  // ── Bonus-adjusted totals ────────────────────────────────
  const totalEarnings = (dashData.earnings || 0) + (dashData.bonusEarnings || 0)
  const totalPoints = (dashData.points || 0) + (dashData.bonusPoints || 0)

  // ── Recalculate rank based on totalPoints ────────────────
  let calcRank = 'Skiller'
  for (const r of RANKS) { if (totalPoints >= r.xp) calcRank = r.name }

  const [currentRank, setCurrentRank] = useState(calcRank)

  useEffect(() => {
    if (calcRank !== dashData.rank) {
      const updated = { ...dashData, rank: calcRank }
      saveDashData(updated)
      setDashData(updated)
    }
    setCurrentRank(calcRank)
  }, [calcRank, dashData])

  // ── Rank index for XP progress ───────────────────────────
  const rankIdx = Math.max(0, RANKS.findIndex(r => r.name === currentRank))
  const nextRank = RANKS[Math.min(rankIdx + 1, RANKS.length - 1)]
  const prevXP = RANKS[rankIdx].xp
  const targetXP = nextRank.xp
  const isMaxRank = rankIdx === RANKS.length - 1
  let pct = isMaxRank ? 100 : Math.min(100, ((totalPoints - prevXP) / (targetXP - prevXP)) * 100)
  if (pct < 0) pct = 0
  const remaining = Math.max(0, targetXP - totalPoints)

  // Delayed progress bar fill
  const [progressWidth, setProgressWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setProgressWidth(pct), 200)
    return () => clearTimeout(t)
  }, [pct])

  // ── Rewards unlock conditions ────────────────────────────
  const rewardConds = [
    dashData.reports >= 1,
    dashData.reports >= 5,
    totalEarnings > 0,
    totalPoints >= 1000,
    currentRank === 'Expert' || currentRank === 'Elite' || currentRank === 'Legend',
    currentRank === 'Legend',
    dashData.reports >= 10 && totalEarnings >= 50000, // secret: 10 reports + 50k earnings
  ]
  const unlockedCount = rewardConds.filter(Boolean).length

  // ── Award progress values ──
  const awardProgress = [
    Math.min(dashData.reports, 1),
    Math.min(dashData.reports, 5),
    totalEarnings > 0 ? 1 : 0,
    Math.min(totalPoints, 1000),
    rewardConds[4] ? 1 : 0,
    rewardConds[5] ? 1 : 0,
    rewardConds[6] ? 1 : 0,
  ]

  // ── Pin/unpin award ──
  const togglePin = (idx) => {
    let pinned = [...pinnedAwards]
    const pos = pinned.indexOf(idx)
    if (pos >= 0) { pinned.splice(pos, 1) }
    else if (pinned.length < 3) { pinned.push(idx) }
    else { pinned.shift(); pinned.push(idx) }
    setPinnedAwards(pinned)
    try { localStorage.setItem('hackpark_pinned_awards', JSON.stringify(pinned)) } catch {}
  }

  // ── Award unlock animation: check for newly unlocked ──
  const prevUnlockedRef = useRef(null)
  useEffect(() => {
    const prev = prevUnlockedRef.current
    if (prev === null) { prevUnlockedRef.current = rewardConds.map(Boolean); return }
    for (let i = 0; i < rewardConds.length; i++) {
      if (!prev[i] && rewardConds[i] && !REWARDS[i].secret) {
        setAwardUnlock(REWARDS[i])
        setTimeout(() => setAwardUnlock(null), 4000)
        break
      }
    }
    prevUnlockedRef.current = rewardConds.map(Boolean)
  }, [rewardConds.join(',')])

  // ── Filtered + sorted awards ──
  const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 }
  const filteredAwards = REWARDS.map((r, i) => ({ ...r, idx: i, unlocked: rewardConds[i], progress: awardProgress[i] }))
    .filter(r => {
      if (r.secret && !r.unlocked) return false // hide locked secrets
      if (awardFilter !== 'all' && r.rarity !== awardFilter) return false
      if (awardSearch) {
        const q = awardSearch.toLowerCase()
        if (!r.name.toLowerCase().includes(q) && !r.desc.toLowerCase().includes(q)) return false
      }
      return true
    })
    .sort((a, b) => {
      if (awardSort === 'rarity') return (RARITY_ORDER[a.rarity] || 9) - (RARITY_ORDER[b.rarity] || 9)
      if (awardSort === 'name') return a.name.localeCompare(b.name)
      if (awardSort === 'unlocked') return (b.unlocked ? 1 : 0) - (a.unlocked ? 1 : 0)
      return 0
    })

  // ── Real activity feed from confirmed reports (п.12) ──
  const SEV_COLOR_MAP = { critical: 'critical', high: 'high', medium: 'medium', low: 'info' }
  const allReports = getReports()
  const activityFeed = allReports
    .filter(r => r.status === 'confirmed' && r.resolvedAt)
    .sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt))
    .map(r => {
      const sevKey = (r.severity || '').toLowerCase()
      const sevClass = SEV_COLOR_MAP[sevKey] || 'info'
      const sevLabel = r.severity || 'подтверждён'
      const reward = r.reward || 0
      const xp = Math.round((reward || 0) / 100)
      const diff = (Date.now() - new Date(r.resolvedAt).getTime()) / 1000
      let timeLabel
      if (diff < 60) timeLabel = 'только что'
      else if (diff < 3600) timeLabel = Math.floor(diff / 60) + ' мин назад'
      else if (diff < 86400) timeLabel = Math.floor(diff / 3600) + ' ч назад'
      else if (diff < 604800) timeLabel = Math.floor(diff / 86400) + ' д назад'
      else timeLabel = new Date(r.resolvedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
      return {
        type: 'reward',
        actor: r.reporterName || displayName,
        action: 'получил подтверждение уязвимости',
        sevClass,
        sevLabel,
        target: r.target || '',
        reward,
        xp,
        timeLabel,
        ts: new Date(r.resolvedAt).getTime(),
      }
    })
    .slice(0, 10)

  // ── Real users for search (п.15) ──
  const allUsers = getUsers().filter(u => u.status === 'approved' && u.authKey !== user?.authKey)
  const now = Date.now()
  const realUsers = allUsers.map(u => {
    const online = u.loginAt && (now - new Date(u.loginAt).getTime()) < 15 * 60 * 1000
    return {
      authKey: u.authKey,
      name: getProfileSettings(u.authKey).displayName || u.name || (u.email || '').split('@')[0],
      telegram: u.telegram || '',
      avatar: getProfileSettings(u.authKey).avatar || null,
      online,
    }
  }).filter(u => !userSearch.trim() || u.name.toLowerCase().includes(userSearch.trim().toLowerCase()))

  // ── Bonus display parts ──────────────────────────────────
  const hasBonus = (dashData.bonusEarnings > 0) || (dashData.bonusPoints > 0)
  const bonusParts = []
  if (dashData.bonusEarnings > 0) bonusParts.push(`+${dashData.bonusEarnings.toLocaleString('ru-RU')} ₽`)
  if (dashData.bonusPoints > 0) bonusParts.push(`+${dashData.bonusPoints} XP`)

  // ── Member since date ────────────────────────────────────
  const [memberSince, setMemberSince] = useState('')
  useEffect(() => {
    const raw = profileSettings.memberSince || (user && user.joined) || ''
    let ms = ''
    if (raw) {
      if (typeof raw === 'string' && raw.includes('T')) {
        const d = new Date(raw)
        if (!isNaN(d.getTime())) ms = d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short' })
      } else {
        ms = raw
      }
    }
    if (!ms) {
      ms = new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'short' })
      const updated = { ...profileSettings, memberSince: ms }
      saveProfileSettings(updated, user?.authKey)
      setProfileSettings(updated)
    }
    setMemberSince(ms)
  }, [profileSettings, user])

  // ── Target filter ───────────────────────────────────────
  const activeTargets = allTargets.filter(t => (t.status || 'active') === 'active')
  const closedTargets = allTargets.filter(t => t.status === 'closed')
  const activeCount = activeTargets.length
  const closedCount = closedTargets.length
  const filteredTargets = (targetFilter === 'all' ? allTargets : allTargets.filter(t => t.cat === targetFilter))
    .filter(t => !targetSearch.trim() || (t.company || '').toLowerCase().includes(targetSearch.trim().toLowerCase()))

  const targetsSub = `${activeCount} активн${activeCount === 1 ? 'ая программа' : (activeCount >= 2 && activeCount <= 4 ? 'ые программы' : 'ых программ')}${closedCount > 0 ? ', ' + closedCount + ' завершено' : ''}`

  // ── View title/sub ──────────────────────────────────────
  const viewTitleMap = { overview: ['Мой Профиль',''], targets: ['Таргеты', targetsSub], reports: ['Мои отчёты','Статус твоих отчётов'], articles: ['Статьи','Опыт и гайды от участников'], activity: ['Активность','Реальные события, рейтинг и привилегии'], users: ['Пользователи',''], leaderboard: ['Рейтинг',''], notifications: ['Уведомления',''] }
  const pageTitle = viewTitleMap[activeView]?.[0] || 'Дашборд'
  const pageSub = activeView === 'overview' ? `С возвращением, ${displayName}` : (viewTitleMap[activeView]?.[1] || '')

  // ── View switching ──────────────────────────────────────
  const switchView = useCallback((view) => {
    setActiveView(view)
    setSidebarOpen(false)
    try { localStorage.setItem('hackpark_dash_view', view) } catch {}
    if (view === 'notifications') refreshNotifs()
    if (view === 'articles') { try { localStorage.setItem('hackpark_articles_last_seen', String(Date.now())) } catch {} setNewArticlesCount(0); setArticleCategory('', true) }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [refreshNotifs])

  // ── Settings modal ───────────────────────────────────────
  const openSettings = useCallback(() => {
    setSettingsForm({
      displayName: profileDisplayName,
      email: profileSettings.email || (user && user.email) || '',
      telegram: profileSettings.telegram || '',
      avatar: profileSettings.avatar || '',
      banner: profileSettings.banner || '',
    })
    setSettingsOpen(true)
  }, [profileDisplayName, profileSettings, user])

  const processImage = (file, maxDim, cb) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim }
        else if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        cb(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  }
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    processImage(file, 256, (dataUrl) => setSettingsForm(s => ({ ...s, avatar: dataUrl })))
  }
  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    processImage(file, 1200, (dataUrl) => setSettingsForm(s => ({ ...s, banner: dataUrl })))
  }
  const saveSettings = useCallback(() => {
    const updated = {
      ...profileSettings,
      displayName: settingsForm.displayName.trim() || username.split('@')[0] || username,
      email: settingsForm.email.trim(),
      telegram: settingsForm.telegram.trim(),
      avatar: settingsForm.avatar || '',
      banner: settingsForm.banner || '',
    }
    saveProfileSettings(updated, user?.authKey)
    setProfileSettings(updated)
    setSettingsOpen(false)
  }, [profileSettings, settingsForm, username])

  // ── Report chat ─────────────────────────────────────────
  const openChat = useCallback((reportId) => {
    if (!reportId) return
    const chatKey = `hackpark_report_chat_${reportId}`
    setChatReportId({ id: reportId, chatKey })
    let msgs = []
    try { msgs = JSON.parse(localStorage.getItem(chatKey) || '[]') } catch {}
    setChatMessages(msgs)
    setChatInput('')
    setChatOpen(true)
    setTimeout(() => { if (chatInputRef.current) chatInputRef.current.focus() }, 100)
  }, [])

  const closeChat = useCallback(() => {
    setChatOpen(false)
    setChatReportId(null)
    setReports(getReports().filter(r => r.reporterKey === (user?.authKey || null)))
  }, [])

  const sendChatMsg = useCallback(() => {
    if (!chatReportId) return
    const text = chatInput.trim()
    if (!text) return
    const { chatKey } = chatReportId
    let msgs = []
    try { msgs = JSON.parse(localStorage.getItem(chatKey) || '[]') } catch {}
    msgs.push({ from: 'me', text, ts: Date.now() })
    localStorage.setItem(chatKey, JSON.stringify(msgs))
    setChatMessages([...msgs])
    setChatInput('')
    // Auto-reply from admin after 2 seconds
    setTimeout(() => {
      try { msgs = JSON.parse(localStorage.getItem(chatKey) || '[]') } catch {}
      if (msgs.length > 0 && msgs[msgs.length - 1].from === 'me') {
        const reply = 'Спасибо за сообщение! Администратор рассмотрит ваш вопрос и ответит в ближайшее время.'
        msgs.push({ from: 'admin', text: reply, ts: Date.now() })
        localStorage.setItem(chatKey, JSON.stringify(msgs))
        setChatMessages([...msgs])
        setReports(getReports().filter(r => r.reporterKey === (user?.authKey || null)))
      }
    }, 2000)
  }, [chatReportId, chatInput])

  // Chat input auto-grow
  const onChatInputChange = useCallback((e) => {
    setChatInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 100) + 'px'
  }, [])

  const onChatKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMsg() }
  }, [sendChatMsg])

  // Esc to close chat
  useEffect(() => {
    if (!chatOpen) return
    const onKey = (e) => { if (e.key === 'Escape') closeChat() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [chatOpen, closeChat])

  // Current chat report info for header
  const currentReport = chatReportId ? reports.find(r => r.id === chatReportId.id) : null
  const chatTitle = currentReport ? currentReport.title : 'Отчёт'
  const chatSub = currentReport ? `${currentReport.target} · ${currentReport.severity} · обратная связь от администратора` : 'Обратная связь от администратора'

  // ── Logout ──────────────────────────────────────────────
  const onLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  if (loading) return null
  if (!user) return null

  return (
    <>
      {/* Mobile overlay */}
      <div className={'dash-overlay' + (sidebarOpen ? ' open' : '')} onClick={() => setSidebarOpen(false)} />

      {/* Chat modal */}
      <div className={'rpt-chat-overlay' + (chatOpen ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) closeChat() }}>
        <div className="rpt-chat-modal">
          <div className="rpt-chat-modal-head">
            <div className="rpt-chat-modal-head-info">
              <div className="rpt-chat-modal-avatar">A</div>
              <div>
                <strong>{chatTitle}</strong>
                <span>{chatSub}</span>
              </div>
            </div>
            <button className="rpt-chat-modal-close" onClick={closeChat} aria-label="Закрыть">&times;</button>
          </div>
          <div className="rpt-chat-modal-msgs" ref={chatMsgsRef}>
            {chatMessages.length === 0 ? (
              <div className="rpt-chat-modal-empty">Нет сообщений.<br />Напишите администратору — вопрос по scope,<br />уточнение по отчёту или обратная связь.</div>
            ) : chatMessages.map((m, i) => (
              <div key={i} className={'rpt-chat-modal-msg ' + (m.from === 'me' ? 'me' : 'admin')}>
                <div className="rpt-chat-modal-msg-avatar">
                  {m.from === 'me' ? displayName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <div className="rpt-chat-modal-msg-bubble">{esc(m.text)}</div>
                  <div className="rpt-chat-modal-msg-time">
                    {new Date(m.ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rpt-chat-modal-input">
            <textarea
              ref={chatInputRef}
              value={chatInput}
              onChange={onChatInputChange}
              onKeyDown={onChatKeyDown}
              placeholder="Напишите сообщение..."
              rows="1"
            />
            <button className="rpt-chat-modal-send" disabled={!chatInput.trim()} onClick={sendChatMsg}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="dash-body">
        {/* ── Sidebar ── */}
        <aside className={'dash-sidebar' + (sidebarOpen ? ' open' : '')}>
          <div className="dash-sidebar-head"><img src={asset("/images/hp-logo-sm.png")} alt="HackPark" /><span>HackPark</span></div>
          <nav className="dash-nav">
            <button className={'dash-nav-item' + (activeView === 'overview' ? ' active' : '')} onClick={() => switchView('overview')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Мой Профиль
            </button>
            <button className={'dash-nav-item' + (activeView === 'targets' ? ' active' : '')} onClick={() => switchView('targets')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
              Таргеты
              <span className="dash-nav-badge">{activeCount}</span>
            </button>
            <button className={'dash-nav-item' + (activeView === 'reports' ? ' active' : '')} onClick={() => switchView('reports')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              Мои отчёты
              <span className="dash-nav-badge gray">{reports.length}</span>
            </button>
            <button className={'dash-nav-item' + (activeView === 'articles' ? ' active' : '')} onClick={() => switchView('articles')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              Статьи
              {newArticlesCount > 0 && <span className="dash-nav-badge accent">{newArticlesCount}</span>}
            </button>
            <button className={'dash-nav-item' + (activeView === 'activity' ? ' active' : '')} onClick={() => switchView('activity')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              Активность
            </button>
            <button className={'dash-nav-item' + (activeView === 'users' ? ' active' : '')} onClick={() => switchView('users')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Пользователи
            </button>
            <button className={'dash-nav-item' + (activeView === 'notifications' ? ' active' : '')} onClick={() => switchView('notifications')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              Уведомления
              {notifUnread > 0 && <span className="dash-nav-badge accent">{notifUnread}</span>}
              </button>
              {isAdmin && (
                <button className={'dash-nav-item dash-nav-admin' + (activeView === 'admin' ? ' active' : '')} onClick={goAdmin}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Админка
                </button>
              )}

            </nav>
          <div className="dash-sidebar-foot">
            <div className="dash-user-card">
              <div className="dash-avatar">{initial}</div>
              <div className="dash-user-info">
                <div className="dash-user-name">{displayName}</div>
                <div className="dash-user-rank">{currentRank}</div>
              </div>
              <button onClick={onLogout} style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'none', color: 'var(--ink-3)', cursor: 'pointer' }} title="Выйти">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="dash-main">
          <div className="dash-topbar">
            <div>
              <button className="dash-mobile-toggle" onClick={() => setSidebarOpen(o => !o)} aria-label="Меню"><span /></button>
              <h1>{pageTitle}</h1>
              <div className="dash-topbar-sub">{pageSub}</div>
            </div>
          </div>

          {/* ═══ overview ═══ */}
          {activeView === 'overview' && (
            <div className="dash-view">
              <div className="dash-cta">
                <div className="dash-cta-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <div className="dash-cta-text">
                  <h3>Нашёл уязвимость?</h3>
                  <p>Выбери таргет и отправь отчёт на триадж</p>
                </div>
                <button className="dash-cta-btn" onClick={() => switchView('targets')}>
                  Отправить отчёт
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="dash-profile-hero">
                {profileSettings.banner
                  ? <div className="dash-profile-banner" style={{ backgroundImage: 'url(' + profileSettings.banner + ')' }} />
                  : <div className="dash-profile-banner dash-profile-banner-empty" />}
                <div className="dash-profile-banner-tip" tabIndex={0}>
                  <span className="dash-profile-banner-tip-icon">!</span>
                  <span className="dash-profile-banner-tip-text">Рекомендуемый размер баннера — 1200×320 px. Изображение будет автоматически сжато по ширине 1200 px.</span>
                </div>
                <div className="dash-profile-hero-inner">
                  <div className="dash-profile-avatar-wrap">
                    <div className="dash-profile-avatar-ring">
                      <div className="dash-profile-avatar">{profileSettings.avatar ? <img src={profileSettings.avatar} alt="Аватар" className="dash-profile-avatar-img" /> : displayName.charAt(0).toUpperCase()}</div>
                    </div>
                    <button className="dash-profile-avatar-edit" onClick={openSettings} title="Сменить аватар">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                  </div>
                  <div className="dash-profile-info">
                    <h2>{displayName}</h2>
                    <div className="dash-profile-meta">
                      <span className="dash-profile-rank">{currentRank}</span>
                      <span className="dash-profile-member">· с {memberSince}</span>
                      {hasBonus && (
                        <div style={{ fontSize: '12px', color: 'var(--accent3)', fontWeight: 600, marginTop: '4px', display: 'block', width: '100%' }}>
                          Бонус от админа: {bonusParts.join(' · ')}
                        </div>
                      )}
                    </div>
                    <button className="dash-profile-settings-btn" onClick={openSettings}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      Настройки
                    </button>
                  </div>
                </div>
              </div>
              <div className="dash-profile-xp">
                <div className="dash-profile-xp-top">
                  <div className="dash-profile-xp-label">Прогресс до ранга <strong>{nextRank.name}</strong></div>
                  <div className="dash-profile-xp-val"><strong>{totalPoints}</strong> / {targetXP} XP · осталось {isMaxRank ? '0' : remaining}</div>
                </div>
                <div className="dash-profile-xp-bar">
                  <div className="dash-profile-xp-fill" style={{ width: progressWidth + '%' }} />
                </div>
                <div className="dash-profile-rank-track">
                  {RANKS.map((r, i) => (
                    <span key={r.name} className={'dash-rank-dot' + (i === rankIdx ? ' current' : '') + (i < rankIdx ? ' active' : '')}>{r.name}</span>
                  ))}
                </div>
              </div>
              <div className="dash-profile-stats">
                <div className="dash-stat">
                  <div className="dash-stat-top">
                    <div className="dash-stat-icon purple"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /></svg></div>
                    <span className="dash-stat-label">Ранг</span>
                  </div>
                  <div className="dash-stat-val">{currentRank}</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-top">
                    <div className="dash-stat-icon blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg></div>
                    <span className="dash-stat-label">Отчётов</span>
                  </div>
                  <div className="dash-stat-val">{dashData.reports}</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-top">
                    <div className="dash-stat-icon green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                    <span className="dash-stat-label">Заработано</span>
                  </div>
                  <div className="dash-stat-val">{totalEarnings.toLocaleString('ru-RU')} ₽</div>
                </div>
                <div className="dash-stat">
                  <div className="dash-stat-top">
                    <div className="dash-stat-icon orange"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg></div>
                    <span className="dash-stat-label">Очки опыта</span>
                  </div>
                  <div className="dash-stat-val">{totalPoints}</div>
                </div>
              </div>
              {/* ── Profile sub-tab bar (like zelenka.guru profile tabs) ── */}
              <div className="dash-profile-tabs">
                <button className={'dash-profile-tab' + (profileTab === 'awards' ? ' active' : '')} onClick={() => setProfileTab('awards')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
                  Награды
                  <span className="dash-profile-tab-count">{unlockedCount}</span>
                </button>
                <button className={'dash-profile-tab' + (profileTab === 'articles' ? ' active' : '')} onClick={() => setProfileTab('articles')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                  Статьи
                  <span className="dash-profile-tab-count">{articles.filter(a => a.authorKey === (user?.authKey || 'me')).length}</span>
                </button>
              </div>

              {/* ── Awards tab (premium) ── */}
              {profileTab === 'awards' && (
                <div className="dash-profile-tab-content">
                  {/* Top stats + progress */}
                  <div className="awards-top">
                    <div className="awards-top-stat">
                      <div className="val">{unlockedCount}</div>
                      <div className="lbl">получено</div>
                    </div>
                    <div className="awards-top-stat">
                      <div className="val">{REWARDS.filter(r => !r.secret || rewardConds[REWARDS.indexOf(r)]).length}</div>
                      <div className="lbl">всего</div>
                    </div>
                    <div className="awards-top-progress">
                      <div className="awards-top-progress-text">
                        <span>Прогресс коллекции</span>
                        <span>{Math.round(unlockedCount / REWARDS.filter((r, i) => !r.secret || rewardConds[i]).length * 100)}%</span>
                      </div>
                      <div className="awards-top-progress-bar">
                        <div className="awards-top-progress-fill" style={{ width: Math.round(unlockedCount / REWARDS.filter((r, i) => !r.secret || rewardConds[i]).length * 100) + '%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Pinned badges (Top 3) */}
                  <div className="awards-pinned">
                    {[0, 1, 2].map(slot => {
                      const idx = pinnedAwards[slot]
                      const r = idx != null ? REWARDS[idx] : null
                      const unlocked = r ? rewardConds[idx] : false
                      return (
                        <div key={slot}
                          className={'awards-pinned-slot' + (r && unlocked ? ' has-badge' : '') + (idx != null ? ' selected' : '')}
                          onClick={() => idx != null && togglePin(idx)}
                          title={r && unlocked ? r.name : 'Пустой слот'}
                        >
                          {r && unlocked ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                              style={{ color: r.rarity === 'legendary' ? '#ff9f0a' : r.rarity === 'epic' ? '#bf5ef0' : r.rarity === 'rare' ? '#0a84ff' : '#a1a1a8' }}>
                              <path d={r.icon} />
                            </svg>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>—</span>
                          )}
                        </div>
                      )
                    })}
                    {pinnedAwards.length > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--ink-3)', alignSelf: 'center' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}><path d="M12 2v6M12 18v4M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M18 12h4" /></svg>Закрепить до 3 наград</span>
                    )}
                  </div>

                  {/* Toolbar: filter, search, sort */}
                  <div className="awards-toolbar">
                    <div className="awards-filter-group">
                      {[
                        { v: 'all', label: 'Все' },
                        { v: 'common', label: 'Common', dot: '#a1a1a8' },
                        { v: 'rare', label: 'Rare', dot: '#0a84ff' },
                        { v: 'epic', label: 'Epic', dot: '#bf5ef0' },
                        { v: 'legendary', label: 'Legendary', dot: '#ff9f0a' },
                      ].map(f => (
                        <button key={f.v} className={'awards-filter-chip' + (awardFilter === f.v ? ' active' : '')} onClick={() => setAwardFilter(f.v)}>
                          {f.dot && <span className="dot" style={{ background: f.dot }} />}
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <div className="awards-search">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                      <input type="text" placeholder="Поиск наград..." value={awardSearch} onChange={e => setAwardSearch(e.target.value)} />
                    </div>
                    <select className="awards-sort" value={awardSort} onChange={e => setAwardSort(e.target.value)}>
                      <option value="rarity">По редкости</option>
                      <option value="unlocked">По получению</option>
                      <option value="name">По названию</option>
                    </select>
                  </div>

                  {/* Awards grid */}
                  <div className="awards-grid">
                    {filteredAwards.map(r => {
                      const pinned = pinnedAwards.includes(r.idx)
                      return (
                        <div key={r.idx}
                          className={'award-card r-' + r.rarity + (r.unlocked ? ' unlocked' : ' locked') + (r.secret ? ' secret' : '')}
                          onClick={() => r.unlocked && togglePin(r.idx)}
                        >
                          {!r.unlocked && <span className="award-lock">🔒</span>}
                          <div className="award-card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={r.icon} /></svg>
                          </div>
                          <div className="award-card-rarity">
                            <span className="dot" />
                            {r.rarity}
                          </div>
                          <div className="award-card-name">{r.unlocked || !r.secret ? r.name : '???'}</div>
                          <div className="award-card-desc">{r.unlocked || !r.secret ? r.desc : 'Секретное достижение — выполните особое условие'}</div>
                          {r.unlocked && pinned && <div style={{ fontSize: 11, color: 'var(--g1)', fontWeight: 600 }}>📌 Закреплено</div>}
                          {r.unlocked && !r.progressMax && <div className="award-card-date">Получено</div>}
                          {r.progressMax && (
                            <div className="award-card-progress">
                              <div className="award-card-progress-bar">
                                <div className="award-card-progress-fill" style={{ width: Math.min(100, r.progress / r.progressMax * 100) + '%' }} />
                              </div>
                              <div className="award-card-progress-text">
                                <span>{r.progress} / {r.progressMax}</span>
                                <span>{Math.round(Math.min(100, r.progress / r.progressMax * 100))}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Award unlock modal ── */}
              {awardUnlock && (
                <div className="award-unlock-overlay show" onClick={() => setAwardUnlock(null)}>
                  <div className="award-unlock-card">
                    <div className="award-unlock-icon" style={{ background: awardUnlock.rarity === 'legendary' ? 'rgba(255,159,10,.12)' : awardUnlock.rarity === 'epic' ? 'rgba(191,94,240,.12)' : awardUnlock.rarity === 'rare' ? 'rgba(10,132,255,.12)' : 'rgba(161,161,168,.12)', color: awardUnlock.rarity === 'legendary' ? '#ff9f0a' : awardUnlock.rarity === 'epic' ? '#bf5ef0' : awardUnlock.rarity === 'rare' ? '#0a84ff' : '#a1a1a8' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={awardUnlock.icon} /></svg>
                    </div>
                    <div className="award-unlock-rarity" style={{ background: awardUnlock.rarity === 'legendary' ? 'rgba(255,159,10,.12)' : awardUnlock.rarity === 'epic' ? 'rgba(191,94,240,.12)' : awardUnlock.rarity === 'rare' ? 'rgba(10,132,255,.12)' : 'rgba(161,161,168,.12)', color: awardUnlock.rarity === 'legendary' ? '#ff9f0a' : awardUnlock.rarity === 'epic' ? '#bf5ef0' : awardUnlock.rarity === 'rare' ? '#0a84ff' : '#a1a1a8' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                      {awardUnlock.rarity}
                    </div>
                    <div className="award-unlock-title" style={{ marginTop: 12 }}>Награда разблокирована!</div>
                    <div className="award-unlock-desc">{awardUnlock.name} — {awardUnlock.desc}</div>
                  </div>
                </div>
              )}

              {/* ── Articles tab (wall) ── */}
              {profileTab === 'articles' && (
                <div className="dash-profile-tab-content">
                  <div className="dash-sec-title">
                    Статьи
                    <span className="count">{articles.filter(a => a.authorKey === (user?.authKey || 'me')).length} ваших · {articles.length} всего</span>
                  </div>
{articleDraft && editingArticleId && (
                        <div className="dash-article-editor">
                          <input
                            type="text"
                            className="dash-article-editor-title"
                            placeholder="Заголовок статьи"
                            value={articleForm.title}
                            onChange={(e) => setArticleForm(f => ({ ...f, title: e.target.value }))}
                          />
                          <select
                            className="dash-article-editor-category"
                            value={articleForm.category}
                            onChange={(e) => setArticleForm(f => ({ ...f, category: e.target.value }))}
                          >
                            <option value="">Без категории</option>
                            {CATEGORIES.map(cat => (
                              <optgroup key={cat.id} label={cat.name}>
                                {(cat.subs || []).map(sub => (
                                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <div className="dash-article-editor">
                            <ArticleEditor
                              value={articleForm.body}
                              onChange={(val) => setArticleForm(f => ({ ...f, body: val }))}
                              placeholder="Текст вашей статьи..."
                            />
                          </div>
<div className="dash-article-editor-actions">
                            <button className="btn btn-ghost btn-sm" onClick={handleCancelArticle}>Отмена</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSaveArticle} disabled={!articleForm.title.trim() || !articleForm.body.trim()}>{editingArticleId ? 'Сохранить' : 'Опубликовать'}</button>
                          </div>
                        </div>
                      )}
                      <div className="dash-article-list">
                      {articles.filter(a => a.authorKey === (user?.authKey || 'me')).length === 0 ? (
                        <div className="dash-article-empty">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                          <p>Вы пока не написали ни одной статьи.</p>
                        </div>
                    ) : (
                      articles.filter(a => a.authorKey === (user?.authKey || 'me')).map(a => {
                        const isMine = true
                        const liked = (a.likes || []).includes(user?.authKey || 'me')
                        const expanded = expandedArticle === a.id
                        const cDraft = commentDrafts[a.id] || ''
                        return (
                          <div key={a.id} className="dash-article-card">
                            <div className="dash-article-card-head">
                              <div className="dash-article-avatar">{(a.author || '?').charAt(0).toUpperCase()}</div>
                              <div className="dash-article-meta">
                                <div className="dash-article-author"><Link to={"/profile/" + a.authorKey} style={{color:"inherit",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>{a.author}</Link> {isMine && <span className="dash-article-mine">вы</span>}</div>
                                <div className="dash-article-date">{fmtArticleDate(a.createdAt)}</div>
                              </div>
                              {isMine && (
                                <button className="dash-article-edit" onClick={() => handleEditArticle(a)} title="Редактировать">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </button>
                              )}
                              {isMine && (
                                <button className="dash-article-del" onClick={() => handleDeleteArticle(a.id)} title="Удалить">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                </button>
                              )}
                            </div>
                            <h3 className="dash-article-title">{a.title}</h3>
                            <div className={'dash-article-body' + (expanded ? ' expanded' : '')} dangerouslySetInnerHTML={{ __html: a.body }} />
{(a.body || '').replace(/<[^>]*>/g, '').length > 200 && (
                                <button className="dash-article-expand" onClick={() => handleExpandArticle(a.id)}>
                                  {expanded ? 'Свернуть' : 'Читать далее...'}
                                </button>
                              )}
                            <div className="dash-article-actions">
                              <button className={'dash-article-act' + (liked ? ' liked' : '')} onClick={() => handleLikeArticle(a.id)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                                {(a.likes || []).length}
                              </button>
                              <button className="dash-article-act" onClick={() => setCommentsOpen(commentsOpen === a.id ? null : a.id)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                {(a.comments || []).length}
                              </button>
                              <button className="dash-article-act" title="Просмотры">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                              {(a.views || 0)}
                            </button>
                            </div>
                            {commentsOpen === a.id && (
                              <div className="dash-article-comments">
                                {(a.comments || []).map(c => (
                                  <div key={c.id} className="dash-article-comment">
                                    <div className="dash-article-comment-avatar">{(c.author || '?').charAt(0).toUpperCase()}</div>
                                    <div className="dash-article-comment-body">
                                      <div className="dash-article-comment-head">
                                        <span className="dash-article-comment-author"><Link to={"/profile/" + (c.authorKey || "me")} style={{color:"inherit",textDecoration:"none"}}>{c.author}</Link></span>
                                        <span className="dash-article-comment-date">{fmtArticleDate(c.createdAt)}</span>
                                      </div>
                                      <div className="dash-article-comment-text">{c.text}</div>
                                    </div>
                                  </div>
                                ))}
                                <div className="dash-article-comment-form">
                                  <input
                                    type="text"
                                    placeholder="Написать комментарий..."
                                    value={cDraft}
                                    onChange={(e) => setCommentDrafts(d => ({ ...d, [a.id]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(a.id, cDraft) }}
                                  />
                                  <button className="btn btn-primary btn-sm" onClick={() => handleAddComment(a.id, cDraft)} disabled={!cDraft.trim()}>Отправить</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ targets ═══ */}
          {activeView === 'targets' && (
            <div className="dash-view">
              <div className="dash-targets-banner">
                <img src={asset("/images/baghun2.png")} alt="Bug Bounty Targets" />
              </div>
              <div className="dash-filters">
                {TARGET_FILTERS.map(f => (
                  <button key={f.key} className={'filter-chip' + (targetFilter === f.key ? ' active' : '')} onClick={() => setTargetFilter(f.key)}>{f.label}</button>
                ))}
              </div>
              <div className="dash-target-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" placeholder="Поиск таргета по названию..." value={targetSearch} onChange={e => setTargetSearch(e.target.value)} />
              </div>
              <div className="dash-target-list">
                {filteredTargets.map(t => {
                  const st = t.status || 'active'
                  const stLabel = st === 'closed' ? 'Завершена' : 'Активна'
                  const rowCls = st === 'closed' ? 'dash-target-row closed' : 'dash-target-row'
                  return (
                    <Link key={t.slug} to={`/target/${t.slug}`} className={rowCls} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: '14px' }}>
                      <div className="dash-target-logo" style={{ background: t.logoImg ? "transparent" : logoStyle(t.lname || t.company), overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>{t.logoImg ? <img src={t.logoImg} alt={t.company} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "6px" }} /> : (t.company || "?").charAt(0)}</div>
                      <div className="dash-target-main">
                        <div className="dash-target-name">{t.company}</div>
                        <div className="dash-target-tags">
                          {t.scope.map((s, si) => <span key={si}>{s}</span>)}
                        </div>
                      </div>
                      <span className={'dash-target-status-badge ' + st}>{stLabel}</span>
                      <span className={'dash-target-sev ' + t.badge}>{t.badgeText}</span>
                      <div className="dash-target-reports"><strong>{t.reports}</strong>отчётов</div>
                      <div className="dash-target-bounty">
                        <span className="dash-target-bounty-lbl">до</span>
                        <span className="dash-target-bounty-val">{t.maxBounty}</span>
                      </div>
                      <svg className="dash-target-go" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══ reports (premium redesign) ═══ */}
          {activeView === 'reports' && (
            <div className="dash-view rpt-view">
              <div className="rpt-bg" aria-hidden="true" />
              <div className="rpt-bg-overlay" aria-hidden="true" />
              <div className="rpt-content">
              <div className="dash-sec-title">Мои отчёты <span className="count">{reports.length} отправлено</span></div>

              {/* Stats row — always visible */}
              <div className="rpt-stats-grid">
                <div className={'rpt-stat-card s-total' + (reports.length === 0 ? ' empty' : '')}>
                  <div className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
                  <div className="rpt-stat-body">
                    <div className="val">{reports.length}</div>
                    <div className="lbl">Всего</div>
                  </div>
                </div>
                <div className={'rpt-stat-card s-triage' + (reports.filter(r => r.status === 'triage' || !r.status).length === 0 ? ' empty' : '')}>
                  <div className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
                  <div className="rpt-stat-body">
                    <div className="val">{reports.filter(r => r.status === 'triage' || !r.status).length}</div>
                    <div className="lbl">На рассмотрении</div>
                  </div>
                </div>
                <div className={'rpt-stat-card s-confirmed' + (reports.filter(r => r.status === 'confirmed').length === 0 ? ' empty' : '')}>
                  <div className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
                  <div className="rpt-stat-body">
                    <div className="val">{reports.filter(r => r.status === 'confirmed').length}</div>
                    <div className="lbl">Принято</div>
                  </div>
                </div>
                <div className={'rpt-stat-card s-rejected' + (reports.filter(r => r.status === 'rejected').length === 0 ? ' empty' : '')}>
                  <div className="icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg></div>
                  <div className="rpt-stat-body">
                    <div className="val">{reports.filter(r => r.status === 'rejected').length}</div>
                    <div className="lbl">Отклонено</div>
                  </div>
                </div>
              </div>

              {reports.length === 0 ? (
                /* ── Empty state — hero + next award only ── */
                <div className="rpt-empty-wrap">
                  <div className="rpt-empty-hero">
                    <div className="rpt-empty-hero-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
                    </div>
                    <h2>Пока здесь пусто</h2>
                    <p>Вы ещё не отправили ни одного отчёта. После первой отправки здесь появится история ваших отчётов, их статусы и ответы модераторов.</p>
                    <Link to="/dashboard#targets" className="btn btn-primary" style={{ textDecoration: 'none' }}>Создать первый отчёт →</Link>
                  </div>

                  {/* Next award progress */}
                  <div className="rpt-next-award">
                    <div className="rpt-next-award-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>
                    </div>
                    <div className="rpt-next-award-info">
                      <div className="rpt-next-award-title">Репортёр</div>
                      <div className="rpt-next-award-desc">Отправьте первый отчёт, чтобы получить награду.</div>
                      <div className="rpt-next-award-bar">
                        <div className="rpt-next-award-fill" style={{ width: '0%' }} />
                      </div>
                      <div className="rpt-next-award-pct">0% — 0 из 1</div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Reports list + activity ── */
                <>
                  <div className="rpt-list">
                    {[...reports].reverse().map((r, ri) => {
                      const st = REPORT_STATUS[r.status] || REPORT_STATUS.triage
                      const sev = (r.severity || '').toLowerCase()
                      const date = new Date(r.submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                      const rid = r.id || ''
                      const chatKey = `hackpark_report_chat_${rid}`
                      const unread = rid ? getUnreadCount(chatKey) : 0
                      const shortId = rid ? rid.replace('rpt-', '').split('-')[0] : '—'
                      const hasReward = r.reward && r.reward > 0
                      return (
                        <div key={ri} className="rpt-item" onClick={() => openChat(rid)}>
                          <span className={'rpt-item-sev ' + sev}>{r.severity}</span>
                          <div className="rpt-item-info">
                            <strong>{r.title}</strong>
                            <div className="rpt-item-meta">
                              <span className="id">#{shortId}</span>
                              <span>{r.target}</span>
                              <span>{date}</span>
                              {hasReward && <span className="reward">{r.reward.toLocaleString('ru-RU')} ₽</span>}
                            </div>
                          </div>
                          <div className="rpt-item-actions">
                            {unread > 0 && <span className="chat-badge" style={{ position: 'static' }}>{unread}</span>}
                            <span className={'rpt-item-status ' + st.cls}><span className="dot" />{st.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Recent activity — compact */}
                  <div className="rpt-activity">
                    <div className="rpt-activity-head">Последние действия</div>
                    {[...reports].reverse().slice(0, 5).map((r, i) => {
                      const sev = (r.severity || '').toLowerCase()
                      const date = new Date(r.submittedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
                      return (
                        <div key={i} className="rpt-activity-item">
                          <span className="sev-dot" style={{ background: sev === 'critical' ? '#ff6b6b' : sev === 'high' ? '#ff9f0a' : sev === 'medium' ? '#30d158' : '#0a84ff' }} />
                          <span>{r.title} — {REPORT_STATUS[r.status]?.label || 'На триаже'}</span>
                          <span className="time">{date}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
              </div>
            </div>
          )}

          {/* ═══ articles (community wall) ═══ */}
{activeView === 'articles' && (
              <div className="dash-view">
<div className="dash-sec-title">
                    Статьи
                    <span className="count">{articles.length} всего{articlesViewNormalizedCat ? ' · ' + articlesViewFiltered.length + ' в категории' : ''}</span>
                  </div>

                  {/* ── Articles rewards banner ── */}
                  <div className="articles-banner">
                    <div className="articles-banner-info" title="Мы платим деньги за лучшие статьи">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      <div className="articles-banner-tooltip">Мы платим деньги за лучшие статьи! Пишите качественные материалы — лучшие авторы получают вознаграждение от платформы HackPark.</div>
                    </div>
                    <img src={asset("/images/goodstat2.png")} alt="Вознаграждения за статьи" className="articles-banner-img" />
                  </div>

                  {/* ── Global article search (overview) ── */}
                {!articlesViewNormalizedCat && (
                  <div className="dash-article-toolbar">
                    <div className="dash-article-search">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                      <input type="text" placeholder="Поиск по всем статьям..." value={articleSearch} onChange={e => setArticleSearch(e.target.value)} />
                    </div>
                    <select className="dash-article-sort" value={articleSort} onChange={e => setArticleSort(e.target.value)}>
                      <option value="new">Сначала новые</option>
                      <option value="old">Сначала старые</option>
                      <option value="likes">По лайкам</option>
                      <option value="views">По просмотрам</option>
                    </select>
                  </div>
                )}

                    {/* ── Overview: all categories (when not searching) ── */}
                {!articlesViewNormalizedCat && !articleSearch.trim() && (
                  <div className="articles-overview">
                    {CATEGORIES.map(cat => {
                      const catArticles = articles.filter(a => {
                        const norm = normalizeCategory(a.category)
                        if (norm === cat.id) return true
                        return (cat.subs || []).some(s => s.id === norm)
                      })
                      const lastArticle = catArticles
                        .filter(a => a.createdAt)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
                      return (
<section key={cat.id} className="cat-section" style={{ '--cat-color': cat.color }}>
                            <div className="cat-section-header">
                              <div className="cat-section-icon" style={{ background: cat.color + '15', color: cat.color }}><CategoryIcon name={cat.icon} size={22} /></div>
                              <div className="cat-section-title-block">
                                <h2 className="cat-section-title">{cat.name}</h2>
                                <p className="cat-section-desc">{cat.desc}</p>
                              </div>
                              <div className="cat-section-count">
                                <span className="cat-count-num">{catArticles.length}</span>
                                <span className="cat-count-lbl">{catArticles.length === 1 ? 'статья' : (catArticles.length >= 2 && catArticles.length <= 4 ? 'статьи' : 'статей')}</span>
                              </div>
                            </div>
                          <div className="cat-subgrid">
                            {(cat.subs || []).map(sub => {
                              const subArticles = articles.filter(a => normalizeCategory(a.category) === sub.id)
                              return (
                                <button
                                  key={sub.id}
                                  className="cat-sub-card"
                                  onClick={() => setArticleCategory(sub.id)}
                                  style={{ '--sub-color': sub.color }}
                                >
                                  <span className="cat-sub-icon" style={{ background: sub.color + '15', color: sub.color }}><CategoryIcon name={sub.icon} size={18} /></span>
                                  <span className="cat-sub-body">
                                    <span className="cat-sub-name">{sub.name}</span>
                                    <span className="cat-sub-desc">{sub.desc}</span>
                                  </span>
                                  <span className="cat-sub-count">{subArticles.length}</span>
                                </button>
                              )
                            })}
                          </div>
                          {lastArticle && (
                            <div className="cat-section-latest" onClick={() => setArticleCategory(normalizeCategory(lastArticle.category) || lastArticle.category)}>
                              <span className="cat-latest-label">Последняя публикация:</span>
                              <span className="cat-latest-title">{lastArticle.title.length > 60 ? lastArticle.title.slice(0, 60) + '…' : lastArticle.title}</span>
                              <span className="cat-latest-meta">{fmtArticleDate(lastArticle.createdAt)} · {lastArticle.author || '—'}</span>
                            </div>
                          )}
                        </section>
                      )
                    })}
                  </div>
                )}

                {/* ── Search results (overview with query) ── */}
                {!articlesViewNormalizedCat && articleSearch.trim() && articleSearch.trim().length >= 2 && (
                  <>
                    <div className="articles-page-count">{articlesViewFiltered.length} {articlesViewFiltered.length === 1 ? 'статья' : (articlesViewFiltered.length >= 2 && articlesViewFiltered.length <= 4 ? 'статьи' : 'статей')}</div>
                    <div className="dash-article-list">
                      {articlesViewFiltered.length === 0 ? (
                        <div className="articles-page-empty">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                          <h3>Ничего не найдено</h3>
                          <p>По запросу "{articleSearch}" нет статей. </p>
                        </div>
                      ) : (
                        articlesViewFiltered.map(a => {
                          const isMine = a.authorKey === (user?.authKey || 'me')
                          const liked = (a.likes || []).includes(user?.authKey || 'me')
                          const expanded = expandedArticle === a.id
                          const cDraft = commentDrafts[a.id] || ''
                          return (
                            <div key={a.id} className="dash-article-card">
                              <div className="dash-article-card-head">
                                <div className="dash-article-avatar">{(a.author || '?').charAt(0).toUpperCase()}</div>
                                <div className="dash-article-meta">
                                  <div className="dash-article-author"><Link to={"/profile/" + a.authorKey} style={{color:"inherit",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>{a.author}</Link> {isMine && <span className="dash-article-mine">вы</span>}</div>
                                  <div className="dash-article-date">{fmtArticleDate(a.createdAt)}</div>
                                </div>
                                {a.category && <span className="dash-article-cat-badge"><CategoryIcon name={categoryIcon(normalizeCategory(a.category))} size={12} /> {categoryName(normalizeCategory(a.category))}</span>}
                                {isMine && (
                                  <button className="dash-article-edit" onClick={() => handleEditArticle(a)} title="Редактировать">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  </button>
                                )}
                                {isMine && (
                                  <button className="dash-article-del" onClick={() => handleDeleteArticle(a.id)} title="Удалить">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                  </button>
                                )}
                              </div>
                              <h3 className="dash-article-title">{a.title}</h3>
<div className={'dash-article-body' + (expanded ? ' expanded' : '')} dangerouslySetInnerHTML={{ __html: a.body }} />
                                {(a.body || '').replace(/<[^>]*>/g, '').length > 202 && (
                                <button className="dash-article-expand" onClick={() => handleExpandArticle(a.id)}>
                                  {expanded ? 'Свернуть' : 'Читать далее...'}
                                </button>
                              )}
                              <div className="dash-article-actions">
                                <button className={'dash-article-act' + (liked ? ' liked' : '')} onClick={() => handleLikeArticle(a.id)}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                                  {(a.likes || []).length}
                                </button>
                                <button className="dash-article-act" onClick={() => setCommentsOpen(commentsOpen === a.id ? null : a.id)}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                  {(a.comments || []).length}
                                </button>
                                <button className="dash-article-act" title="Просмотры">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                  {(a.views || 0)}
                                </button>
                              </div>
                              {commentsOpen === a.id && (
                                <div className="dash-article-comments">
                                  {(a.comments || []).map((c, ci) => (
                                    <div key={ci} className="dash-article-comment">
                                      <div className="dash-article-comment-avatar">{(c.author || '?').charAt(0).toUpperCase()}</div>
                                      <div className="dash-article-comment-body">
                                        <div className="dash-article-comment-author">{c.author}</div>
                                        <div className="dash-article-comment-text">{c.text}</div>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="dash-article-comment-new">
                                    <input type="text" placeholder="Написать комментарий..." value={cDraft} onChange={e => setCommentDrafts(d => ({ ...d, [a.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && cDraft.trim()) { handleAddComment(a.id, cDraft.trim()) } }} />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                )}

                {/* ── Category view: breadcrumb + hero + list ── */}
                {articlesViewNormalizedCat && (
                  <>
<div className="articles-breadcrumb">
                        <button className="articles-crumb" onClick={() => setArticleCategory('')}>Все статьи</button>
                        {articlesViewParentCat && (
                          <>
                            <span className="articles-crumb-sep">/</span>
                            <span className="articles-crumb" style={{ color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CategoryIcon name={articlesViewParentCat.icon} size={14} /> {articlesViewParentCat.name}</span>
                          </>
                        )}
                        <span className="articles-crumb-sep">/</span>
<span className="articles-crumb active" style={{ color: categoryColor(articlesViewNormalizedCat), display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CategoryIcon name={categoryIcon(articlesViewNormalizedCat)} size={14} /> {categoryName(articlesViewNormalizedCat)}
                          </span>
                      </div>

                    {articlesViewActiveCat && (
                      <div className="articles-cat-hero" style={{ '--cat-color': categoryColor(articlesViewNormalizedCat) }}>
<div className="articles-cat-hero-icon" style={{ background: categoryColor(articlesViewNormalizedCat) + '18', color: categoryColor(articlesViewNormalizedCat) }}>
                            <CategoryIcon name={categoryIcon(articlesViewNormalizedCat)} size={28} />
                          </div>
                        <div className="articles-cat-hero-body">
                          <h1 className="articles-cat-hero-title">{categoryName(articlesViewNormalizedCat)}</h1>
                          <p className="articles-cat-hero-desc">{categoryDesc(articlesViewNormalizedCat)}</p>
                          <div className="articles-cat-hero-tags">
                            {(articlesViewActiveCat.tags || []).slice(0, 6).map(tag => (
                              <span key={tag} className="articles-cat-tag">#{tag}</span>
                            ))}
                            {articlesViewActiveCat.audience && (
                              <span className="articles-cat-audience">{ARTICLE_AUDIENCE_LABEL[articlesViewActiveCat.audience] || ''}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                      {articleDraft && (
                        <div className="dash-article-editor">
                          <input
                            type="text"
                            className="dash-article-editor-title"
                            placeholder="Заголовок статьи"
                            value={articleForm.title}
                            onChange={(e) => setArticleForm(f => ({ ...f, title: e.target.value }))}
                          />
                          <select
                            className="dash-article-editor-category"
                            value={articleForm.category}
                            onChange={(e) => setArticleForm(f => ({ ...f, category: e.target.value }))}
                          >
                            <option value="">Без категории</option>
                            {CATEGORIES.map(cat => (
                              <optgroup key={cat.id} label={cat.name}>
                                {(cat.subs || []).map(sub => (
                                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <div className="dash-article-editor">
                            <ArticleEditor
                              value={articleForm.body}
                              onChange={(val) => setArticleForm(f => ({ ...f, body: val }))}
                              placeholder="Текст вашей статьи..."
                            />
                          </div>
<div className="dash-article-editor-actions">
                            <button className="btn btn-ghost btn-sm" onClick={handleCancelArticle}>Отмена</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSaveArticle} disabled={!articleForm.title.trim() || !articleForm.body.trim()}>{editingArticleId ? 'Сохранить' : 'Опубликовать'}</button>
                          </div>
                        </div>
                      )}

                      <div className="dash-article-toolbar">
                        <div className="dash-article-search">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                          <input type="text" placeholder="Поиск по статьям..." value={articleSearch} onChange={e => setArticleSearch(e.target.value)} />
                        </div>
                        <select className="dash-article-sort" value={articleSort} onChange={e => setArticleSort(e.target.value)}>
                          <option value="new">Сначала новые</option>
                          <option value="old">Сначала старые</option>
                          <option value="likes">По лайкам</option>
                          <option value="views">По просмотрам</option>
                        </select>
                        {!articleDraft && (
                          <button className="dash-article-write-inline" onClick={handleStartArticle} title="Написать статью в эту категорию">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            <span>Написать</span>
                          </button>
                        )}
                      </div>

                    <div className="articles-page-count">{articlesViewFiltered.length} {articlesViewFiltered.length === 1 ? 'статья' : (articlesViewFiltered.length >= 2 && articlesViewFiltered.length <= 4 ? 'статьи' : 'статей')}</div>

                    <div className="dash-article-list">
                      {articlesViewFiltered.length === 0 ? (
                        <div className="articles-page-empty">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                          <h3>Статей пока нет</h3>
                          <p>В этой категории пока нет публикаций. Вы можете стать первым автором!</p>
                        </div>
                      ) : (
                        articlesViewFiltered.map(a => {
                          const isMine = a.authorKey === (user?.authKey || 'me')
                          const liked = (a.likes || []).includes(user?.authKey || 'me')
                          const expanded = expandedArticle === a.id
                          const cDraft = commentDrafts[a.id] || ''
                          return (
                            <div key={a.id} className="dash-article-card">
                              <div className="dash-article-card-head">
                                <div className="dash-article-avatar">{(a.author || '?').charAt(0).toUpperCase()}</div>
                                <div className="dash-article-meta">
                                  <div className="dash-article-author"><Link to={"/profile/" + a.authorKey} style={{color:"inherit",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>{a.author}</Link> {isMine && <span className="dash-article-mine">вы</span>}</div>
                                  <div className="dash-article-date">{fmtArticleDate(a.createdAt)}</div>
                                </div>
                                {a.category && <span className="dash-article-cat-badge"><CategoryIcon name={categoryIcon(normalizeCategory(a.category))} size={12} /> {categoryName(normalizeCategory(a.category))}</span>}
                                {isMine && (
                                  <button className="dash-article-edit" onClick={() => handleEditArticle(a)} title="Редактировать">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                  </button>
                                )}
                                {isMine && (
                                  <button className="dash-article-del" onClick={() => handleDeleteArticle(a.id)} title="Удалить">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                  </button>
                                )}
                              </div>
                              <h3 className="dash-article-title">{a.title}</h3>
<div className={'dash-article-body' + (expanded ? ' expanded' : '')} dangerouslySetInnerHTML={{ __html: a.body }} />
                                {(a.body || '').replace(/<[^>]*>/g, '').length > 202 && (
                                <button className="dash-article-expand" onClick={() => handleExpandArticle(a.id)}>
                                  {expanded ? 'Свернуть' : 'Читать далее...'}
                                </button>
                              )}
                              <div className="dash-article-actions">
                                <button className={'dash-article-act' + (liked ? ' liked' : '')} onClick={() => handleLikeArticle(a.id)}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                                  {(a.likes || []).length}
                                </button>
                                <button className="dash-article-act" onClick={() => setCommentsOpen(commentsOpen === a.id ? null : a.id)}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                  {(a.comments || []).length}
                                </button>
                                <button className="dash-article-act" title="Просмотры">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                  {(a.views || 0)}
                                </button>
                              </div>
                              {commentsOpen === a.id && (
                                <div className="dash-article-comments">
                                  {(a.comments || []).map(cm => (
                                    <div key={cm.id} className="dash-article-comment">
                                      <div className="dash-article-comment-avatar">{(cm.author || '?').charAt(0).toUpperCase()}</div>
                                      <div className="dash-article-comment-body">
                                        <div className="dash-article-comment-head">
                                          <span className="dash-article-comment-author"><Link to={"/profile/" + (cm.authorKey || "me")} style={{color:"inherit",textDecoration:"none"}}>{cm.author}</Link></span>
                                          <span className="dash-article-comment-date">{fmtArticleDate(cm.createdAt)}</span>
                                        </div>
                                        <div className="dash-article-comment-text">{cm.text}</div>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="dash-article-comment-form">
                                    <input
                                      type="text"
                                      placeholder="Написать комментарий..."
                                      value={cDraft}
                                      onChange={(e) => setCommentDrafts(d => ({ ...d, [a.id]: e.target.value }))}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(a.id, cDraft) }}
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={() => handleAddComment(a.id, cDraft)} disabled={!cDraft.trim()}>Отправить</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

          {/* ═══ leaderboard ═══ */}
          {activeView === 'leaderboard' && (
            <div className="dash-view">
              <div className="dash-sec-title">Рейтинг исследователей</div>
              <div className="dash-lb">
                <div className="lb-row lb-head">
                  <span>#</span><span>Исследователь</span><span>Ранг</span><span>Баги</span>
                  <span style={{ textAlign: 'right' }}>Заработано</span>
                </div>
                <div className="lb-row lb-me">
                  <span>—</span>
                  <span className="lb-name lb-me-name">{displayName} (ты)</span>
                  <span className="lb-rank-label">{currentRank}</span>
                  <span>{dashData.reports}</span>
                  <span className="lb-amount">{totalEarnings.toLocaleString('ru-RU')} ₽</span>
                </div>
                {LEADERBOARD.map((row, i) => (
                  <div key={i} className="lb-row">
                    <span>{row.medal ? <span className={'medal ' + row.medal}>{row.rank}</span> : row.rank}</span>
                    <span className="lb-name">{row.name}</span>
                    <span className="lb-rank-label">{row.rankLabel}</span>
                    <span>{row.bugs}</span>
                    <span className="lb-amount">{row.earnings}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ users (user search + online/offline) ═══ */}
          {activeView === 'users' && (
            <div className="dash-view">
              <div className="dash-sec-title">Исследователи <span className="count">{realUsers.length}</span></div>
              <div className="dash-target-search" style={{ maxWidth: 400 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input type="text" placeholder="Поиск по UserName..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              <div className="dash-user-search-list">
                {realUsers.length === 0 ? (
                  <div className="dash-article-empty" style={{ padding: '32px 20px' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 14px', display: 'block' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    <p>Других исследователей пока нет. Как только новые участники зарегистрируются и получат подтверждение, они появятся здесь.</p>
                  </div>
                ) : realUsers.map(u => (
                  <Link key={u.authKey} to={'/profile/' + u.authKey} className="dash-user-search-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="dash-user-search-avatar">{u.avatar ? <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : (u.name || '?').charAt(0).toUpperCase()}</div>
                    <div className="dash-user-search-info">
                      <div className="dash-user-search-name">{u.name}</div>
                      {u.telegram && <div className="dash-user-search-tg">@{u.telegram}</div>}
                    </div>
                    <span className={'user-status-dot ' + (u.online ? 'online' : 'offline')} title={u.online ? 'Онлайн' : 'Офлайн'}></span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ═══ notifications ═══ */}
          {activeView === 'notifications' && (
            <div className="dash-view">
              <div className="dash-sec-title" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span>Уведомления {notifUnread > 0 && <span className="count">{notifUnread} новых</span>}</span>
                {notifUnread > 0 && <button className="btn btn-ghost btn-sm" onClick={handleMarkAllNotifsRead}>Прочитать все</button>}
              </div>
              <div className="dash-notif-list">
                {notifList.length === 0 ? (
                  <div className="dash-article-empty" style={{ padding: '48px 20px' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px', display: 'block' }}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    <p>Нет уведомлений. Вы получите их, когда кто-то оценит вашу статью, оставит комментарий или админ начислит награду.</p>
                  </div>
                ) : notifList.map(n => {
                  const icon = n.type === 'like' ? <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    : n.type === 'comment' ? <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    : n.type === 'reward' ? <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 20.65 12 17.77 5.82 20.65 7 14.14 2 9.27 8.91 8.26 12 2" />
                    : n.type === 'report_confirmed' ? <polyline points="20 6 9 17 4 12" />
                    : n.type === 'report_rejected' ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                    : <circle cx="12" cy="12" r="10" />
                  const color = n.type === 'like' ? 'var(--accent2)' : n.type === 'comment' ? 'var(--blue)' : n.type === 'reward' || n.type === 'report_confirmed' ? 'var(--green)' : n.type === 'report_rejected' ? 'var(--accent2)' : 'var(--g1)'
                  const isPast = new Date(n.ts).toLocaleDateString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})
                  return (
                    <div key={n.id} className={'dash-notif-item' + (n.read ? '' : ' unread')} onClick={() => handleMarkNotifRead(n.id)}>
                      <div className="dash-notif-icon" style={{ color }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                      </div>
                      <div className="dash-notif-body">
                        <div className="dash-notif-text">{n.text}</div>
                        <div className="dash-notif-time">{isPast}</div>
                      </div>
                      {!n.read && <span className="dash-notif-dot" />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══ activity (redesigned) ═══ */}
          {activeView === 'activity' && (
            <div className="dash-view">
              {/* ── Real activity feed ── */}
              <div className="dash-sec-title">Реальные события <span className="count">{activityFeed.length}</span></div>
              <div className="act-feed">
                {activityFeed.length === 0 ? (
                  <div className="act-empty">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <p>Пока нет событий. Отправьте отчёт и получите награду — событие появится здесь!</p>
                  </div>
                ) : activityFeed.map((ev, i) => (
                  <div key={i} className="act-card">
                    <div className={'act-card-icon act-' + ev.sevClass}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 20.65 12 17.77 5.82 20.65 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <div className="act-card-body">
                      <div className="act-card-text">
                        <span className="act-card-author">{ev.actor}</span>
                        <span className="act-card-action">получил подтверждение уязвимости</span>
                        <span className={'act-card-sev act-' + ev.sevClass}>{ev.sevLabel}</span>
                        {ev.target ? <span className="act-card-target">в <strong>{ev.target}</strong></span> : ''}
                      </div>
                      <div className="act-card-rewards">
                        {ev.reward > 0 && <span className="act-reward-money">+{ev.reward.toLocaleString('ru-RU')} ₽</span>}
                        {ev.xp > 0 && <span className="act-reward-xp">+{ev.xp} XP</span>}
                      </div>
                    </div>
                    <div className="act-card-time">{ev.timeLabel}</div>
                  </div>
                ))}
              </div>

              {/* ── Leaderboard ── */}
              <div className="dash-sec-title" style={{ marginTop: 36 }}>Рейтинг исследователей</div>
              <div className="dash-lb">
                <div className="lb-row lb-head">
                  <span>#</span><span>Исследователь</span><span>Ранг</span><span>Баги</span>
                  <span style={{ textAlign: 'right' }}>Заработано</span>
                </div>
                <div className="lb-row lb-me">
                  <span>—</span>
                  <span className="lb-name lb-me-name">{displayName} (ты)</span>
                  <span className="lb-rank-label">{currentRank}</span>
                  <span>{dashData.reports}</span>
                  <span className="lb-amount">{totalEarnings.toLocaleString('ru-RU')} ₽</span>
                </div>
                {LEADERBOARD.map((row, i) => (
                  <div key={i} className="lb-row">
                    <span>{row.medal ? <span className={'medal ' + row.medal}>{row.rank}</span> : row.rank}</span>
                    <span className="lb-name">{row.name}</span>
                    <span className="lb-rank-label">{row.rankLabel}</span>
                    <span>{row.bugs}</span>
                    <span className="lb-amount">{row.earnings}</span>
                  </div>
                ))}
              </div>

              {/* ── Perks ── */}
              <div className="dash-sec-title" style={{ marginTop: 36 }}>Привилегии топ-исследователей</div>
              <div className="dash-perks">
                <div className="perk-card">
                  <div className="perk-icon purple"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.6 2.4 7.4-6.2-4.6L5.8 21.4l2.4-7.4L2 9.4h7.6z" /></svg></div>
                  <h3>Эксклюзивные ивенты</h3>
                  <p>Доступ на закрытые мероприятия без отбора. Standoff, конференции, хакатоны — для топ-исследователей HackPark.</p>
                </div>
                <div className="perk-card">
                  <div className="perk-icon green"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>
                  <h3>Приватные программы</h3>
                  <p>Приглашения в закрытые программы от крупных компаний. Доступ только по приглашению — для проверенных исследователей.</p>
                </div>
                <div className="perk-card">
                  <div className="perk-icon orange"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg></div>
                  <h3>Призы и ачивки</h3>
                  <p>Ежегодная церемония награждения, кастомный мерч и бейджи для топ-25 исследователей платформы.</p>
                </div>
              </div>
              <div className="perk-community">
                <p>Стань частью серьёзного сообщества баг-хантеров и строй репутацию в индустрии кибербезопасности.</p>
              </div>
            </div>
          )}

{/* ── Settings modal ── */}
          <div className={'dash-profile-settings-panel' + (settingsOpen ? ' open' : '')} onClick={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false) }}>
            <div className="dash-profile-settings-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Настройки профиля</h3>
              <div className="dash-profile-settings-field">
                <label>Аватар</label>
                <div className="dash-settings-media-row">
                  <div className="dash-settings-avatar-prev">
                    {settingsForm.avatar ? <img src={settingsForm.avatar} alt="" /> : (settingsForm.displayName || displayName).charAt(0).toUpperCase()}
                  </div>
                  <div className="dash-settings-media-actions">
                    <label className="btn btn-ghost btn-sm dash-settings-file-btn">
                      Загрузить
                      <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                    </label>
                    {settingsForm.avatar && <button className="btn btn-ghost btn-sm" onClick={() => setSettingsForm(s => ({ ...s, avatar: '' }))}>Удалить</button>}
                  </div>
                </div>
              </div>
              <div className="dash-profile-settings-field">
                <label>Банер <span className="dash-banner-info-badge" title="Рекомендуемый размер: 1200×320 px">!</span></label>
                <div className="dash-settings-banner-row">
                  <div className="dash-settings-banner-prev" style={settingsForm.banner ? { backgroundImage: 'url(' + settingsForm.banner + ')' } : undefined}>
                    {!settingsForm.banner && <span>Превью банера</span>}
                  </div>
                  <div className="dash-settings-media-actions">
                    <label className="btn btn-ghost btn-sm dash-settings-file-btn">
                      Загрузить
                      <input type="file" accept="image/*" onChange={handleBannerChange} hidden />
                    </label>
                    {settingsForm.banner && <button className="btn btn-ghost btn-sm" onClick={() => setSettingsForm(s => ({ ...s, banner: '' }))}>Удалить</button>}
                  </div>
                </div>
              </div>
              <div className="dash-profile-settings-field">
                <label>Отображаемое имя</label>
                <input type="text" value={settingsForm.displayName} onChange={(e) => setSettingsForm(s => ({ ...s, displayName: e.target.value }))} placeholder="Ваш ник" />
              </div>
              <div className="dash-profile-settings-field">
                <label>Email</label>
                <input type="email" value={settingsForm.email} onChange={(e) => setSettingsForm(s => ({ ...s, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              <div className="dash-profile-settings-field">
                <label>Telegram</label>
                <input type="text" value={settingsForm.telegram} onChange={(e) => setSettingsForm(s => ({ ...s, telegram: e.target.value }))} placeholder="@username" />
              </div>
              <div className="dash-profile-settings-actions">
                <button className="btn btn-ghost" onClick={() => setSettingsOpen(false)}>Отмена</button>
                <button className="btn btn-primary" onClick={saveSettings}>Сохранить</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
