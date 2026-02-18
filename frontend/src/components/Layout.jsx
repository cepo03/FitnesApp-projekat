import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Layout.css'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="header-logo">FitnesApp</Link>
        <nav className="header-nav">
          {user ? (
            <>
              <Link
                to="/planovi"
                className={`header-link ${location.pathname === '/planovi' ? 'active' : ''}`}
              >
                Planovi
              </Link>
              <Link
                to="/napredak"
                className={`header-link ${location.pathname === '/napredak' ? 'active' : ''}`}
              >
                Napredak
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`header-link ${location.pathname === '/login' ? 'active' : ''}`}
              >
                Prijava
              </Link>
              <Link
                to="/register"
                className={`header-link ${location.pathname === '/register' ? 'active' : ''}`}
              >
                Registracija
              </Link>
            </>
          )}
        </nav>
        <div className="header-user">
          {user ? (
            <>
              <span className="header-username">{user.username}</span>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Odjavi se
              </button>
            </>
          ) : null}
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}
