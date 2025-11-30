import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Paper, Typography, CircularProgress } from '@mui/material'
import { post } from '../services/api'

export default function HospitalActivation() {
  const { token } = useParams()
  const [status, setStatus] = useState({ loading: true, message: '' })

  useEffect(() => {
    const activate = async () => {
      try {
        const resp = await post(`/hospitals/activate/${token}`)
        setStatus({ loading: false, message: resp?.data?.message || 'Activated successfully' })
      } catch (err) {
        setStatus({ loading: false, message: err?.response?.data?.message || 'Activation failed' })
      }
    }
    if (token) activate()
    else setStatus({ loading: false, message: 'No activation token provided' })
  }, [token])

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Hospital Activation
      </Typography>
      {status.loading ? <CircularProgress /> : <Typography>{status.message}</Typography>}
    </Paper>
  )
}
