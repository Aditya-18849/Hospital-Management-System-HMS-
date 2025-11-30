import React from 'react'
import { Typography, Paper } from '@mui/material'

export default function Home() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to HMS
      </Typography>
      <Typography>
        This frontend is a starting point for the Health Management System. Use the Register page to
        create a hospital account.
      </Typography>
    </Paper>
  )
}
