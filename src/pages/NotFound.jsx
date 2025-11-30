import React from 'react'
import { Paper, Typography } from '@mui/material'

export default function NotFound() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4">404 - Not Found</Typography>
      <Typography>The page you requested does not exist.</Typography>
    </Paper>
  )
}
