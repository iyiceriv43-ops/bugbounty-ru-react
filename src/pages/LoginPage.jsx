import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Nav from '../components/Nav.jsx'
import Footer from '../components/Footer.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

export default function LoginPage() {
  useDocumentTitle('Вход — HackPark')
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    loginContact: '',
    loginPassword: '',
    loginCode: '',
    rememberMe: false,
  })
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Redirect target from URL query
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')

    const result = login(form.loginCode.trim())
    if (!result.ok) {
      setError(result.error)
      return
    }

    setError('')
    navigate(redirect || '/dashboard')
  }

  return (
    <>
      <Nav scrolled={true} />

      {/* ═══ AUTH PAGE ═══ */}
      <main className="auth-page">
        <div className="auth-card">
          <Link to="/" className="auth-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg> На главную
          </Link>
          <div className="auth-logo">
            <img src="/images/hp-logo-sm.png" alt="HackPark"/>
            <span>HackPark</span>
          </div>
          <h1 className="auth-title">Вход в платформу</h1>
          <p className="auth-subtitle">Войдите, чтобы продолжить исследования</p>

          <form className="auth-form" noValidate onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="loginContact">Телефон или email</label>
              <input type="text" id="loginContact" name="loginContact" placeholder="+7 (XXX) XXX-XX-XX или email" autoComplete="username" value={form.loginContact} onChange={handleChange}/>
              <span className="field-error" data-for="loginContact"></span>
            </div>

            <div className="form-field">
              <label htmlFor="loginPassword">Пароль</label>
              <div className="password-wrap">
                <input type={showPassword ? 'text' : 'password'} id="loginPassword" name="loginPassword" placeholder="••••••••" autoComplete="current-password" value={form.loginPassword} onChange={handleChange}/>
                <button type="button" className="password-toggle" aria-label="Показать пароль" onClick={() => setShowPassword(!showPassword)}>
                  <svg className="pw-icon-show" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <span className="field-error" data-for="loginPassword"></span>
            </div>

            <div className="form-field">
              <label htmlFor="loginCode">Код участника HackPark <span className="req">*</span></label>
              <input type="text" id="loginCode" name="loginCode" placeholder="HP-XXXX-XXXX" autoComplete="off" maxLength={14} value={form.loginCode} onChange={handleChange}/>
              <span className="field-hint">Ключ участника генерируется при регистрации и активируется администратором.</span>
              <span className="field-error" data-for="loginCode"></span>
            </div>

            <div className="form-row-between">
              <label className="consent">
                <input type="checkbox" id="rememberMe" name="rememberMe" checked={form.rememberMe} onChange={handleChange}/> Запомнить меня
              </label>
              <Link to="#" className="auth-link" id="forgotPassword" onClick={(e) => {
                e.preventDefault()
                alert('Для восстановления доступа обратитесь к администратору HackPark в Telegram.')
              }}>Забыли пароль?</Link>
            </div>

            <span className="form-error" id="loginFormError">{error}</span>
            <button type="submit" className="btn btn-primary btn-lg btn-full">Войти →</button>
          </form>

          <div className="auth-divider"><span>или</span></div>

          <p className="auth-switch">Нет аккаунта? <Link to="/register" className="auth-link-strong">Создать</Link></p>

          <div className="auth-note">
            <span className="auth-note-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <p>Вход доступен только подтверждённым участникам HackPark. Введите ключ, полученный при регистрации. Если ваша заявка ещё на проверке — дождитесь подтверждения от администратора.</p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
