// ── API fetch wrapper with JWT ───────────────────────
// Reads the stored JWT and attaches it as Bearer token to every request.

const TOKEN_KEY = 'hackpark_jwt'
const USER_KEY = 'hackpark_user'

// In dev, Vite proxies /api → http://127.0.0.1:8000 (see vite.config.js).
// In production (GitHub Pages), set VITE_API_URL to the backend's public URL.
const API_BASE = import.meta.env.VITE_API_URL || ''

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Low-level API call with automatic Authorization header.
 * Returns parsed JSON or throws { detail } on error.
 */
export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
    const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const err = new Error((data && data.detail) || `HTTP ${res.status}`)
    err.status = res.status
    err.detail = (data && data.detail) || `HTTP ${res.status}`
    throw err
  }
  return data
}

// ── Auth helpers ─────────────────────────────────────

export async function apiLogin(email, password, authKey) {
  const data = await api('/api/auth/login', {
    method: 'POST',
    body: { email, password, auth_key: authKey },
    auth: false,
  })
  setToken(data.access_token)
  setStoredUser(data.user)
  return data.user
}

export async function apiRegister(payload) {
  // Register returns { message } — no token, no auth_key
  // The auth_key is sent to the user by admin via Telegram after approval
  return api('/api/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export async function apiMe() {
  return api('/api/auth/me')
}