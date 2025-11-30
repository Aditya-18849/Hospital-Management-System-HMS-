import React from 'react'
import { Box, Typography, Button, Container, Fade, useTheme } from '@mui/material'
import { Home, ArrowBack, SentimentVeryDissatisfied } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Fade in={true} timeout={800}>
      <Container 
        maxWidth="md" 
        sx={{ 
          height: '80vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        {/* --- Visual Icon --- */}
        <Box 
          sx={{ 
            p: 4, 
            bgcolor: 'action.hover', 
            borderRadius: '50%', 
            mb: 4,
            animation: 'float 3s ease-in-out infinite' 
          }}
        >
          <SentimentVeryDissatisfied sx={{ fontSize: 80, color: 'text.secondary' }} />
        </Box>

        {/* --- Main Error Text --- */}
        <Typography 
          variant="h1" 
          fontWeight="900" 
          color="primary.main"
          sx={{ 
            fontSize: { xs: '6rem', md: '10rem' },
            lineHeight: 1,
            opacity: 0.8,
            textShadow: `4px 4px 0px ${theme.palette.action.selected}`
          }}
        >
          404
        </Typography>

        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
          Page Not Found
        </Typography>
        
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ maxWidth: 500, mb: 5 }}
        >
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>

        {/* --- Navigation Actions --- */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            size="large" 
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ px: 3, borderRadius: 2 }}
          >
            Go Back
          </Button>

          <Button 
            variant="contained" 
            size="large" 
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{ px: 3, borderRadius: 2, fontWeight: 'bold' }}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Fade>
  )
}