import React, { useState } from 'react'
import { Paper, TextField, Button, Typography } from '@mui/material'
import { post, setAuthToken } from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const resp = await post('/auth/login', form)
      const token = resp?.data?.token
      if (token) setAuthToken(token)
      // You might want to save token to localStorage and redirect to dashboard
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Email" name="email" type="email" fullWidth required margin="normal" value={form.email} onChange={handleChange} />
        <TextField label="Password" name="password" type="password" fullWidth required margin="normal" value={form.password} onChange={handleChange} />
        <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 2 }}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Paper>
  )
}
