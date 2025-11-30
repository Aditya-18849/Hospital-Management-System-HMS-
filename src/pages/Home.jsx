import React from 'react'
import { 
  Box, Typography, Button, Container, Grid, Paper, Stack, useTheme 
} from '@mui/material'
import { 
  RocketLaunch, Security, CloudSync, Groups, 
  ArrowForward, LocalHospital 
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { user } = useAuth()

  // Features based on the Hackathon Problem Statement
  const features = [
    {
      icon: <CloudSync fontSize="large" color="primary" />,
      title: 'Multi-Tenant SaaS',
      desc: 'Instant 24-hour onboarding with dedicated database isolation for every hospital.'
    },
    {
      icon: <Security fontSize="large" color="secondary" />,
      title: 'Secure RBAC',
      desc: 'Role-Based Access Control ensuring data security for Admins, Doctors, and Staff.'
    },
    {
      icon: <Groups fontSize="large" color="success" />,
      title: 'Patient Lifecycle',
      desc: 'Complete digital management of OPD/IPD patients from registration to discharge.'
    }
  ]

  return (
    <Box>
      {/* --- Hero Section --- */}
      <Paper 
        elevation={0}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 0,
          mt: -4, // Counteract default container padding for full width feel
          mx: -3, // Counteract container margins if nested
          mb: 6,
          pt: 10,
          pb: 12,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: 2
        }}
      >
        <Container maxWidth="md">
          <LocalHospital sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
          <Typography variant="h2" component="h1" fontWeight="800" gutterBottom>
            Hospital Management System
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 400, maxWidth: 700, mx: 'auto' }}>
            A comprehensive, cloud-enabled SaaS platform enabling hospitals of any size 
            to digitize operations with zero upfront infrastructure investment.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {user ? (
              <Button 
                variant="contained" 
                color="secondary" 
                size="large" 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/dashboard')}
                sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large" 
                  startIcon={<RocketLaunch />}
                  onClick={() => navigate('/register')}
                  sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                >
                  Register Hospital
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large" 
                  onClick={() => navigate('/login')}
                  sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
                >
                  Login
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Paper>

      {/* --- Features Grid --- */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4, 
                  height: '100%', 
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}