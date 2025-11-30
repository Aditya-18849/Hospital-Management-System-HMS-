import React, { useState } from 'react'
import { 
  Paper, TextField, Button, Typography, Alert, 
  InputAdornment, IconButton, CircularProgress, Box, 
  Container, Link, Divider, Fade 
} from '@mui/material'
import { 
  Email, Lock, Visibility, VisibilityOff, Login as LoginIcon, LocalHospital 
} from '@mui/icons-material'
import { post } from '../services/api'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  // Validation Logic
  const validate = () => {
    let tempErrors = {}
    if (!form.email) {
      tempErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = "Invalid email format"
    }
    if (!form.password) tempErrors.password = "Password is required"
    
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Clear specific field error when user types
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    // Clear general error when user types
    if (generalError) setGeneralError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setGeneralError('')
    
    try {
      const resp = await post('/auth/login', form)
      // Small delay for smooth transition feel
      await new Promise(r => setTimeout(r, 500))
      
      login(resp.data, resp.data.token)
      navigate('/dashboard')
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Fade in={true} timeout={600}>
      <Container maxWidth="xs" sx={{ height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Paper 
          elevation={4} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}
        >
          {/* Header Section */}
          <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: '50%', mb: 2, opacity: 0.1 }}>
            <LocalHospital color="primary" sx={{ fontSize: 40, opacity: 10 }} />
          </Box>
          <LocalHospital color="primary" sx={{ fontSize: 40, mb: 1, position: 'absolute', mt: 2.5 }} />

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Sign in to access your dashboard
          </Typography>

          {/* Error Alert */}
          {generalError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
              {generalError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }} noValidate>
            <TextField 
              fullWidth 
              label="Email Address" 
              name="email" 
              type="email"
              value={form.email} 
              onChange={handleChange} 
              margin="normal" 
              error={!!errors.email}
              helperText={errors.email}
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField 
              fullWidth 
              label="Password" 
              name="password" 
              type={showPassword ? 'text' : 'password'} 
              value={form.password} 
              onChange={handleChange} 
              margin="normal" 
              error={!!errors.password}
              helperText={errors.password}
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 2 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover">
                Forgot password?
              </Link>
            </Box>

            <Button 
              fullWidth 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={loading}
              sx={{ py: 1.5, mb: 3, fontWeight: 'bold' }}
              startIcon={!loading && <LoginIcon />}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </form>

          <Divider flexItem sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" fontWeight="bold" underline="hover">
              Register Hospital
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Fade>
  )
}