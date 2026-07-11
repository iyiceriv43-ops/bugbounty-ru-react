// ── Reports storage ──
export function getReports() {
  return JSON.parse(localStorage.getItem('hackpark_my_reports') || '[]')
}

export function saveReports(reports) {
  localStorage.setItem('hackpark_my_reports', JSON.stringify(reports))
}

export function addReport(report) {
  const reports = getReports()
  reports.unshift(report)
  saveReports(reports)
  return report
}

export function getReport(id) {
  return getReports().find(r => r.id === id) || null
}

export function updateReport(id, patch) {
  const reports = getReports()
  const idx = reports.findIndex(r => r.id === id)
  if (idx >= 0) {
    reports[idx] = { ...reports[idx], ...patch }
    saveReports(reports)
    return reports[idx]
  }
  return null
}

export function genReportId() {
  return 'R-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 4).toUpperCase()
}

// ── Dashboard data ──
export function getDashData() {
  const saved = localStorage.getItem('hackpark_dash_data')
  if (saved) {
    try { return JSON.parse(saved) } catch {}
  }
  return { reports: 0, earnings: 0, points: 500, rank: 'Skiller', bonusEarnings: 0, bonusPoints: 0 }
}

export function saveDashData(data) {
  localStorage.setItem('hackpark_dash_data', JSON.stringify(data))
}

export function addDashReport(reward) {
  const dash = getDashData()
  dash.reports = (dash.reports || 0) + 1
  dash.earnings = (dash.earnings || 0) + reward
  dash.points = (dash.points || 0) + Math.round(reward / 100)
  saveDashData(dash)
  return dash
}

// ── Chat storage ──
export function getChats() {
  return JSON.parse(localStorage.getItem('hackpark_chats') || '[]')
}

export function saveChats(chats) {
  localStorage.setItem('hackpark_chats', JSON.stringify(chats))
}

// ── Admin password ──
export const ADMIN_PASSWORD = '1'
export const ADMIN_KEY = 'hackpark_admin_authed'

export function isAdminAuthed() {
  return sessionStorage.getItem(ADMIN_KEY) === '1'
}

export function adminLogin(pass) {
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_KEY, '1')
    return true
  }
  return false
}

export function adminLogout() {
  sessionStorage.removeItem(ADMIN_KEY)
}

// ── Profile settings ──
export function getProfileSettings(authKey) {
  if (authKey) {
    return JSON.parse(localStorage.getItem('hackpark_profile_' + authKey) || '{}')
  }
  return JSON.parse(localStorage.getItem('hackpark_profile_settings') || '{}')
}

export function saveProfileSettings(settings, authKey) {
  if (authKey) {
    localStorage.setItem('hackpark_profile_' + authKey, JSON.stringify(settings))
  } else {
    localStorage.setItem('hackpark_profile_settings', JSON.stringify(settings))
  }
}

// ── Reward map (admin report rewards) ──
export function getRewardMap() {
  return JSON.parse(localStorage.getItem('hackpark_reward_map') || '{}')
}

export function saveRewardMap(map) {
  localStorage.setItem('hackpark_reward_map', JSON.stringify(map))
}

export function getXPMap() {
  return JSON.parse(localStorage.getItem('hackpark_xp_map') || '{}')
}

export function saveXPMap(map) {
  localStorage.setItem('hackpark_xp_map', JSON.stringify(map))
}

// ── Articles storage ──
export function getArticles() {
  return JSON.parse(localStorage.getItem('hackpark_articles') || '[]')
}

export function saveArticles(articles) {
  localStorage.setItem('hackpark_articles', JSON.stringify(articles))
}

export function addArticle(article) {
  const articles = getArticles()
  articles.unshift(article)
  saveArticles(articles)
  return article
}

export function deleteArticle(id) {
  const articles = getArticles().filter(a => a.id !== id)
  saveArticles(articles)
  return articles
}

export function updateArticle(id, patch) {
  const articles = getArticles()
  const idx = articles.findIndex(a => a.id === id)
  if (idx >= 0) {
    articles[idx] = { ...articles[idx], ...patch }
    saveArticles(articles)
    return articles[idx]
  }
  return null
}


export function toggleArticleLike(articleId, userId) {
  const articles = getArticles()
  const idx = articles.findIndex(a => a.id === articleId)
  if (idx < 0) return null
  const likes = articles[idx].likes || []
  const li = likes.indexOf(userId)
  if (li >= 0) likes.splice(li, 1)
  else likes.push(userId)
  articles[idx].likes = likes
  saveArticles(articles)
  return articles[idx]
}

export function addArticleComment(articleId, comment) {
  const articles = getArticles()
  const idx = articles.findIndex(a => a.id === articleId)
  if (idx < 0) return null
  if (!articles[idx].comments) articles[idx].comments = []
  articles[idx].comments.push(comment)
  saveArticles(articles)
  return articles[idx]
}


export function incArticleViews(id) {
  const articles = getArticles()
  const idx = articles.findIndex(a => a.id === id)
  if (idx < 0) return null
  articles[idx].views = (articles[idx].views || 0) + 1
  saveArticles(articles)
  return articles[idx]
}

// ── Follows / subscriptions ──
export function getFollows() {
  return JSON.parse(localStorage.getItem('hackpark_follows') || '[]')
}

export function saveFollows(follows) {
  localStorage.setItem('hackpark_follows', JSON.stringify(follows))
}

export function toggleFollow(targetAuthKey) {
  const follows = getFollows()
  const idx = follows.indexOf(targetAuthKey)
  if (idx >= 0) follows.splice(idx, 1)
  else follows.push(targetAuthKey)
  saveFollows(follows)
  return follows
}

export function isFollowing(targetAuthKey) {
  return getFollows().includes(targetAuthKey)
}

export function getFollowersCount(authKey) {
  // Count how many users follow this authKey — since localStorage, check all profile settings' follows
  // In a single-browser app, we approximate: just return length of follows that include this key
  // But follows stored per current user only. For demo, we store a global followers map.
  try {
    const map = JSON.parse(localStorage.getItem('hackpark_followers_map') || '{}')
    return map[authKey] || 0
  } catch { return 0 }
}

export function incFollowersCount(authKey) {
  try {
    const map = JSON.parse(localStorage.getItem('hackpark_followers_map') || '{}')
    map[authKey] = (map[authKey] || 0) + 1
    localStorage.setItem('hackpark_followers_map', JSON.stringify(map))
  } catch {}
}

export function decFollowersCount(authKey) {
  try {
    const map = JSON.parse(localStorage.getItem('hackpark_followers_map') || '{}')
    map[authKey] = Math.max(0, (map[authKey] || 0) - 1)
    localStorage.setItem('hackpark_followers_map', JSON.stringify(map))
  } catch {}
}

// ── Notifications ──
export function getNotifications(authKey) {
  if (!authKey) return []
  try {
    return JSON.parse(localStorage.getItem('hackpark_notifications_' + authKey) || '[]')
  } catch { return [] }
}

export function saveNotifications(notifications, authKey) {
  if (!authKey) return
  localStorage.setItem('hackpark_notifications_' + authKey, JSON.stringify(notifications))
}

export function addNotification(authKey, notif) {
  if (!authKey) return
  const all = getNotifications(authKey)
  const entry = {
    id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    ts: Date.now(),
    read: false,
    ...notif
  }
  all.unshift(entry)
  // Cap at 50 notifications
  if (all.length > 50) all.length = 50
  saveNotifications(all, authKey)
}

export function markNotificationRead(id, authKey) {
  const all = getNotifications(authKey)
  const n = all.find(x => x.id === id)
  if (n) { n.read = true; saveNotifications(all, authKey) }
}

export function markAllNotificationsRead(authKey) {
  const all = getNotifications(authKey)
  all.forEach(n => { n.read = true })
  saveNotifications(all, authKey)
}

export function getUnreadNotificationCount(authKey) {
  return getNotifications(authKey).filter(n => !n.read).length
}

// ── Per-user rewards (computed from reports) ──
export function getUserRewards(authKey) {
  if (!authKey) return { reports: 0, earnings: 0, points: 0, rank: 'Skiller', unlocked: [] }
  const reports = getReports().filter(r => r.reporterKey === authKey)
  const confirmed = reports.filter(r => r.status === 'confirmed')
  const rewardMap = getRewardMap()
  const xpMap = getXPMap()
  let earnings = 0, points = 0
  confirmed.forEach(r => {
    earnings += rewardMap[r.id] || r.reward || 0
    points += xpMap[r.id] || Math.round((rewardMap[r.id] || r.reward || 0) / 100)
  })
  const RANKS = [
    { name: 'Skiller', xp: 0 },
    { name: 'Expert', xp: 1000 },
    { name: 'Elite', xp: 3000 },
    { name: 'Legend', xp: 8000 },
  ]
  let rank = 'Skiller'
  for (const r of RANKS) { if (points >= r.xp) rank = r.name }
  const REWARD_ICONS = [
    'M12 2l2.4 7.4H22l-6.2 4.6 2.4 7.4-6.2-4.6L5.8 21.4l2.4-7.4L2 9.4h7.6z',
    'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01 9 11.01',
    'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5',
    'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  ]
  const REWARD_NAMES = [
    { name: 'Первый отчёт', desc: 'Отправить первый отчёт' },
    { name: 'Пять отчётов', desc: 'Отправить 5 отчётов' },
    { name: 'Первая награда', desc: 'Заработать первую награду' },
    { name: 'Опытный', desc: 'Набрать 1000 XP' },
    { name: 'Эксперт', desc: 'Достичь ранга Expert' },
    { name: 'Чемпион', desc: 'Достичь ранга Legend' },
  ]
  const conds = [
    reports.length >= 1,
    reports.length >= 5,
    earnings > 0,
    points >= 1000,
    rank === 'Expert' || rank === 'Elite' || rank === 'Legend',
    rank === 'Legend',
  ]
  const unlocked = conds.map((u, i) => ({ ...REWARD_NAMES[i], icon: REWARD_ICONS[i], unlocked: u }))
  return { reports: reports.length, earnings, points, rank, unlocked }
}
