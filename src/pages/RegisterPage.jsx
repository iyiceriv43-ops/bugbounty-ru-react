import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { asset } from '../utils/assets.js'

// ── Russian phone helpers (ported from auth.js) ──────────────
function normalizePhone(raw) {
  if (!raw) return ''
  let p = raw.replace(/[\s\-().]/g, '').replace(/\+/g, '')
  return p
}

function isValidRuPhone(raw) {
  const p = normalizePhone(raw)
  if (!p) return false
  if (!/^7\d{10}$|^8\d{10}$/.test(p)) return false
  const core = p.slice(1)
  const isMobile = /^9\d{2}/.test(core)
  const isLandline = /^(3\d{2}|4\d{2}|49\d|8\d{2})/.test(core)
  return isMobile || isLandline
}

function formatPhoneInput(input) {
  let digits = input.replace(/\D/g, '')
  if (digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (digits.startsWith('7')) {
    let f = '+7'
    if (digits.length > 1) f += ' (' + digits.slice(1, 4)
    if (digits.length >= 5) f += ') ' + digits.slice(4, 7)
    if (digits.length >= 8) f += '-' + digits.slice(7, 9)
    if (digits.length >= 10) f += '-' + digits.slice(9, 11)
    return f
  }
  if (digits.length === 0) return ''
  return input
}

// ── Russian / allowed email domains ───────────────────────────
const RU_EMAIL_DOMAINS = [
  'yandex.ru', 'yandex.com', 'ya.ru',
  'mail.ru', 'bk.ru', 'list.ru', 'inbox.ru', 'internet.ru',
  'rambler.ru', 'lenta.ru', 'autorambler.ru', 'myrambler.ru',
  'ro.ru', 'qip.ru', 'pochta.ru',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(raw) {
  if (!raw) return false
  const email = raw.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) return false
  const domain = email.split('@')[1]
  if (!domain) return false
  return RU_EMAIL_DOMAINS.includes(domain)
}

// ── Telegram username validation ─────────────────────────────
const TG_RE = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/

// ── Password strength (same as auth.js) ───────────────────────
function passwordScore(pw) {
  let score = 0
  if (!pw) return 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw)) score++
  if (/[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  return Math.min(score, 4)
}

const STRENGTH_LABELS = ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Надёжный']
const STRENGTH_CLASSES = ['weak', 'weak', 'medium', 'good', 'strong']

export default function RegisterPage() {
  useDocumentTitle('Регистрация — HackPark')
  const { register } = useAuth()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    telegram: '',
    password: '',
    passwordConfirm: '',
    consent: false,
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  const [registered, setRegistered] = useState(false)
  const [authKey, setAuthKey] = useState('')

  const setFieldError = (field, msg) =>
    setErrors((prev) => ({ ...prev, [field]: msg }))
  const clearFieldError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: '' }))

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }))
      clearFieldError(name)
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
    clearFieldError(name)
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneInput(e.target.value)
    setForm((prev) => ({ ...prev, phone: formatted }))
    clearFieldError('phone')
  }

  const handleEmailChange = (e) => {
    const v = e.target.value.trim().toLowerCase()
    setForm((prev) => ({ ...prev, email: v }))
    clearFieldError('email')
  }

  const handleTelegramChange = (e) => {
    const v = e.target.value.replace(/^@+/, '').replace(/\s/g, '')
    setForm((prev) => ({ ...prev, telegram: v }))
    clearFieldError('telegram')
  }

  const handlePasswordChange = (e) => {
    setForm((prev) => ({ ...prev, password: e.target.value }))
    clearFieldError('password')
  }

  const passwordScoreVal = passwordScore(form.password)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrors({})
    setFormError('')

    let valid = true
    let firstErrorField = null

    // Name
    if (!form.name || form.name.length < 3) {
      setFieldError('name', 'Введите имя и фамилию (минимум 3 символа)')
      if (!firstErrorField) firstErrorField = 'name'
      valid = false
    }

    // Phone — Russian only
    if (!form.phone) {
      setFieldError('phone', 'Введите российский номер телефона')
      if (!firstErrorField) firstErrorField = 'phone'
      valid = false
    } else if (!isValidRuPhone(form.phone)) {
      const digits = normalizePhone(form.phone)
      if (digits && digits.length > 0 && !digits.startsWith('7') && !digits.startsWith('8')) {
        setFieldError('phone', 'Регистрация доступна только с российскими номерами (+7 или 8)')
      } else {
        setFieldError('phone', 'Неверный формат российского номера. Пример: +7 (999) 123-45-67')
      }
      if (!firstErrorField) firstErrorField = 'phone'
      valid = false
    }

    // Email — Russian domains only
    if (!form.email) {
      setFieldError('email', 'Введите email')
      if (!firstErrorField) firstErrorField = 'email'
      valid = false
    } else if (!isValidEmail(form.email)) {
      if (!EMAIL_RE.test(form.email)) {
        setFieldError('email', 'Неверный формат email')
      } else {
        const domain = form.email.split('@')[1]
        setFieldError('email', 'Домен "' + domain + '" не разрешён. Используйте: yandex.ru, mail.ru, bk.ru, list.ru, rambler.ru и др.')
      }
      if (!firstErrorField) firstErrorField = 'email'
      valid = false
    }

    // Telegram
    if (!form.telegram) {
      setFieldError('telegram', 'Введите ваш Telegram-username')
      if (!firstErrorField) firstErrorField = 'telegram'
      valid = false
    } else if (!TG_RE.test(form.telegram)) {
      if (form.telegram.length < 5) {
        setFieldError('telegram', 'Telegram-username должен быть не короче 5 символов')
      } else if (form.telegram.length > 32) {
        setFieldError('telegram', 'Telegram-username должен быть не длиннее 32 символов')
      } else if (/^[^a-zA-Z]/.test(form.telegram)) {
        setFieldError('telegram', 'Telegram-username должен начинаться с буквы')
      } else {
        setFieldError('telegram', 'Только латинские буквы, цифры и _')
      }
      if (!firstErrorField) firstErrorField = 'telegram'
      valid = false
    }

    // Password
    if (!form.password) {
      setFieldError('password', 'Введите пароль')
      if (!firstErrorField) firstErrorField = 'password'
      valid = false
    } else if (form.password.length < 8) {
      setFieldError('password', 'Пароль должен быть не короче 8 символов')
      if (!firstErrorField) firstErrorField = 'password'
      valid = false
    }

    // Password confirm
    if (!form.passwordConfirm) {
      setFieldError('passwordConfirm', 'Повторите пароль')
      if (!firstErrorField) firstErrorField = 'passwordConfirm'
      valid = false
    } else if (form.password !== form.passwordConfirm) {
      setFieldError('passwordConfirm', 'Пароли не совпадают')
      if (!firstErrorField) firstErrorField = 'passwordConfirm'
      valid = false
    }

    // Consent
    if (!form.consent) {
      setFieldError('consent', 'Необходимо согласие на обработку персональных данных')
      if (!firstErrorField) firstErrorField = 'consent'
      valid = false
    }

    if (!valid) return

    const result = register({
      name: form.name,
      phone: form.phone,
      email: form.email,
      telegram: form.telegram,
      password: form.password,
    })

    if (!result.ok) {
      setFormError(result.error || 'Ошибка регистрации')
      return
    }

    setAuthKey(result.authKey)
    setRegistered(true)
  }

  return (
    <>
      <Nav scrolled={true} />

      {/* ═══ AUTH PAGE ═══ */}
      <main className="auth-page">
        <div className="auth-card auth-card-wide">
          <Link to="/" className="auth-back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> На главную</Link>

          <div className="auth-logo">
            <img src={asset("/images/hp-logo-sm.png")} alt="HackPark"/>
            <span>HackPark</span>
          </div>

          <h1 className="auth-title">Регистрация исследователя</h1>
          <p className="auth-subtitle">Регистрация доступна только для участников оффлайн-офиса HackPark</p>

          {/* Step indicator */}
          <div className="auth-steps">
            <div className={`auth-step ${registered ? 'done' : 'active'}`}><span className="step-num">1</span><span className="step-label">Данные</span></div>
            <div className="auth-step-line"></div>
            <div className={`auth-step ${registered ? 'active' : ''}`}><span className="step-num">2</span><span className="step-label">Подтверждение</span></div>
          </div>

          {/* ═══ STEP 1: Registration Form ═══ */}
          {!registered && (
            <form className="auth-form" noValidate onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="regName">Имя и фамилия <span className="req">*</span></label>
                <input type="text" id="regName" name="name" placeholder="Иван Иванов" autoComplete="name" value={form.name} onChange={handleChange}/>
                <span className="field-error">{errors.name || ''}</span>
              </div>

              <div className="form-field">
                <label htmlFor="regPhone">Российский номер телефона <span className="req">*</span></label>
                <input type="tel" id="regPhone" name="phone" placeholder="+7 (XXX) XXX-XX-XX" autoComplete="tel" value={form.phone} onChange={handlePhoneChange}/>
                <span className="field-hint">Формат: +7, 8 или +8 — только российские номера</span>
                <span className="field-error">{errors.phone || ''}</span>
              </div>

              <div className="form-field">
                <label htmlFor="regEmail">Российская почта <span className="req">*</span></label>
                <input type="email" id="regEmail" name="email" placeholder="ivan@yandex.ru" autoComplete="email" value={form.email} onChange={handleEmailChange}/>
                <span className="field-hint">Допустимые домены: yandex.ru, mail.ru, bk.ru, list.ru, inbox.ru, rambler.ru, internet.ru и др. (только российские)</span>
                <span className="field-error">{errors.email || ''}</span>
              </div>

              <div className="form-field">
                <label htmlFor="regTelegram">Telegram <span className="req">*</span></label>
                <div className="input-prefix">
                  <span className="input-prefix-label">@</span>
                  <input type="text" id="regTelegram" name="telegram" placeholder="username" autoComplete="username" value={form.telegram} onChange={handleTelegramChange}/>
                </div>
                <span className="field-hint">Ваш Telegram-username без @</span>
                <span className="field-error">{errors.telegram || ''}</span>
              </div>

              <div className="form-field">
                <label htmlFor="regPassword">Пароль <span className="req">*</span></label>
                <div className="password-wrap">
                  <input type={showPassword ? 'text' : 'password'} id="regPassword" name="password" placeholder="Минимум 8 символов" autoComplete="new-password" value={form.password} onChange={handlePasswordChange}/>
                  <button type="button" className="password-toggle" aria-label="Показать пароль" onClick={() => setShowPassword(!showPassword)}>
                    <svg className="pw-icon-show" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                <div className="password-strength">
                  <div className="strength-bar"><div className={`strength-fill ${form.password ? STRENGTH_CLASSES[passwordScoreVal] : ''}`} style={{ width: (form.password ? passwordScoreVal * 25 : 0) + '%' }}></div></div>
                  <span className="strength-label">{form.password ? STRENGTH_LABELS[passwordScoreVal] : 'Надёжность пароля'}</span>
                </div>
                <span className="field-error">{errors.password || ''}</span>
              </div>

              <div className="form-field">
                <label htmlFor="regPasswordConfirm">Повторите пароль <span className="req">*</span></label>
                <div className="password-wrap">
                  <input type={showPasswordConfirm ? 'text' : 'password'} id="regPasswordConfirm" name="passwordConfirm" placeholder="••••••••" autoComplete="new-password" value={form.passwordConfirm} onChange={handleChange}/>
                  <button type="button" className="password-toggle" aria-label="Показать пароль" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                    <svg className="pw-icon-show" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                <span className="field-error">{errors.passwordConfirm || ''}</span>
              </div>

              <label className="consent">
                <input type="checkbox" id="regConsent" name="consent" checked={form.consent} onChange={handleChange}/>
                <span>Согласен на обработку персональных данных и с <a href="#" className="auth-link">политикой конфиденциальности</a></span>
              </label>
              <span className="field-error">{errors.consent || ''}</span>

              <span className="form-error">{formError || ''}</span>
              <button type="submit" className="btn btn-primary btn-lg btn-full">Отправить заявку →</button>
            </form>
          )}

          {/* ═══ STEP 2: Pending Confirmation ═══ */}
          {registered && (
            <div className="auth-pending">
              <div className="auth-pending-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <h2>Заявка отправлена</h2>
              <p className="auth-subtitle">Ваша заявка на регистрацию получена и передана на проверку администратору.</p>

              <div className="auth-pending-info">
                <div className="pending-info-row"><span>Имя:</span><strong>{form.name}</strong></div>
                <div className="pending-info-row"><span>Телефон:</span><strong>{form.phone}</strong></div>
                <div className="pending-info-row"><span>Email:</span><strong>{form.email}</strong></div>
                <div className="pending-info-row"><span>Telegram:</span><strong>{'@' + form.telegram}</strong></div>

              </div>

              <div className="auth-pending-status">
                <span className="status-badge status-pending">Ожидает подтверждения</span>
              </div>

              <div className="auth-note">
                <span className="auth-note-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg></span>
                <p>Регистрация подтверждается вручную. После подтверждения администратор отправит вам ключ участника в Telegram в течение 1–2 рабочих дней. Используйте полученный ключ для входа на платформу.</p>
              </div>

              <Link to="/" className="btn btn-ghost btn-lg btn-full">Вернуться на главную</Link>
            </div>
          )}

          <div className="auth-divider"><span>или</span></div>

          <p className="auth-switch">Уже зарегистрированы? <Link to="/login" className="auth-link-strong">Войти</Link></p>
        </div>
      </main>

      <Footer />
    </>
  )
}
