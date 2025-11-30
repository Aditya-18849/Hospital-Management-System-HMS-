import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import HospitalRegister from './pages/HospitalRegister'
import HospitalActivation from './pages/HospitalActivation'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Patients from './pages/Patients'
import Appointments from './pages/Appointments' // Import Appointments
import Users from './pages/Users'               // Import Users
import Prescriptions from './pages/Prescriptions' // Import Prescriptions
import NotFound from './pages/NotFound'

// Components
import Layout from './components/Layout'

/**
 * ScrollToTop Component
 * Ensures the page scrolls to the top whenever the route changes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * PrivateRoute Component
 * Guards routes that require authentication.
 */
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * PublicRoute Component
 * Guards routes that are only for unauthenticated users.
 */
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/activate/:token" element={<HospitalActivation />} />
          
          {/* Guest Only Routes */}
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <HospitalRegister />
              </PublicRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/patients" 
            element={
              <PrivateRoute>
                <Patients />
              </PrivateRoute>
            } 
          />
          {/* --- NEW ROUTES ADDED HERE --- */}
          <Route 
            path="/appointments" 
            element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/prescriptions" 
            element={
              <PrivateRoute>
                <Prescriptions />
              </PrivateRoute>
            } 
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}