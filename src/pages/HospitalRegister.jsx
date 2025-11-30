import React from 'react'
import { Container, Box, Button, Fade } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { ArrowBack, Login } from '@mui/icons-material'
import HospitalForm from '../components/HospitalForm'

export default function HospitalRegister() {
  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="md">
        
        {/* --- Main Registration Form --- */}
        <HospitalForm />

        {/* --- Navigation Links (Footer) --- */}
        <Box 
          sx={{ 
            mt: 4, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 3,
            flexWrap: 'wrap'
          }}
        >
          <Button 
            component={RouterLink} 
            to="/" 
            startIcon={<ArrowBack />} 
            color="inherit"
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Back to Home
          </Button>
          
          <Button 
            component={RouterLink} 
            to="/login" 
            endIcon={<Login />} 
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Already have an account? Login
          </Button>
        </Box>

      </Container>
    </Fade>
  )
}