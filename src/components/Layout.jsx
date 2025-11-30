import React from 'react'
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HMS
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/register">
            Register
          </Button>
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
        </Toolbar>
      </AppBar>
      <Container className="container">{children}</Container>
    </div>
  )
}
