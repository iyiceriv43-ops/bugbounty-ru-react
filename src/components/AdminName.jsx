/**
 * Renders a user name with admin styling (red + shield icon) when role === 'admin'.
 * Otherwise renders the plain name.
 *
 * Props:
 *   name     — display name to show
 *   role     — user's role string ('admin' triggers highlight)
 *   authKey  — (optional) if role is unknown, looks it up from localStorage users
 */
import { getUsers } from '../context/AuthContext.jsx'

export function roleForAuthKey(authKey) {
  if (!authKey) return 'user'
  const u = getUsers().find(x => x.authKey === authKey)
  return u?.role || 'user'
}

export default function AdminName({ name, role, authKey }) {
  const r = role || roleForAuthKey(authKey)
  if (r !== 'admin') return <>{name}</>
  return (
    <span className="admin-name">
      <svg className="admin-name-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2L4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z" />
      </svg>
      {name}
    </span>
  )
}