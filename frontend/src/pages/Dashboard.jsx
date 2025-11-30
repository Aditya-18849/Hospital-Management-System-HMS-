import React from 'react'
import { 
  Box, Typography, Grid, Card, CardContent, CardActionArea, 
  Container, Avatar, Chip, useTheme, Paper 
} from '@mui/material'
import { 
  People, EventNote, LocalPharmacy, AdminPanelSettings, 
  ArrowForward, LocalHospital 
} from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()

  // Define menu items with Icons, Colors, and Descriptions
  const menuItems = [
    { 
      title: 'Patients', 
      role: ['DOCTOR', 'NURSE', 'RECEPTIONIST', 'HOSPITAL_ADMIN'], 
      link: '/patients', 
      icon: <People fontSize="large" />, 
      color: theme.palette.info.main,
      description: 'Register new patients, view history, and manage admissions.'
    },
    { 
      title: 'Appointments', 
      role: ['RECEPTIONIST', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'], 
      link: '/appointments', 
      icon: <EventNote fontSize="large" />, 
      color: theme.palette.secondary.main,
      description: 'Schedule consultations and manage doctor availability.'
    },
    { 
      title: 'Prescriptions', 
      // FIXED: Added HOSPITAL_ADMIN to role array so you can see it
      role: ['DOCTOR', 'PHARMACIST', 'HOSPITAL_ADMIN'], 
      link: '/prescriptions', 
      icon: <LocalPharmacy fontSize="large" />, 
      color: theme.palette.success.main,
      description: 'Issue medications and track pharmacy inventory.'
    },
    { 
      title: 'User Management', 
      role: ['HOSPITAL_ADMIN'], 
      link: '/users', 
      icon: <AdminPanelSettings fontSize="large" />, 
      color: theme.palette.warning.main,
      description: 'Manage hospital staff accounts, roles, and access permissions.'
    },
  ]

  const userName = user?.name || 'User'
  const userRole = user?.role || 'Guest'
  const hospitalName = user?.hospitalName || 'Hospital'

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Welcome Banner */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 5, 
          borderRadius: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {userName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.9 }}>
              <LocalHospital sx={{ mr: 0.5, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                {hospitalName}
              </Typography>
            </Box>
            <Chip 
              label={userRole.replace('_', ' ')} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                fontWeight: 'bold',
                textTransform: 'uppercase',
                ml: 1
              }} 
            />
          </Box>
        </Box>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'rgba(255,255,255,0.2)', 
            color: 'white',
            fontSize: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {userName.charAt(0)}
        </Avatar>
      </Paper>

      {/* Quick Access Grid */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: 'text.primary' }}>
        Overview
      </Typography>

      <Grid container spacing={3}>
        {menuItems.map((item) => (
          (item.role.includes(userRole)) && (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Card 
                elevation={1}
                sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => navigate(item.link)}
                  sx={{ 
                    height: '100%', 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between' 
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: alpha(item.color, 0.1), 
                      color: item.color,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </Box>

                  <CardContent sx={{ p: 0, width: '100%', flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                  </CardContent>

                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
                    <ArrowForward fontSize="small" sx={{ color: 'text.disabled' }} />
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          )
        ))}
      </Grid>
    </Container>
  )
}