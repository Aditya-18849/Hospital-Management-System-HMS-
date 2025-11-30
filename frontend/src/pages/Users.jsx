import React from 'react'
import { Container, Paper, Typography, Box, Grid, Avatar, IconButton } from '@mui/material'
import { MoreVert, Security, VerifiedUser } from '@mui/icons-material'

export default function Users() {
  const users = [
    { name: "Dr. Smith", role: "DOCTOR", email: "smith@hospital.com", dept: "Cardiology" },
    { name: "Nurse Joy", role: "NURSE", email: "joy@hospital.com", dept: "Emergency" },
    { name: "Admin User", role: "HOSPITAL_ADMIN", email: "admin@hospital.com", dept: "Management" },
  ]

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
       <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold">User Management</Typography>
        <Typography variant="body2" color="text.secondary">Manage hospital staff access and roles (RBAC).</Typography>
      </Box>

      <Grid container spacing={3}>
        {users.map((u, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Paper elevation={1} sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: u.role === 'HOSPITAL_ADMIN' ? 'error.main' : 'primary.main' }}>
                  {u.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{u.name}</Typography>
                  <Typography variant="caption" sx={{ bgcolor: '#eee', px: 1, borderRadius: 1 }}>{u.role}</Typography>
                  <Typography variant="body2" color="text.secondary">{u.dept}</Typography>
                </Box>
              </Box>
              <IconButton size="small"><MoreVert /></IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}