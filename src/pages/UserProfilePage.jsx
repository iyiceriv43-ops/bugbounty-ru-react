import { useState, useCallback, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { getUsers } from '../context/AuthContext.jsx'
import { getProfileSettings, getArticles, toggleArticleLike, addArticleComment, incArticleViews, getFollows, toggleFollow, saveFollows, getFollowersCount, incFollowersCount, decFollowersCount, getUserRewards } from '../data/store.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/articles.css'
import '../styles/quill-override.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

const fmtDate = (iso) => {
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

const RANKS = [
  { name: 'Skiller', xp: 0 },
  { name: 'Expert', xp: 1000 },
  { name: 'Elite', xp: 3000 },
  { name: 'Legend', xp: 8000 },
]

export default function UserProfilePage() {
  useDocumentTitle('Профиль — HackPark')
  const { authKey } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const adminMode = location.state?.from === 'admin'
  const [profileUser, setProfileUser] = useState(null)
  const [settings, setSettings] = useState({})
  const [articles, setArticles] = useState([])
  const [expandedArticle, setExpandedArticle] = useState(null)
  const [commentsOpen, setCommentsOpen] = useState(null)
  const [commentDrafts, setCommentDrafts] = useState({})
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [businessModal, setBusinessModal] = useState(false)
  const [rewards, setRewards] = useState({ reports: 0, earnings: 0, points: 0, rank: 'Skiller', unlocked: [] })

  useEffect(() => {
    const users = getUsers()
    const u = users.find(x => x.authKey === authKey)
    if (!u) return
    setProfileUser(u)
    setSettings(getProfileSettings(authKey))
    setArticles(getArticles().filter(a => a.authorKey === authKey))
    setFollowing(getFollows().includes(authKey))
    setFollowersCount(getFollowersCount(authKey))
    setRewards(getUserRewards(authKey))
  }, [authKey])

  const refresh = useCallback(() => {
    setArticles(getArticles().filter(a => a.authorKey === authKey))
  }, [authKey])

  const handleExpandArticle = useCallback((articleId) => {
    const willExpand = expandedArticle !== articleId
    setExpandedArticle(willExpand ? articleId : null)
    if (willExpand) {
      incArticleViews(articleId)
      refresh()
    }
  }, [expandedArticle, refresh])

  const handleFollow = useCallback(() => {
    if (!user) { navigate('/login'); return }
    const updated = toggleFollow(authKey)
    setFollowing(updated.includes(authKey))
    if (updated.includes(authKey)) {
      incFollowersCount(authKey)
      setFollowersCount(c => c + 1)
    } else {
      decFollowersCount(authKey)
      setFollowersCount(c => Math.max(0, c - 1))
    }
  }, [authKey, user, navigate])

  const handleLike = useCallback((articleId) => {
    const userId = user?.authKey || 'guest'
    toggleArticleLike(articleId, userId)
    refresh()
  }, [user, refresh])

  const handleAddComment = useCallback((articleId, text) => {
    if (!text.trim()) return
    if (!user) { navigate('/login'); return }
    const c = {
      id: 'c-' + Date.now(),
      author: user?.user || 'Гость',
      authorKey: user?.authKey || 'guest',
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }
    addArticleComment(articleId, c)
    setCommentDrafts(d => ({ ...d, [articleId]: '' }))
    refresh()
  }, [user, refresh, navigate])

  if (!profileUser) {
    return (
      <>
        {!adminMode && <Nav scrolled onBusinessModal={() => setBusinessModal(true)} />}
        <div className="articles-page">
          <div className="articles-page-inner">
            <div className="articles-page-empty">
              <h3>Пользователь не найден</h3>
              <p>Возможно, аккаунт удалён или ключ указан неверно.</p>
              <Link to={adminMode ? '/admin' : '/dashboard'} className="btn btn-primary">{adminMode ? 'В админку' : 'В дашборд'}</Link>
            </div>
          </div>
        </div>
        {!adminMode && <Footer onBusinessModal={() => setBusinessModal(true)} />}
      </>
    )
  }

  const displayName = settings.displayName || profileUser.name || profileUser.email?.split('@')[0] || 'исследователь'
  const initial = displayName.charAt(0).toUpperCase()
  const isSelf = user?.authKey === authKey
  const isApproved = profileUser.status === 'approved'

  return (
    <>
      {!adminMode && <Nav scrolled onBusinessModal={() => setBusinessModal(true)} />}

      <div className="articles-page" style={{ paddingTop: adminMode ? 32 : 100 }}>
        <div className="articles-page-inner" style={{ maxWidth: 760 }}>
          <Link to={adminMode ? '/admin' : '/dashboard'} style={{ fontSize: 14, color: 'var(--ink-3)', textDecoration: 'none', marginBottom: 16, display: 'inline-block' }}>← {adminMode ? 'Назад в админку' : 'Назад в дашборд'}</Link>

          {/* Profile header */}
          <div className="up-profile-card">
            {settings.banner
              ? <div className="up-banner" style={{ backgroundImage: 'url(' + settings.banner + ')' }} />
              : <div className="up-banner up-banner-empty" />}
            <div className="up-profile-inner">
              <div className="up-avatar">
                {settings.avatar
                  ? <img src={settings.avatar} alt={displayName} className="up-avatar-img" />
                  : initial}
              </div>
              <div className="up-profile-info">
                <h2>{displayName}</h2>
                <div className="up-profile-meta">
                  {profileUser.role === 'admin' && <span className="up-status-badge admin-shield">⚙ Администратор</span>}
                  {isApproved
                    ? <span className="up-status-badge approved">✓ Подтверждён</span>
                    : <span className="up-status-badge pending">Ожидает</span>}
                  <span className="up-followers">{followersCount} подписчиков</span>
                </div>
                {profileUser.telegram && <div className="up-profile-telegram">@{profileUser.telegram}</div>}
              </div>
              <div className="up-profile-actions">
                {isSelf ? (
                  <Link to="/dashboard" className="btn btn-ghost">Редактировать профиль</Link>
                ) : (
                  <button
                    className={'btn ' + (following ? 'btn-ghost' : 'btn-primary')}
                    onClick={handleFollow}
                  >
                    {following ? 'Отписаться' : 'Подписаться'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="dash-sec-title" style={{ marginTop: 32 }}>
            Награды
            <span className="count">{rewards.unlocked.filter(r => r.unlocked).length} получено · {rewards.unlocked.length} всего</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '8px' }}>
            {rewards.unlocked.map((r, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                padding: '18px 12px', borderRadius: '14px',
                background: r.unlocked ? 'var(--bg-1)' : 'var(--bg)',
                border: r.unlocked ? '1px solid var(--g1)' : '1px solid var(--line)',
                opacity: r.unlocked ? 1 : 0.4,
                transition: 'opacity .2s',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill={r.unlocked ? 'var(--g1)' : 'none'} stroke={r.unlocked ? 'var(--g1)' : 'var(--ink-3)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                  <path d={r.icon} />
                </svg>
                <div style={{ fontSize: 13, fontWeight: 600, color: r.unlocked ? 'var(--ink)' : 'var(--ink-3)', marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.desc}</div>
              </div>
            ))}
          </div>
          {(rewards.earnings > 0 || rewards.reports > 0) && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 120, padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-1)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--g1)', fontFamily: 'var(--font-head)' }}>{rewards.reports}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Отчётов</div>
              </div>
              <div style={{ flex: 1, minWidth: 120, padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-1)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-head)' }}>{rewards.earnings.toLocaleString('ru-RU')} ₽</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Заработано</div>
              </div>
              <div style={{ flex: 1, minWidth: 120, padding: '14px 16px', borderRadius: '12px', background: 'var(--bg-1)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-head)' }}>{rewards.rank}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>Ранг</div>
              </div>
            </div>
          )}

          {/* Articles */}
          <div className="dash-sec-title" style={{ marginTop: 32 }}>
            Статьи
            <span className="count">{articles.length} статей</span>
          </div>
          {articles.length === 0 ? (
            <div className="dash-article-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              <p>{isSelf ? 'Вы ещё не написали статей.' : 'У этого пользователя пока нет статей.'}</p>
            </div>
          ) : (
            <div className="dash-article-list">
              {articles.map(a => {
                const liked = (a.likes || []).includes(user?.authKey || 'guest')
                const expanded = expandedArticle === a.id
                const cDraft = commentDrafts[a.id] || ''
                return (
                  <div key={a.id} className="dash-article-card">
                    <div className="dash-article-card-head">
                      <div className="dash-article-avatar">{(a.author || '?').charAt(0).toUpperCase()}</div>
                      <div className="dash-article-meta">
                        <div className="dash-article-author">{a.author}</div>
                        <div className="dash-article-date">{fmtDate(a.createdAt)}</div>
                      </div>
                    </div>
                    <h3 className="dash-article-title">{a.title}</h3>
                    <div className={'dash-article-body' + (expanded ? ' expanded' : '')} dangerouslySetInnerHTML={{ __html: a.body }} />
{(a.body || '').replace(/<[^>]*>/g, '').length > 202 && (
                        <button className="dash-article-expand" onClick={() => handleExpandArticle(a.id)}>
                        {expanded ? 'Свернуть' : 'Читать далее...'}
                      </button>
                    )}
                    <div className="dash-article-actions">
                      <button className={'dash-article-act' + (liked ? ' liked' : '')} onClick={() => handleLike(a.id)}>
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
                                <span className="dash-article-comment-date">{fmtDate(c.createdAt)}</span>
                              </div>
                              <div className="dash-article-comment-text">{c.text}</div>
                            </div>
                          </div>
                        ))}
                        <div className="dash-article-comment-form">
                          <input
                            type="text"
                            placeholder={user ? 'Написать комментарий...' : 'Войдите, чтобы комментировать...'}
                            value={cDraft}
                            disabled={!user}
                            onChange={(e) => setCommentDrafts(d => ({ ...d, [a.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(a.id, cDraft) }}
                          />
                          <button className="btn btn-primary btn-sm" onClick={() => handleAddComment(a.id, cDraft)} disabled={!user || !cDraft.trim()}>Отправить</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {!adminMode && <Footer onBusinessModal={() => setBusinessModal(true)} />}
    </>
  )
}
