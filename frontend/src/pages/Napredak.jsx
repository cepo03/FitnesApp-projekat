import React, { useState, useEffect } from 'react'
import { getProgressDays, markProgressDay, unmarkProgressDay, getProgressStats } from '../api'
import './Napredak.css'

const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
const DOW = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub']

export default function Napredak() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [days, setDays] = useState([])
  const [stats, setStats] = useState({ total_days: 0, this_month: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    Promise.all([
      getProgressDays(year, month + 1),
      getProgressStats()
    ])
      .then(([d, s]) => {
        setDays(d)
        setStats(s)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [year, month])

  const markedSet = new Set(days.map((d) => d.day_date))

  function prevMonth() {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  function getDaysInMonth() {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const startPad = first.getDay()
    const total = last.getDate()
    const cells = []
    for (let i = 0; i < startPad; i++) cells.push(null)
    for (let d = 1; d <= total; d++) cells.push(d)
    return cells
  }

  function dateKey(d) {
    const m = (month + 1).toString().padStart(2, '0')
    const day = d.toString().padStart(2, '0')
    return `${year}-${m}-${day}`
  }

  function isFuture(d) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cellDate = new Date(year, month, d)
    return cellDate > today
  }

  function toggleDay(d) {
    if (!d) return
    const key = dateKey(d)
    if (isFuture(d)) return
    if (markedSet.has(key)) {
      unmarkProgressDay(key).then(load).catch((e) => setError(e.message))
    } else {
      markProgressDay(key).then(load).catch((e) => setError(e.message))
    }
  }

  const cells = getDaysInMonth()

  if (loading && days.length === 0) return <div className="page-loading">Učitavanje napretka...</div>

  return (
    <div className="napredak-page">
      <h1>Napredak</h1>
      {error && (
        <div className="planovi-error" onClick={() => setError('')}>
          {error}
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{stats.total_days}</span>
          <span className="stat-label">Ukupno treninga</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-value">{stats.this_month}</span>
          <span className="stat-label">Ovaj mesec</span>
        </div>
      </div>

      <div className="calendar-wrap">
        <div className="calendar-nav">
          <button type="button" className="btn btn-ghost btn-sm" onClick={prevMonth}>←</button>
          <span className="calendar-title">{MONTHS[month]} {year}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={nextMonth}>→</button>
        </div>
        <div className="calendar-dow">
          {DOW.map((d) => (
            <span key={d} className="dow-cell">{d}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {cells.map((d, i) => (
            <div
              key={i}
              className={`calendar-cell ${d ? '' : 'empty'} ${d && markedSet.has(dateKey(d)) ? 'marked' : ''} ${d && isFuture(d) ? 'future' : ''}`}
              onClick={() => toggleDay(d)}
              role={d ? 'button' : undefined}
              tabIndex={d ? 0 : undefined}
              onKeyDown={(e) => d && (e.key === 'Enter' || e.key === ' ') && toggleDay(d)}
            >
              {d || ''}
            </div>
          ))}
        </div>
        <p className="calendar-legend">
          Klikni na dan da označiš/ukloniš trening. Zelena = odrađeno.
        </p>
      </div>

      <section className="marked-list">
        <h2>Označeni datumi u {MONTHS[month]}</h2>
        {days.length === 0 ? (
          <p className="no-days">Nema označenih dana ovog meseca.</p>
        ) : (
          <ul>
            {days.map((d) => (
              <li key={d.id} className="marked-item">
                <span>{d.day_date}</span>
                {d.notes && <span className="marked-notes">{d.notes}</span>}
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => unmarkProgressDay(d.day_date).then(load).catch((e) => setError(e.message))}>Ukloni</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
