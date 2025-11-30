import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Paper, Typography, CircularProgress, Box, Button, Container, Fade 
} from '@mui/material'
import { 
  CheckCircle, ErrorOutline, LocalHospital, ArrowForward, Home 
} from '@mui/icons-material'
import { post } from '../services/api'

export default function HospitalActivation() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const activate = async () => {
      if (!token) {
        setLoading(false)
        setSuccess(false)
        setMessage('No activation token provided.')
        return
      }

      try {
        // Simulate a small delay for better UX (prevents flickering)
        await new Promise(r => setTimeout(r, 1500)) 
        
        const resp = await post(`/hospitals/activate/${token}`)
        setSuccess(true)
        setMessage(resp?.data?.message || 'Your hospital account has been successfully activated.')
      } catch (err) {
        setSuccess(false)
        setMessage(err?.response?.data?.message || 'The activation link is invalid or has expired.')
      } finally {
        setLoading(false)
      }
    }
    activate()
  }, [token])

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          textAlign: 'center', 
          borderRadius: 4,
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* --- LOADING STATE --- */}
        {loading && (
          <Fade in={loading}>
            <Box>
              <CircularProgress size={60} thickness={4} sx={{ mb: 3, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Verifying Account
              </Typography>
              <Typography color="text.secondary">
                Please wait while we activate your hospital profile...
              </Typography>
            </Box>
          </Fade>
        )}

        {/* --- SUCCESS STATE --- */}
        {!loading && success && (
          <Fade in={!loading}>
            <Box>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom color="success.main">
                Activation Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                {message} <br />
                You can now log in to the HMS dashboard to start managing your hospital operations.
              </Typography>
              
              <Button 
                variant="contained" 
                size="large" 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/login')}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                Proceed to Login
              </Button>
            </Box>
          </Fade>
        )}

        {/* --- ERROR STATE --- */}
        {!loading && !success && (
          <Fade in={!loading}>
            <Box>
              <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom color="error.main">
                Activation Failed
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                {message}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  startIcon={<Home />}
                  onClick={() => navigate('/')}
                >
                  Go Home
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/register')}
                >
                  Register Again
                </Button>
              </Box>
            </Box>
          </Fade>
        )}
      </Paper>

      {/* Footer Branding */}
      <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <LocalHospital fontSize="small" />
        <Typography variant="caption">
          Hospital Management System Secure Activation
        </Typography>
      </Box>
    </Container>
  )
}