import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  addExercise,
  updateExercise,
  deleteExercise
} from '../api'
import { useAuth } from '../context/AuthContext'
import './Planovi.css'

export default function Planovi() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null) // 'create' | 'edit' | null
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [exModal, setExModal] = useState(null) // 'add' | { edit, exercise } | null
  const [form, setForm] = useState({ name: '', description: '', duration_months: 1 })
  const [exForm, setExForm] = useState({ name: '', repetitions: 10, sets: 3 })

  function isAuthError(msg) {
    if (!msg || typeof msg !== 'string') return false
    const m = msg.toLowerCase()
    return m.includes('token') || m.includes('istekao') || m.includes('401') || m.includes('unauthorized') || m.includes('subject')
  }

  function loadPlans() {
    setLoading(true)
    setError('')
    getPlans()
      .then(setPlans)
      .catch((e) => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/27a8b257-0ff6-46c7-bca9-4e9dbedef60f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Planovi.jsx:loadPlans:catch',message:'loadPlans failed',data:{message:e&&e.message},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        if (isAuthError(e.message)) {
          logout()
          navigate('/login', { replace: true })
          return
        }
        setError(e.message)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => loadPlans(), [])

  function openCreate() {
    setError('')
    setForm({ name: '', description: '', duration_months: 1 })
    setModal('create')
  }

  function openEdit(plan) {
    setSelectedPlan(plan)
    setForm({
      name: plan.name,
      description: plan.description || '',
      duration_months: plan.duration_months
    })
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setSelectedPlan(null)
  }

  function handleSavePlan(e) {
    e.preventDefault()
    if (modal === 'create') {
      createPlan(form.name, form.description, form.duration_months)
        .then(() => { loadPlans(); closeModal(); })
        .catch((e) => {
          if (isAuthError(e.message)) { logout(); navigate('/login', { replace: true }); return }
          setError(e.message)
        })
    } else {
      updatePlan(selectedPlan.id, form)
        .then(() => { loadPlans(); closeModal(); })
        .catch((e) => {
          if (isAuthError(e.message)) { logout(); navigate('/login', { replace: true }); return }
          setError(e.message)
        })
    }
  }

  function handleDeletePlan(plan) {
    if (!window.confirm('Obriši plan "' + plan.name + '"?')) return
    deletePlan(plan.id)
      .then(loadPlans)
      .catch((e) => setError(e.message))
  }

  function openAddExercise(plan) {
    setSelectedPlan(plan)
    setExForm({ name: '', repetitions: 10, sets: 3 })
    setExModal('add')
  }

  function openEditExercise(plan, exercise) {
    setSelectedPlan(plan)
    setExForm({
      name: exercise.name,
      repetitions: exercise.repetitions,
      sets: exercise.sets
    })
    setExModal({ edit: true, exercise })
  }

  function closeExModal() {
    setExModal(null)
    setSelectedPlan(null)
  }

  function handleSaveExercise(e) {
    e.preventDefault()
    if (exModal === 'add') {
      addExercise(selectedPlan.id, exForm.name, exForm.repetitions, exForm.sets)
        .then(() => { loadPlans(); closeExModal(); })
        .catch((e) => setError(e.message))
    } else {
      updateExercise(selectedPlan.id, exModal.exercise.id, exForm)
        .then(() => { loadPlans(); closeExModal(); })
        .catch((e) => setError(e.message))
    }
  }

  function handleDeleteExercise(plan, exercise) {
    if (!window.confirm('Obriši vežbu "' + exercise.name + '"?')) return
    deleteExercise(plan.id, exercise.id)
      .then(loadPlans)
      .catch((e) => setError(e.message))
  }

  if (loading) return <div className="page-loading">Učitavanje planova...</div>

  return (
    <div className="planovi-page">
      <div className="planovi-head">
        <h1>Planovi treninga</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Novi plan
        </button>
      </div>
      {error && (
        <div className="planovi-error" onClick={() => setError('')}>
          {error} (klikni da zatvoriš)
        </div>
      )}
      <div className="planovi-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <div className="plan-card-header">
              <h2>{plan.name}</h2>
              <span className="plan-duration">{plan.duration_months} meseci</span>
            </div>
            {plan.description && <p className="plan-desc">{plan.description}</p>}
            <div className="plan-exercises">
              <h4>Vežbe</h4>
              {plan.exercises && plan.exercises.length ? (
                <ul>
                  {plan.exercises.map((ex) => (
                    <li key={ex.id} className="ex-row">
                      <span>{ex.name} — {ex.sets}×{ex.repetitions}</span>
                      <span className="ex-actions">
                        <button type="button" className="btn btn-sm btn-ghost" onClick={() => openEditExercise(plan, ex)}>Izmeni</button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeleteExercise(plan, ex)}>Obriši</button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-exercises">Nema vežbi. Dodaj prvu.</p>
              )}
              <button type="button" className="btn btn-sm btn-primary" onClick={() => openAddExercise(plan)}>
                + Dodaj vežbu
              </button>
            </div>
            <div className="plan-card-actions">
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => openEdit(plan)}>Izmeni plan</button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeletePlan(plan)}>Obriši plan</button>
            </div>
          </div>
        ))}
      </div>
      {plans.length === 0 && (
        <p className="planovi-empty">Nemaš još planova. Klikni "Novi plan" da kreneš.</p>
      )}

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === 'create' ? 'Novi plan' : 'Izmena plana'}</h2>
            <form onSubmit={handleSavePlan}>
              <label>Naziv <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
              <label>Opis <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></label>
              <label>Trajanje (meseci) <input type="number" min={1} value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: parseInt(e.target.value, 10) || 1 })} /></label>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Odustani</button>
                <button type="submit" className="btn btn-primary">Sačuvaj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {exModal && (
        <div className="modal-overlay" onClick={closeExModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{exModal === 'add' ? 'Dodaj vežbu' : 'Izmena vežbe'}</h2>
            <form onSubmit={handleSaveExercise}>
              <label>Naziv <input value={exForm.name} onChange={(e) => setExForm({ ...exForm, name: e.target.value })} required /></label>
              <label>Serije <input type="number" min={1} value={exForm.sets} onChange={(e) => setExForm({ ...exForm, sets: parseInt(e.target.value, 10) || 1 })} /></label>
              <label>Ponavljanja <input type="number" min={1} value={exForm.repetitions} onChange={(e) => setExForm({ ...exForm, repetitions: parseInt(e.target.value, 10) || 1 })} /></label>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={closeExModal}>Odustani</button>
                <button type="submit" className="btn btn-primary">Sačuvaj</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
