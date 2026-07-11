import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import '../styles/about.css'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function AboutPage() {
  useDocumentTitle('О HackPark — Bug Bounty платформа')
  const navigate = useNavigate()
  const [businessModal, setBusinessModal] = useState(false)
  const [bizSuccess, setBizSuccess] = useState(false)
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

  const bizFormErrorRef = useRef(null)

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
    return () => observer.disconnect()
  }, [])

  // ===== Close modal on Escape =====
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // ===== Auth gate for Участвовать buttons =====
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

  const closeModal = () => {
    setBusinessModal(false)
    setTimeout(() => setBizSuccess(false), 300)
  }

  const openModal = () => setBusinessModal(true)

  const handleBizField = (e) => {
    const { id, type, value, checked } = e.target
    setBizForm((p) => ({ ...p, [id]: type === 'checkbox' ? checked : value }))
  }

  const handleBizSubmit = (e) => {
    e.preventDefault()
    // validation could go here
    setBizSuccess(true)
  }

  return (
    <>
      <Nav scrolled onBusinessModal={openModal} />

      {/* ═══ HERO ═══ */}
      <header className="about-hero">
        <div className="about-hero-grid"></div>
        <div className="about-hero-content">
          <div className="about-hero-badge reveal">
            <span className="pulse"></span>
            <span>Платформа работает · 2026</span>
            <span className="itpark-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              При поддержке IT-Park
            </span>
          </div>
          <h1 className="about-hero-title reveal">Хак-парк — это больше,<br/><span className="gradient-text">чем просто платформа.</span></h1>
          <p className="about-hero-sub reveal">Мы объединяем специалистов и начинающих экспертов в сфере информационной безопасности. Развиваем таланты, формируем сообщество и создаём условия для практического обучения.</p>
        </div>
      </header>

      {/* ═══ SECTION 1: Who we are + photo 1 ═══ */}
      <section className="about-section">
        <div className="about-inner">
          <div className="about-text reveal">
            <span className="about-tag">Кто мы</span>
            <h2 className="about-heading">Платформа при поддержке IT-Park</h2>
            <div className="about-text-body">
              <p>Хак-парк — это платформа, созданная <strong>при поддержке IT-Park</strong>, которая объединяет специалистов и начинающих экспертов в сфере информационной безопасности.</p>
              <p>Мы находимся в <strong>самом сердце Казани</strong>. Каждый специалист, независимо от уровня подготовки, может стать участником Хак-парка и бесплатно пользоваться нашим коворкингом.</p>
              <p>Здесь участники обучаются, обмениваются опытом, работают над реальными задачами и принимают участие в программе bug bounty в офлайн-формате.</p>
            </div>
          </div>
          <div className="about-visual reveal">
            <div className="about-photo-frame">
              <img src="/images/hp-photo-1.png" alt="Коворкинг HackPark в Казани" loading="lazy"/>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: Mission + photo 2 ═══ */}
      <section className="about-section alt">
        <div className="about-inner reverse">
          <div className="about-text reveal">
            <span className="about-tag">Наша миссия</span>
            <h2 className="about-heading">Развиваем молодые таланты</h2>
            <div className="about-text-body">
              <p>Наша миссия — <strong>развивать молодые таланты</strong>, формировать профессиональное сообщество и создавать условия для практического обучения.</p>
              <p>Мы проводим <strong>CTF-соревнования</strong>, образовательные мероприятия и другие активности, направленные на развитие навыков в области кибербезопасности.</p>
            </div>
          </div>
          <div className="about-visual reveal">
            <div className="about-photo-frame">
              <img src="/images/hp-photo-2.jpeg" alt="Образовательное мероприятие HackPark" loading="lazy"/>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS STRIP ═══ */}
      <section className="about-stats">
        <div className="about-stats-inner">
          <div className="about-stat reveal">
            <div className="about-stat-num">50+</div>
            <div className="about-stat-label">Участников</div>
          </div>
          <div className="about-stat reveal">
            <div className="about-stat-num">12</div>
            <div className="about-stat-label">Мероприятий</div>
          </div>
          <div className="about-stat reveal">
            <div className="about-stat-num">2</div>
            <div className="about-stat-label">CTF в год</div>
          </div>
          <div className="about-stat reveal">
            <div className="about-stat-num">24/7</div>
            <div className="about-stat-label">Доступ к коворкингу</div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: For business + photo 3 ═══ */}
      <section className="about-section">
        <div className="about-inner">
          <div className="about-text reveal">
            <span className="about-tag">Для бизнеса</span>
            <h2 className="about-heading">Открыты для компаний всей России</h2>
            <div className="about-text-body">
              <p>Платформа открыта для <strong>компаний и организаций со всей России</strong>. Любой бизнес может разместить свою программу тестирования безопасности.</p>
              <p>Вы самостоятельно определяете размер вознаграждений и получаете <strong>независимую оценку защищённости</strong> своих информационных систем.</p>
              <p>Такой подход позволяет эффективно использовать бюджет на информационную безопасность, своевременно выявлять уязвимости и одновременно предоставлять участникам возможность получать практический опыт на реальных проектах.</p>
            </div>
          </div>
          <div className="about-visual reveal">
            <div className="about-photo-frame">
              <img src="/images/hp-photo-3.jpeg" alt="Работа над реальными проектами HackPark" loading="lazy"/>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ AMBASSADOR: IT-Park + photo 4 ═══ */}
      <section className="about-ambassador">
        <div className="about-ambassador-inner">
          <div className="about-ambassador-badge reveal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Амбассадоры IT-Park
          </div>
          <h2 className="about-ambassador-title reveal">Мы — официальные амбассадоры IT-Park</h2>
          <p className="about-ambassador-sub reveal">HackPark является официальным амбассадором IT-Park. Наша задача — продвигать технологическое образование и развивать сообщество специалистов по кибербезопасности в Татарстане и по всей России.</p>
          <div className="about-ambassador-photo reveal">
            <img src="/images/hp-photo-4.png" alt="HackPark — амбассадоры IT-Park" loading="lazy"/>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="about-cta">
        <div className="about-cta-inner">
          <h2 className="reveal">Готовы стать частью<br/><span className="gradient-text">сообщества HackPark?</span></h2>
          <p className="reveal">Присоединяйтесь к нам в Казани или запустите программу тестирования для вашего бизнеса.</p>
          <div className="about-cta-actions reveal">
            <Link to="/login" className="btn btn-primary btn-lg" data-auth="1" onClick={handleAuth}>Участвовать →</Link>
            <Link to="/" className="btn btn-ghost btn-lg">На главную</Link>
          </div>
        </div>
      </section>

      <Footer onBusinessModal={openModal} />

      {/* ═══ BUSINESS MODAL ═══ */}
      {businessModal && (
        <div className="modal open" id="businessModal">
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal-content modal-biz">
            <button className="modal-close" aria-label="Закрыть" onClick={closeModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            {!bizSuccess ? (
              <>
                {/* Header */}
                <div className="biz-modal-header">
                  <div className="biz-modal-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-4h6v4M9 11h.01M15 11h.01M9 7h.01M15 7h.01"/></svg>
                  </div>
                  <h2>Запустить программу</h2>
                  <p className="modal-desc">Заполните бриф — мы свяжемся с вами.</p>
                </div>

                {/* Benefits row */}
                <div className="biz-benefits">
                  <div className="biz-benefit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>Платите только за баги</span>
                  </div>
                  <div className="biz-benefit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>500+ исследователей</span>
                  </div>
                </div>

                {/* Form */}
                <form className="business-form" id="businessForm" noValidate onSubmit={handleBizSubmit}>
                  <div className="biz-form-row">
                    <div className="biz-field">
                      <label htmlFor="bizCompany">Название компании</label>
                      <div className="biz-input-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-4h6v4"/></svg>
                        <input type="text" id="bizCompany" placeholder="ООО «Ромашка»" value={bizForm.bizCompany} onChange={handleBizField}/>
                      </div>
                      <span className="biz-err" data-for="bizCompany"></span>
                    </div>
                    <div className="biz-field">
                      <label htmlFor="bizName">Контактное лицо</label>
                      <div className="biz-input-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <input type="text" id="bizName" placeholder="Иван Иванов" value={bizForm.bizName} onChange={handleBizField}/>
                      </div>
                      <span className="biz-err" data-for="bizName"></span>
                    </div>
                  </div>

                  <div className="biz-form-row">
                    <div className="biz-field">
                      <label htmlFor="bizPhone">Телефон</label>
                      <div className="biz-input-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        <input type="tel" id="bizPhone" placeholder="+7 (___) ___-__-__" value={bizForm.bizPhone} onChange={handleBizField}/>
                      </div>
                      <span className="biz-err" data-for="bizPhone"></span>
                    </div>
                    <div className="biz-field">
                      <label htmlFor="bizEmail">Email</label>
                      <div className="biz-input-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <input type="email" id="bizEmail" placeholder="ivan@company.ru" value={bizForm.bizEmail} onChange={handleBizField}/>
                      </div>
                      <span className="biz-err" data-for="bizEmail"></span>
                    </div>
                  </div>

                  <div className="biz-form-row">
                    <div className="biz-field">
                      <label htmlFor="bizSize">Размер компании</label>
                      <div className="biz-input-wrap biz-select-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        <select id="bizSize" value={bizForm.bizSize} onChange={handleBizField}>
                          <option value="">Выберите...</option>
                          <option>1–50 сотрудников</option>
                          <option>50–250 сотрудников</option>
                          <option>250–1000 сотрудников</option>
                          <option>1000+ сотрудников</option>
                        </select>
                        <svg className="biz-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      <span className="biz-err" data-for="bizSize"></span>
                    </div>
                    <div className="biz-field">
                      <label htmlFor="bizScope">Что тестируем?</label>
                      <div className="biz-input-wrap biz-select-wrap">
                        <svg className="biz-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <select id="bizScope" value={bizForm.bizScope} onChange={handleBizField}>
                          <option value="">Выберите...</option>
                          <option>Web-приложения</option>
                          <option>Мобильные приложения</option>
                          <option>API</option>
                          <option>Инфраструктура</option>
                          <option>Смарт-контракты / Web3</option>
                          <option>Всё вышеперечисленное</option>
                        </select>
                        <svg className="biz-select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      <span className="biz-err" data-for="bizScope"></span>
                    </div>
                  </div>

                  <div className="biz-field">
                    <label htmlFor="bizComment">Комментарий <span className="biz-optional">необязательно</span></label>
                    <textarea id="bizComment" placeholder="Опишите задачу или вопрос..." value={bizForm.bizComment} onChange={handleBizField}></textarea>
                  </div>

                  <label className="consent biz-consent">
                    <input type="checkbox" id="bizConsent" checked={bizForm.bizConsent} onChange={handleBizField}/>
                    <span className="biz-checkmark"></span>
                    <span>Согласен на обработку персональных данных</span>
                  </label>
                  <span className="biz-err" data-for="bizConsent"></span>

                  <span className="biz-err biz-err-center" id="bizFormError" ref={bizFormErrorRef}></span>
                  <button type="submit" className="btn btn-accent btn-lg btn-full biz-submit-btn" id="bizSubmitBtn">
                    <span className="biz-btn-text">Отправить заявку</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="biz-success" id="bizSuccess">
                <div className="biz-success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
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

            {/* Footer note */}
            <div className="biz-contact-note" id="bizContactNote">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Коворкинг HackPark · Казань</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
