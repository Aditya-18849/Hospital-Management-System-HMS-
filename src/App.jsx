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
import NotFound from './pages/NotFound'

// Components
import Layout from './components/Layout'

/**
 * ScrollToTop Component
 * Ensures the page scrolls to the top whenever the route changes.
 * Essential for good UX in SPAs.
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
 * Redirects unauthenticated users to the Login page.
 */
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

/**
 * PublicRoute Component
 * Guards routes that are only for unauthenticated users (like Login/Register).
 * Redirects authenticated users to the Dashboard.
 */
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      {/* UX Enhancer: Scroll to top on navigation */}
      <ScrollToTop />
      
      <Layout>
        <Routes>
          {/* --- Public Access Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/activate/:token" element={<HospitalActivation />} />
          
          {/* --- Guest Only Routes (Redirects to Dashboard if logged in) --- */}
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
          
          {/* --- Protected Routes (Requires Login) --- */}
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

          {/* --- Catch-all 404 Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}