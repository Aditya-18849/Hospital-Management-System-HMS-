import React, { useState } from 'react'
import { TextField, Button, Grid, Paper, Typography, Snackbar, Alert } from '@mui/material'
import { post } from '../services/api'

export default function HospitalForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const resp = await post('/hospitals/register', form)
      setSnack({ open: true, message: resp?.data?.message || 'Registered successfully', severity: 'success' })
      setForm({ name: '', email: '', phone: '', address: '' })
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Registration failed'
      setSnack({ open: true, message, severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Hospital Registration
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Name" name="name" fullWidth required value={form.name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email" name="email" type="email" fullWidth required value={form.email} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Phone" name="phone" fullWidth value={form.phone} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Address" name="address" fullWidth multiline minRows={2} value={form.address} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Submitting...' : 'Register Hospital'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Snackbar open={snack.open} autoHideDuration={6000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  )
}
