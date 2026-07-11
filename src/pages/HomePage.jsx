import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { logoStyle } from '../data/programs.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { asset } from '../utils/assets.js'

// ===== Target programs data =====
const programs = [
  { company:"Сбер", logoImg: asset("/images/targets/sber.svg"), scope:["Web","API","Mobile"], maxBounty:"500 000 ₽", badge:"critical", badgeText:"Critical", researchers:412, reports:289, cat:"web" },
  { company:"Т-Банк", logoImg: asset("/images/targets/tbank.svg"), scope:["Web","API"], maxBounty:"300 000 ₽", badge:"critical", badgeText:"Critical", researchers:367, reports:201, cat:"web" },
  { company:"Ozon", logoImg: asset("/images/targets/ozon.svg"), scope:["Web","Mobile","API"], maxBounty:"250 000 ₽", badge:"high", badgeText:"High", researchers:289, reports:178, cat:"web" },
  { company:"Яндекс", logoImg: asset("/images/targets/yandex.svg"), scope:["Web","API","Infra"], maxBounty:"400 000 ₽", badge:"critical", badgeText:"Critical", researchers:521, reports:342, cat:"api" },
  { company:"VK", logoImg: asset("/images/targets/vk.svg"), scope:["Web","Mobile"], maxBounty:"200 000 ₽", badge:"high", badgeText:"High", researchers:198, reports:145, cat:"mobile" },
  { company:"Wildberries", logoImg: asset("/images/targets/wildberries.svg"), scope:["Web","API"], maxBounty:"150 000 ₽", badge:"high", badgeText:"High", researchers:156, reports:98, cat:"web" },
  { company:"Avito", logoImg: asset("/images/targets/avito.svg"), scope:["Web","Mobile","API"], maxBounty:"180 000 ₽", badge:"high", badgeText:"High", researchers:134, reports:87, cat:"mobile" },
  { company:"Rambler", logoImg: asset("/images/targets/rambler.svg"), scope:["Web","Infra"], maxBounty:"120 000 ₽", badge:"medium", badgeText:"Medium", researchers:89, reports:62, cat:"infra" },
  { company:"Тинькофф", logoImg: asset("/images/targets/tinkoff.svg"), scope:["Web","API","Mobile"], maxBounty:"350 000 ₽", badge:"critical", badgeText:"Critical", researchers:298, reports:192, cat:"web" },
  { company:"Газпром Neo", logoImg: asset("/images/targets/gazprom-neo.png"), scope:["Web","Infra","API"], maxBounty:"280 000 ₽", badge:"high", badgeText:"High", researchers:112, reports:73, cat:"infra" },
  { company:"BitGet RU", logoImg: asset("/images/targets/bitget.svg"), scope:["API","Smart Contract"], maxBounty:"450 000 ₽", badge:"critical", badgeText:"Critical", researchers:87, reports:54, cat:"blockchain" },
  { company:"Bybit RU", logoImg: asset("/images/targets/bybit.png"), scope:["API","Web3","Mobile"], maxBounty:"500 000 ₽", badge:"critical", badgeText:"Critical", researchers:76, reports:41, cat:"blockchain" },
]

const filters = [
  { id: 'all', label: 'Все' },
  { id: 'web', label: 'Web' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'api', label: 'API' },
  { id: 'infra', label: 'Инфраструктура' },
  { id: 'blockchain', label: 'Web3' },
]

const faqData = [
  {
    q: 'Что такое bug bounty?',
    a: 'Bug bounty — это программа, в рамках которой независимые исследователи безопасности ищут уязвимости в IT-системах компании и получают за это вознаграждение. Это crowdsourced security testing — краудсорсинговое тестирование безопасности.',
  },
  {
    q: 'Какие активы можно тестировать?',
    a: 'Scope может включать веб- и мобильные приложения, API, части IT-инфраструктуры, сетевые сервисы, IoT-устройства и смарт-контракты. Вы определяете, что тестируют и в рамках каких ограничений.',
  },
  {
    q: 'Сколько платят за уязвимость?',
    a: 'Вознаграждение зависит от severity уязвимости. Критические (Critical) — до 500 000 ₽. Высокие (High) — до 200 000 ₽. Средние (Medium) — до 50 000 ₽. Низкие (Low) — до 10 000 ₽. Программа устанавливает свои ставки bounty.',
  },
  {
    q: 'Кто может стать исследователем?',
    a: 'Любой совершеннолетний специалист по информационной безопасности. Регистрация бесплатна. Вся работа ведется прямо из нашего Коворкинг HackPark в Казани. Опыт не обязателен — многие начинают с поиска Low-severity багов.',
  },
  {
    q: 'Как выплачиваются награды?',
    a: 'Выплаты производятся на банковскую карту, СБП или крипто-кошелёк (USDT). После триаджа и подтверждения уязвимости средства поступают в течение 3 рабочих дней. Комиссия платформы отсутствует для исследователя.',
  },
  {
    q: 'Как запустить программу для бизнеса?',
    a: 'Нажмите «Добавить бизнес», заполните бриф — мы свяжемся с вами в течение 1 рабочего дня. Мы поможем определить scope, установить bounty-ставки, выбрать формат и запустить программу под ключ. Включено в Реестр российского ПО.',
  },
]

const stats = [
  { count: 500, suffix: '+', label: 'Исследователей', prefix: '' },
  { count: 3000, suffix: '+', label: 'Отчётов отправлено', prefix: '' },
  { count: 50, suffix: '+', label: 'Запущенных программ', prefix: '' },
  { count: 15000, suffix: '', label: 'Средняя выплата', prefix: '₽' },
  { count: 130000, suffix: ' ₽', label: 'Выплачено всего', prefix: '' },
]

const barHeights = ['40%', '65%', '30%', '80%', '55%', '90%', '70%']

export default function HomePage() {
  useDocumentTitle('HackPark — Bug Bounty платформа')
  const navigate = useNavigate()

  // ===== State =====
  const [activeFilter, setActiveFilter] = useState('all')
  const [faqOpen, setFaqOpen] = useState(null)
  const [businessModal, setBusinessModal] = useState(false)
  const [bizSuccess, setBizSuccess] = useState(false)

  // ===== Form state =====
  const [bizForm, setBizForm] = useState({
    bizCompany: '',
    bizName: '',
    bizPhone: '',
    bizEmail: '',
    bizSize: '',
    bizScope: '',
    bizComment: '',
    bizConsent: false,
  })

  // ===== Year timer state =====
  const [yt, setYt] = useState({
    years: 0, days: 0, hours: 0, mins: 0, secs: 0,
    yearsLabel: 'лет', daysLabel: 'дней', hoursLabel: 'часов', minsLabel: 'минут', secsLabel: 'секунд',
  })

  // ===== Stats state =====
  const [statCounts, setStatCounts] = useState(stats.map(() => 0))
  const [counted, setCounted] = useState(stats.map(() => false))

  // ===== Refs =====
  const secRobot = useRef(null)
  const secBizChart = useRef(null)
  const secHeroCardP = useRef(null)
  const secHeroCardP2 = useRef(null)

  // ===== model-viewer: lazy load on mobile, only when CTA near viewport =====
  const [mvReady, setMvReady] = useState(false)
  useEffect(() => {
    // On mobile skip auto-load; wait until scene scrolls near viewport (handled below)
    // On desktop, preload the custom element early for a smoother reveal
    const isMobile = window.matchMedia('(max-width: 860px)').matches
    if (!isMobile) setMvReady(true)
  }, [])

  useEffect(() => {
    const scene = secRobot.current
    if (!scene) return
    // Once the CTA scene is near viewport, inject model-viewer element + script
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setMvReady(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '200px 0px' }
    )
    observer.observe(scene)
    return () => observer.disconnect()
  }, [])

  // Inject model-viewer custom element script when needed
  useEffect(() => {
    if (!mvReady) return
    if (typeof customElements !== 'undefined' && customElements.get('model-viewer')) return
    const s = document.createElement('script')
    s.type = 'module'
    const base = import.meta.env.BASE_URL
    s.textContent = `import { ModelViewerElement } from '${base}vendor/model-viewer.min.js'; ModelViewerElement.meshoptDecoderLocation = '${base}vendor/meshopt_decoder.js'; if (!customElements.get('model-viewer')) customElements.define('model-viewer', ModelViewerElement);`
    document.head.appendChild(s)
    return () => { s.remove() }
  }, [mvReady])

  // ===== Auth gate =====
  const handleAuth = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const authed = localStorage.getItem('hackpark_auth')
    if (authed) {
      navigate('/dashboard')
    } else {
      navigate('/login?redirect=' + encodeURIComponent('/#programs'))
    }
  }


  // ===== Year Timer =====
  useEffect(() => {
    const start = new Date('2026-07-10T14:50:00Z')
    const pad = (n) => String(n).padStart(2, '0')
    const plural = (n, one, few, many) => {
      const mod10 = n % 10
      const mod100 = n % 100
      if (mod100 >= 11 && mod100 <= 14) return many
      if (mod10 === 1) return one
      if (mod10 >= 2 && mod10 <= 4) return few
      return many
    }
    const tick = () => {
      const now = new Date()
      const diff = now - start
      if (diff < 0) {
        setYt({
          years: 0, days: 0, hours: 0, mins: 0, secs: 0,
          yearsLabel: 'лет', daysLabel: 'дней', hoursLabel: 'часов', minsLabel: 'минут', secsLabel: 'секунд',
        })
        return
      }
      const years = Math.floor(diff / 365.25 / 86400000)
      const days = Math.floor((diff % (365.25 * 86400000)) / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setYt({
        years: String(years),
        days: String(days),
        hours: pad(hours),
        mins: pad(mins),
        secs: pad(secs),
        yearsLabel: plural(years, 'год', 'года', 'лет'),
        daysLabel: plural(days, 'день', 'дня', 'дней'),
        hoursLabel: plural(hours, 'час', 'часа', 'часов'),
        minsLabel: plural(mins, 'минута', 'минуты', 'минут'),
        secsLabel: plural(secs, 'секунда', 'секунды', 'секунд'),
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  // ===== Reveal on scroll =====
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    )
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    document.querySelectorAll('.stat').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [activeFilter])

  // ===== Count-up stats =====
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const statEls = entry.target.querySelectorAll ? entry.target.querySelectorAll('.stat-num') : []
            statEls.forEach((n) => {
              const idx = parseInt(n.dataset.idx)
              if (counted[idx]) return
              setCounted((prev) => prev.map((v, i) => (i === idx ? true : v)))
              const target = stats[idx].count
              const prefix = stats[idx].prefix || ''
              const suffix = stats[idx].suffix || ''
              const duration = 1800
              const steps = 60
              const inc = target / steps
              let current = 0
              let i = 0
              const timer = setInterval(() => {
                i++
                current += inc
                if (i >= steps) {
                  current = target
                  clearInterval(timer)
                }
                const val = Math.floor(current)
                const formatted = val >= 1000 ? val.toLocaleString('ru-RU') : String(val)
                setStatCounts((prev) => prev.map((v, idx2) => (idx2 === idx ? prefix + formatted + suffix : v)))
              }, duration / steps)
            })
            if (entry.target.classList.contains('stat')) {
              const n = entry.target.querySelector('.stat-num')
              if (n) {
                const idx = parseInt(n.dataset.idx)
                if (counted[idx]) return
                setCounted((prev) => prev.map((v, i) => (i === idx ? true : v)))
                const target = stats[idx].count
                const prefix = stats[idx].prefix || ''
                const suffix = stats[idx].suffix || ''
                const duration = 1800
                const steps = 60
                const inc = target / steps
                let current = 0
                let i = 0
                const timer = setInterval(() => {
                  i++
                  current += inc
                  if (i >= steps) {
                    current = target
                    clearInterval(timer)
                  }
                  const val = Math.floor(current)
                  const formatted = val >= 1000 ? val.toLocaleString('ru-RU') : String(val)
                  setStatCounts((prev) => prev.map((v, idx2) => (idx2 === idx ? prefix + formatted + suffix : v)))
                }, duration / steps)
              }
            }
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    )
    document.querySelectorAll('.stat').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // ===== Bar chart animation =====
  useEffect(() => {
    const bizChart = secBizChart.current
    if (!bizChart) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bars = bizChart.querySelectorAll('.bar span')
            bars.forEach((bar, i) => {
              bar.style.height = '0%'
              setTimeout(() => {
                bar.style.height = bar.parentElement.style.getPropertyValue('--h')
              }, i * 100)
            })
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )
    observer.observe(bizChart)
    return () => observer.disconnect()
  }, [])

  // ===== Close modal on Escape =====
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setBusinessModal(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // ===== Smooth scroll for anchor links =====
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const href = a.getAttribute('href')
      if (href.length > 1 && href !== '#') {
        const target = document.querySelector(href)
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // ===== 3D Tilt card effect =====
  const tiltMouseMove = (e) => {
    const card = e.currentTarget
    const r = card.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const mx = e.clientX - cx
    const my = e.clientY - cy
    const maxTilt = 12
    const rotateX = (-my / (r.height / 2)) * maxTilt
    const rotateY = (mx / (r.width / 2)) * maxTilt
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`
  }
  const tiltMouseEnter = (e) => {
    e.currentTarget.style.transition = 'none'
  }
  const tiltMouseLeave = (e) => {
    const card = e.currentTarget
    card.style.transform = ''
    card.style.transition = 'transform 0.5s ease'
  }

  // ===== Form helpers =====
  const handleFieldChange = (e) => {
    const { id, value, type, checked } = e.target
    setBizForm((prev) => ({ ...prev, [id]: type === 'checkbox' ? checked : value }))
  }
  const handleBizSubmit = (e) => {
    e.preventDefault()
    // validation
    if (!bizForm.bizCompany || !bizForm.bizName || !bizForm.bizPhone || !bizForm.bizEmail || !bizForm.bizSize || !bizForm.bizScope) {
      const err = document.getElementById('bizFormError')
      if (err) err.textContent = 'Заполните все обязательные поля'
      return
    }
    if (!bizForm.bizConsent) {
      const err = document.getElementById('bizFormError')
      if (err) err.textContent = 'Подтвердите согласие на обработку данных'
      return
    }
    // Save business request to localStorage for admin panel
    try {
      const KEY = 'hackpark_business_requests'
      const reqs = JSON.parse(localStorage.getItem(KEY) || '[]')
      reqs.push({
        id: 'BR-' + Date.now(),
        ...bizForm,
        submittedAt: new Date().toISOString(),
        status: 'new',
      })
      localStorage.setItem(KEY, JSON.stringify(reqs))
    } catch (e2) { console.error('Failed to save business request', e2) }
    setBizSuccess(true)
  }
  const closeModal = () => {
    setBusinessModal(false)
    setTimeout(() => setBizSuccess(false), 300)
  }

  // ===== Render target card =====
  const renderTargetCard = (p, i) => (
    <div className="target-card" key={i} onMouseMove={tiltMouseMove} onMouseEnter={tiltMouseEnter} onMouseLeave={tiltMouseLeave}>
      <div className="target-header">
        <div className="target-logo-sm" style={{ background: p.logoImg ? "transparent" : logoStyle(p.company), overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>{p.logoImg ? <img src={p.logoImg} alt={p.company} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8%" }} /> : (p.company||"?").charAt(0)}</div>
        <span className="target-company">{p.company}</span>
        <span className={`target-badge ${p.badge}`}>{p.badgeText}</span>
      </div>
      <div className="target-body">
        <div className="target-scope">{p.scope.map((s, j) => <span key={j}>{s}</span>)}</div>
        <div className="target-bounty">
          <span className="target-bounty-label">до</span>
          <span className="target-bounty-max">{p.maxBounty}</span>
        </div>
        <div className="target-researchers"><span className="dot"></span> {p.researchers} исследователей активно</div>
        <div className="target-reports">{p.reports} отчётов отправлено</div>
      </div>
      <div className="target-footer">
        <span style={{ fontSize: '13px', color: 'var(--ink-3)' }}>Подробнее</span>
        <a href="#" className="btn btn-primary btn-sm" data-auth="1" onClick={handleAuth}>Участвовать →</a>
      </div>
    </div>
  )

  const filtered = activeFilter === 'all' ? programs : programs.filter((p) => p.cat === activeFilter)

  return (
    <>
      <Nav onBusinessModal={() => setBusinessModal(true)} />

      {/* ═══ HERO ═══ */}
      <header className="hero" id="hero">
        <div className="hero-video-wrap">
<video className="hero-video" autoPlay muted loop playsInline preload="metadata" poster={asset("/images/hero-poster.jpg")}>
              <source src={asset("/images/hero.mp4")} type="video/mp4" />
            </video>
          <div className="hero-overlay"></div>
          <div className="hero-grid"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge reveal"><span className="pulse"></span> Платформа работает · 2026</div>
          <h1 className="hero-title reveal">
            Найди уязвимость.<br />
            <span className="gradient-text">Получи вознаграждение.</span><br />
            Защити бизнес.
          </h1>
          <p className="hero-sub reveal">Bug Bounty платформа от HackPark. 500+ исследователей безопасности тестируют ваши системы 24/7. Платите только за подтверждённые уязвимости.</p>
          <div className="hero-targets reveal">
            <div className="hero-target-card" id="targetPentester" ref={secHeroCardP} onMouseMove={tiltMouseMove} onMouseEnter={tiltMouseEnter} onMouseLeave={tiltMouseLeave}>
              <div className="hero-target-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2L4 6L2 4L4 2L8 2M16 2L20 6L22 4L20 2L16 2M4 6L6 8L4 10M8 6L6 8M12 12L8 8L12 4L16 8L12 12M12 12L14 14L12 16M12 16L10 14M12 12L10 14M12 16L14 18L12 20L10 18L12 16M18 22L22 18L20 16M14 18L16 20L14 22M18 22L16 22M14 22L12 22M20 18L22 16M18 18L16 16M4 14L6 12M6 12L8 14M4 16L6 18M6 18L8 16" />
                </svg>
              </div>
              <div className="hero-target-text">
                <h3>Я Pentester</h3>
                <p>Ищи баги · Получай награды до <strong>500 000 ₽</strong></p>
              </div>
              <a href="#" className="btn btn-primary btn-med" data-auth="1" onClick={handleAuth}>Участвовать →</a>
            </div>
            <div className="hero-target-card hero-target-business" id="targetBusiness" ref={secHeroCardP2} onMouseMove={tiltMouseMove} onMouseEnter={tiltMouseEnter} onMouseLeave={tiltMouseLeave}>
              <div className="hero-target-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-4h6v4M9 11h.01M15 11h.01M9 7h.01M15 7h.01M12 13v.01M12 17v.01" />
                </svg>
              </div>
              <div className="hero-target-text">
                <h3>Я Бизнес</h3>
                <p>Запусти программу · 400+ компаний уже с нами</p>
              </div>
              <a href="#" className="btn btn-accent btn-med" onClick={(e) => { e.preventDefault(); setBusinessModal(true) }}>Добавить бизнес →</a>
            </div>
          </div>
        </div>
        <div className="hero-scroll reveal">
          <span>Прокрутите вниз</span>
          <div className="scroll-line"></div>
        </div>
      </header>

      {/* ═══ STATS ═══ */}
      <section className="stats" id="stats">
        <div className="stats-inner">
          {stats.map((s, i) => (
            <div className="stat reveal" key={i}>
              <div className="stat-num" data-idx={i} data-count={s.count} data-suffix={s.suffix} data-prefix={s.prefix}>{statCounts[i]}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TARGET CARDS GRID ═══ */}
      <section className="targets" id="programs">
        <div className="section-head reveal">
          <span className="section-tag">Активные таргеты</span>
          <h2 className="section-title">Выберите свою цель.</h2>
          <p className="section-sub">Реальные программы от российских компаний. Scope, bounty и условия — всё прозрачно. Кликните, чтобы принять участие.</p>
        </div>
        <div className="targets-filters reveal">
          {filters.map((f) => (
            <button key={f.id} className={`filter-chip ${activeFilter === f.id ? 'active' : ''}`} onClick={() => setActiveFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <div className="targets-grid" id="targetsGrid">
          {filtered.map((p, i) => renderTargetCard(p, i))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="how" id="how">
        <div className="section-head reveal">
          <span className="section-tag">Как это работает</span>
          <h2 className="section-title">Пять шагов до выплаты.</h2>
        </div>
        <div className="steps">
          <div className="step reveal"><div className="step-num">01</div><h3>Регистрируйся</h3><p>Создай аккаунт исследователя. Верификация занимает 5 минут.</p></div>
          <div className="step reveal"><div className="step-num">02</div><h3>Выбери программу</h3><p>Изучи scope и условия. Выбери таргет, который тебе интересен.</p></div>
          <div className="step reveal"><div className="step-num">03</div><h3>Найди баг</h3><p>Тестируй системы в рамках scope. Используй любые инструменты.</p></div>
          <div className="step reveal"><div className="step-num">04</div><h3>Отправь отчёт</h3><p>Опиши уязвимость, шаги воспроизведения и влияние. Чем детальнее — тем выше оценка.</p></div>
          <div className="step reveal"><div className="step-num">05</div><h3>Получи награду</h3><p>Триадж проверяет отчёт. После подтверждения — выплата на карту или крипто-кошелёк.</p></div>
          <svg className="step-line" preserveAspectRatio="none" viewBox="0 0 1000 20"><path d="M0,10 L1000,10" stroke="url(#stepGradient)" strokeWidth="2" strokeDasharray="4 4" fill="none" /><defs><linearGradient id="stepGradient" x1="0" y1="0" x2="1000" y2="0"><stop stopColor="var(--g1)" stopOpacity="0" /><stop offset=".1" stopColor="var(--g1)" /><stop offset=".9" stopColor="var(--g2)" /><stop offset="1" stopColor="var(--g2)" stopOpacity="0" /></linearGradient></defs></svg>
        </div>
      </section>

      {/* ═══ BUSINESS SECTION ═══ */}
      <section className="business" id="business">
        <div className="business-inner reveal">
          <div className="business-text">
            <span className="section-tag">Для бизнеса</span>
            <h2 className="section-title">Защитите свой бизнес<br />до того, как это<br />сделают злоумышленники.</h2>
            <p>Запустите bug bounty программу — тысячи исследователей проверят ваши системы. Платите только за реальные уязвимости, а не за часы работы.</p>
            <ul className="business-benefits">
              <li><span className="check">✓</span> Вы сами назначаете цену</li>
              <li><span className="check">✓</span> 500+ исследователей 24/7</li>
              <li><span className="check">✓</span> Полный триадж и управление отчётами</li>
              <li><span className="check">✓</span> Каждый ваш заказ — поддержка молодых IT-талантов</li>
              <li><span className="check">✓</span> Вся работа ведётся из офиса, куда вы всегда можете приехать</li>
            </ul>
            <div className="business-actions">
              <a href="#" className="btn btn-accent btn-lg" onClick={(e) => { e.preventDefault(); setBusinessModal(true) }}>Запустить программу</a>
            </div>
          </div>
          <div className="business-visual">
            <div className="biz-card">
              <div className="biz-card-header">
                <span className="biz-tag">Программа · активна</span>
                <div className="biz-pulse"><span></span></div>
              </div>
              <div className="biz-card-body">
                <div className="biz-metric"><span>Активных исследователей</span><strong>247</strong></div>
                <div className="biz-metric"><span>Отчётов за неделю</span><strong>+89</strong></div>
                <div className="biz-metric"><span>Уязвимостей найдено</span><strong>34</strong></div>
                <div className="biz-metric"><span>Критических</span><strong style={{ color: 'var(--accent2)' }}>5</strong></div>
                <div className="biz-chart" ref={secBizChart}>
                  {barHeights.map((h, i) => (
                    <div className="bar" key={i} style={{ '--h': h }}><span></span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LEADERBOARD ═══ */}
      <section className="leaders" id="leaders">
        <div className="section-head reveal">
          <span className="section-tag">Лидерборд</span>
          <h2 className="section-title">Топ-исследователи месяца.</h2>
        </div>
        <div className="leaders-table reveal">
          <div className="leaders-row leaders-head">
            <span>#</span><span>Ник</span><span>Rанг</span><span>Баги</span><span style={{ textAlign: 'right' }}>Заработано</span>
          </div>
          <div className="leaders-row"><span className="medal gold">1</span><span>ne0n_h4wk</span><span>Legend</span><span>142</span><span className="amount">32 000 ₽</span></div>
          <div className="leaders-row"><span className="medal silver">2</span><span>kr0pt_x</span><span>Elite</span><span>98</span><span className="amount">24 000 ₽</span></div>
          <div className="leaders-row"><span className="medal bronze">3</span><span>v3nom_str1ke</span><span>Elite</span><span>87</span><span className="amount">20 000 ₽</span></div>
          <div className="leaders-row"><span>4</span><span>gh0st_w1re</span><span>Expert</span><span>76</span><span className="amount">18 000 ₽</span></div>
          <div className="leaders-row"><span>5</span><span>by7e_f4ng</span><span>Expert</span><span>64</span><span className="amount">12 000 ₽</span></div>
          <div className="leaders-row"><span>6</span><span>qu4nt_l3ak</span><span>Expert</span><span>58</span><span className="amount">10 000 ₽</span></div>
          <div className="leaders-row"><span>7</span><span>sh4d0_p1ng</span><span>Skiller</span><span>51</span><span className="amount">8 000 ₽</span></div>
          <div className="leaders-row"><span>8</span><span>r5c_dns</span><span>Skiller</span><span>47</span><span className="amount">6 000 ₽</span></div>
        </div>
      </section>

      {/* ═══ YEAR TIMER ═══ */}
      <section className="year-timer" id="yeartimer">
        <div className="yt-inner reveal">
          <span className="section-tag">ДЕНЬ РОЖДЕНИЯ ПЛАТФОРМЫ</span>
          <h3 className="yt-title">HackPark с вами уже:</h3>
          <div className="yt-display" id="ytDisplay">
            <div className="yt-unit"><strong>{yt.years}</strong><span>{yt.yearsLabel}</span></div><div className="yt-sep">·</div>
            <div className="yt-unit"><strong>{yt.days}</strong><span>{yt.daysLabel}</span></div><div className="yt-sep">·</div>
            <div className="yt-unit"><strong>{yt.hours}</strong><span>{yt.hoursLabel}</span></div><div className="yt-sep">·</div>
            <div className="yt-unit"><strong>{yt.mins}</strong><span>{yt.minsLabel}</span></div><div className="yt-sep">·</div>
            <div className="yt-unit"><strong>{yt.secs}</strong><span>{yt.secsLabel}</span></div>
          </div>
        </div>
      </section>

      {/* ═══ HACKPARK ═══ */}
      <section className="hackpark" id="hackpark">
        <div className="hackpark-inner reveal">
          <div className="hackpark-left">
            <span className="section-tag">Сообщество</span>
            <h2 className="section-title">HackPark — наше сообщество<br />безопасности из Татарстана.</h2>
            <p className="hp-sub">Мы объединяем исследователей, проводим митапы, CTF и обучающие интенсивы. Вступай в крупнейшее русскоязычное security-комьюнити.</p>
            <div className="hp-stats">
              <div className="hp-stat"><strong>50+</strong><span>участников</span></div>
              <div className="hp-stat"><strong>12</strong><span>мероприятий</span></div>
              <div className="hp-stat"><strong>2</strong><span>CTF в год</span></div>
            </div>
            <a href="#" className="btn btn-primary btn-lg" data-auth="1" onClick={handleAuth}>Участвовать →</a>
          </div>
          <div className="hackpark-visual">
            <img src={asset("/images/hackpark_transparent.png")} alt="HackPark сообщество" />
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="faq" id="faq">
        <div className="section-head reveal">
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">Частые вопросы.</h2>
        </div>
        <div className="faq-list">
          {faqData.map((item, i) => (
            <div className={`faq-item reveal ${faqOpen === i ? 'open' : ''}`} key={i}>
              <button className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                {item.q}<span className="faq-icon"></span>
              </button>
              <div className="faq-a" style={{ maxHeight: faqOpen === i ? '500px' : null }}>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="cta">
        <div className="cta-inner">
          <div className="cta-copy">
            <h2 className="reveal">Готовы начать?<br /><span className="gradient-text">Баги уже ждут вас.</span></h2>
            <p className="cta-sub reveal">Присоединяйтесь к крупнейшему сообществу security-исследователей России.</p>
            <div className="cta-actions reveal">
              <a href="#" className="btn btn-primary btn-lg" data-auth="1" onClick={handleAuth}>Участвовать →</a>
              <a href="#" className="btn btn-accent btn-lg" onClick={(e) => { e.preventDefault(); setBusinessModal(true) }}>Добавить бизнес</a>
            </div>
          </div>
<div className="robot-scene reveal" ref={secRobot} aria-label="3D laptop model">
              {mvReady ? (
                <model-viewer
                  className="robot-model"
                  src={asset("/models/laptop.glb")}
                  alt="3D laptop model"
                  camera-controls
                  auto-rotate
                  auto-rotate-delay="0"
                  rotation-per-second="24deg"
                  interaction-prompt="none"
                  shadow-intensity="0.65"
                  disable-zoom
                  exposure="1.05"
                  environment-image="neutral"
                  camera-orbit="10deg 80deg 4.5m"
                  min-camera-orbit="auto 60deg 3.0m"
                  max-camera-orbit="auto 85deg 6.0m"
                  field-of-view="30deg"
                  reveal="auto"
                  loading="lazy">
                  <div className="model-loader" slot="poster">Загрузка 3D...</div>
                </model-viewer>
              ) : (
                <div className="model-loader" aria-hidden="true">Загрузка 3D…</div>
              )}
            </div>
        </div>
      </section>

      <Footer onBusinessModal={() => setBusinessModal(true)} />

      {/* ═══ BUSINESS MODAL ═══ */}
      {businessModal && (
        <div className="modal open" id="businessModal">
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal-content modal-biz">
            <button className="modal-close" aria-label="Закрыть" onClick={closeModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            {!bizSuccess ? (
              <>
                <div className="biz-modal-header">
                  <div className="biz-modal-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-4h6v4M9 11h.01M15 11h.01M9 7h.01M15 7h.01" /></svg>
                  </div>
                  <h2>Запустить программу</h2>
                  <p className="modal-desc">Заполните бриф — мы свяжемся с вами.</p>
                </div>

                <div className="biz-benefits">
                  <div className="biz-benefit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>Платите только за баги</span>
                  </div>
                  <div className="biz-benefit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>500+ исследователей</span>
                  </div>
                </div>

                <form className="business-form" id="businessForm" noValidate onSubmit={handleBizSubmit}>
                  <div className="biz-form-row">
                    <div className="biz-field">
                      <label htmlFor="bizCompany">Название компании</label>
                      <div className="biz-input-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-4h6v4" /></svg>
                        <input type="text" id="bizCompany" placeholder="ООО «Ромашка»" value={bizForm.bizCompany} onChange={handleFieldChange} />
                      </div>
                      <span className="biz-err" data-for="bizCompany"></span>
                    </div>
                    <div className="biz-field">
                      <label htmlFor="bizName">Контактное лицо</label>
                      <div className="biz-input-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        <input type="text" id="bizName" placeholder="Иван Иванов" value={bizForm.bizName} onChange={handleFieldChange} />
                      </div>
                      <span className="biz-err" data-for="bizName"></span>
                    </div>
                  </div>

                  <div className="biz-form-row">
                    <div className="biz-field">
                      <label htmlFor="bizPhone">Телефон</label>
                      <div className="biz-input-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        <input type="tel" id="bizPhone" placeholder="+7 (___) ___-__-__" value={bizForm.bizPhone} onChange={handleFieldChange} />
                      </div>
                      <span className="biz-err" data-for="bizPhone"></span>
                    </div>
                    <div className="biz-field">
                      <label htmlFor="bizEmail">Email</label>
                      <div className="biz-input-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                        <input type="email" id="bizEmail" placeholder="ivan@company.ru" value={bizForm.bizEmail} onChange={handleFieldChange} />
                      </div>
                      <span className="biz-err" data-for="bizEmail"></span>
                    </div>
                  </div>

                  <div className="biz-form-row">
                    <div className="biz-field">
                      <label htmlFor="bizSize">Размер компании</label>
                      <div className="biz-input-wrap biz-select-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        <select id="bizSize" value={bizForm.bizSize} onChange={handleFieldChange}>
                          <option value="">Выберите...</option>
                          <option>1–50 сотрудников</option>
                          <option>50–250 сотрудников</option>
                          <option>250–1000 сотрудников</option>
                          <option>1000+ сотрудников</option>
                        </select>
                        <svg className="biz-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                      <span className="biz-err" data-for="bizSize"></span>
                    </div>
                    <div className="biz-field">
                      <label htmlFor="bizScope">Что тестируем?</label>
                      <div className="biz-input-wrap biz-select-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        <select id="bizScope" value={bizForm.bizScope} onChange={handleFieldChange}>
                          <option value="">Выберите...</option>
                          <option>Web-приложения</option>
                          <option>Мобильные приложения</option>
                          <option>API</option>
                          <option>Инфраструктура</option>
                          <option>Смарт-контракты / Web3</option>
                          <option>Всё вышеперечисленное</option>
                        </select>
                        <svg className="biz-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                      <span className="biz-err" data-for="bizScope"></span>
                    </div>
                  </div>

                  <div className="biz-field">
                    <label htmlFor="bizComment">Комментарий <span className="biz-optional">необязательно</span></label>
                    <textarea id="bizComment" placeholder="Опишите задачу или вопрос..." value={bizForm.bizComment} onChange={handleFieldChange}></textarea>
                  </div>

                  <label className="consent biz-consent">
                    <input type="checkbox" id="bizConsent" checked={bizForm.bizConsent} onChange={handleFieldChange} />
                    <span className="biz-checkmark"></span>
                    <span>Согласен на обработку персональных данных</span>
                  </label>
                  <span className="biz-err" data-for="bizConsent"></span>

                  <span className="biz-err biz-err-center" id="bizFormError"></span>
                  <button type="submit" className="btn btn-accent btn-lg btn-full biz-submit-btn" id="bizSubmitBtn">
                    <span className="biz-btn-text">Отправить заявку</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="biz-success" id="bizSuccess">
                <div className="biz-success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h2>Заявка отправлена</h2>
                <p className="modal-desc">Мы свяжемся с вами в течение 1 рабочего дня и пригласим на переговоры в офис HackPark в Казани.</p>
                <div className="biz-success-steps">
                  <div className="biz-success-step">
                    <span className="biz-success-num">1</span>
                    <span>Мы свяжемся с вами</span>
                  </div>
                  <div className="biz-success-step">
                    <span className="biz-success-num">2</span>
                    <span>Переговоры в офисе</span>
                  </div>
                  <div className="biz-success-step">
                    <span className="biz-success-num">3</span>
                    <span>Договор и запуск</span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-lg btn-full" onClick={closeModal}>Понятно</button>
              </div>
            )}

            <div className="biz-contact-note" id="bizContactNote">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>Коворкинг HackPark · Казань</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
