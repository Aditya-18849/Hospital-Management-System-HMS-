import React, { useState } from 'react'
import { 
  TextField, Button, Grid, Paper, Typography, Snackbar, Alert, 
  InputAdornment, IconButton, CircularProgress, Box, Divider 
} from '@mui/material'
import { 
  Business, Email, Phone, LocationOn, Badge, Lock, 
  Visibility, VisibilityOff, AppRegistration 
} from '@mui/icons-material'
import { post } from '../services/api'

export default function HospitalForm() {
  // FIXED: Added licenseNumber and password to initial state
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    address: '', 
    licenseNumber: '', 
    password: '' 
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  // Validation Logic
  const validate = () => {
    let tempErrors = {}
    if (!form.name) tempErrors.name = "Hospital Name is required"
    if (!form.email) {
      tempErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = "Email is not valid"
    }
    if (!form.licenseNumber) tempErrors.licenseNumber = "License Number is required"
    if (!form.password) {
      tempErrors.password = "Password is required"
    } else if (form.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters"
    }
    
    setErrors(tempErrors)
    return Object.keys(tempErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Clear error when user starts typing
    if (errors[name]) setErrors({ ...errors, [name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const resp = await post('/hospitals/register', form)
      setSnack({ 
        open: true, 
        message: resp?.data?.message || 'Registration successful! Check your email to activate.', 
        severity: 'success' 
      })
      // Reset form on success
      setForm({ name: '', email: '', phone: '', address: '',yb: '', licenseNumber: '', password: '' })
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Registration failed'
      setSnack({ open: true, message, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, width: '100%', borderRadius: 2 }}>
        
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <AppRegistration color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" component="h1" fontWeight="bold" color="primary">
            Hospital Registration
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Join our network to manage your patients and staff efficiently.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Hospital Name */}
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Hospital Name" 
                name="name" 
                fullWidth 
                required 
                value={form.name} 
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Official Email" 
                name="email" 
                type="email" 
                fullWidth 
                required 
                value={form.email} 
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* License Number */}
            <Grid item xs={12} sm={6}>
              <TextField 
                label="License Number" 
                name="licenseNumber" 
                fullWidth 
                required 
                value={form.licenseNumber} 
                onChange={handleChange}
                error={!!errors.licenseNumber}
                helperText={errors.licenseNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField 
                label="Phone Number" 
                name="phone" 
                fullWidth 
                value={form.phone} 
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField 
                label="Full Address" 
                name="address" 
                fullWidth 
                multiline 
                minRows={2} 
                value={form.address} 
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mt: 1, alignSelf: 'flex-start' }}>
                      <LocationOn color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Admin Password */}
            <Grid item xs={12}>
              <TextField 
                label="Create Admin Password" 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                fullWidth 
                required 
                value={form.password} 
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password || "Must be at least 6 characters"}
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
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                fullWidth 
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Hospital'}
              </Button>
            </Grid>
          </Grid>
        </form>

        <Snackbar 
          open={snack.open} 
          autoHideDuration={6000} 
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled" sx={{ width: '100%' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  )
}