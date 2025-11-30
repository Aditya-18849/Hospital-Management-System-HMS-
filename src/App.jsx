import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import HospitalRegister from './pages/HospitalRegister'
import HospitalActivation from './pages/HospitalActivation'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<HospitalRegister />} />
        <Route path="/activate/:token" element={<HospitalActivation />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
