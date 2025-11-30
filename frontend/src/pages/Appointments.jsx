import React from 'react'
import { Container, Paper, Typography, Box, Button, Grid, Chip, Avatar } from '@mui/material'
import { Event, Add, AccessTime } from '@mui/icons-material'
import { alpha, useTheme } from '@mui/material/styles'

export default function Appointments() {
  const theme = useTheme()

  // Mock Data for UI Visualization
  const appointments = [
    { id: 1, patient: "John Doe", doctor: "Dr. Smith", time: "10:30 AM", type: "Consultation", status: "Confirmed" },
    { id: 2, patient: "Jane Smith", doctor: "Dr. Adams", time: "11:00 AM", type: "Follow-up", status: "Pending" },
    { id: 3, patient: "Robert Brown", doctor: "Dr. Smith", time: "02:15 PM", type: "Emergency", status: "In-Progress" },
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'success';
      case 'Pending': return 'warning';
      case 'In-Progress': return 'info';
      default: return 'default';
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Appointments</Typography>
          <Typography variant="body2" color="text.secondary">Manage doctor schedules and patient visits.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>New Appointment</Button>
      </Box>

      <Grid container spacing={3}>
        {appointments.map((apt) => (
          <Grid item xs={12} md={4} key={apt.id}>
            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Chip label={apt.time} icon={<AccessTime />} size="small" variant="outlined" />
                <Chip label={apt.status} color={getStatusColor(apt.status)} size="small" />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light }}>{apt.patient[0]}</Avatar>
                <Box>
                  <Typography variant="h6" fontSize="1.1rem">{apt.patient}</Typography>
                  <Typography variant="body2" color="text.secondary">{apt.type}</Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), p: 1, borderRadius: 1 }}>
                With: <strong>{apt.doctor}</strong>
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}