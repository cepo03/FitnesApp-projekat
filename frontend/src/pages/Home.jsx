import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="home">
      <header className="home-hero">
        <h1 className="home-title">FitnesApp</h1>
        <p className="home-tagline">Tvoj plan. Tvoj napredak. Jedna aplikacija.</p>
        <p className="home-desc">
          FitnesApp ti pomaže da kreiraš planove treninga, dodaješ vežbe (serije i ponavljanja),
          pratiš redovnost kroz kalendar i vidiš koliko si dana ostvario u mesecu i ukupno.
          Uloguj se i kreni odmah.
        </p>
        <div className="home-actions">
          {user ? (
            <>
              <Link to="/planovi" className="btn btn-primary home-btn">Planovi</Link>
              <Link to="/napredak" className="btn btn-primary home-btn">Napredak</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary home-btn">Prijava</Link>
              <Link to="/register" className="btn btn-ghost home-btn">Registracija</Link>
            </>
          )}
        </div>
      </header>
      <section className="home-features">
        <div className="feature-card">
          <span className="feature-icon">📋</span>
          <h3>Planovi treninga</h3>
          <p>Kreiraj plan sa nazivom, opisom i trajanjem u mesecima. Dodaj vežbe sa serijama i ponavljanjima. Sve možeš da menjaš i brišeš.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📅</span>
          <h3>Napredak</h3>
          <p>Označavaj dane kada si trenirao u kalendaru. Prati ukupan broj treninga i broj u tekućem mesecu.</p>
        </div>
      </section>
    </div>
  )
}
