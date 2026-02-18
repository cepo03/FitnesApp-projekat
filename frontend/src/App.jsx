import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Planovi from './pages/Planovi'
import Napredak from './pages/Napredak'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loading">Učitavanje...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      <Route
        path="/planovi"
        element={
          <PrivateRoute>
            <Layout><Planovi /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/napredak"
        element={
          <PrivateRoute>
            <Layout><Napredak /></Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
