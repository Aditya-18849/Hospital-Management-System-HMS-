import React, { useState } from 'react'
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, 
  IconButton, Menu, MenuItem, Avatar, Tooltip, Drawer, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Divider, useTheme
} from '@mui/material'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  LocalHospital, Menu as MenuIcon, Dashboard, 
  Login, AppRegistration, Logout, Home, Person 
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  // State for menus
  const [anchorElUser, setAnchorElUser] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Handlers
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
  const handleCloseUserMenu = () => setAnchorElUser(null)
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)

  const handleLogout = () => {
    handleCloseUserMenu()
    logout()
    navigate('/login')
  }

  // Navigation Config
  const publicLinks = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Login', path: '/login', icon: <Login /> },
    { text: 'Register', path: '/register', icon: <AppRegistration /> },
  ]

  const privateLinks = [
    { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { text: 'Patients', path: '/patients', icon: <Person /> }, // Added based on your features
  ]

  const navLinks = user ? privateLinks : publicLinks

  // Mobile Drawer Content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, bgcolor: 'primary.main', color: 'white' }}>
        <LocalHospital />
        <Typography variant="h6">HMS Portal</Typography>
      </Box>
      <Divider />
      <List>
        {navLinks.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {user && (
           <>
             <Divider sx={{ my: 1 }} />
             <ListItem disablePadding>
               <ListItemButton onClick={handleLogout}>
                 <ListItemIcon color="error"><Logout color="error" /></ListItemIcon>
                 <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
               </ListItemButton>
             </ListItem>
           </>
        )}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      
      {/* --- Navbar --- */}
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            
            {/* Desktop Logo */}
            <LocalHospital sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                flexGrow: 1
              }}
            >
              HMS
            </Typography>

            {/* Mobile Menu Toggle */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Mobile Logo */}
            <LocalHospital sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              HMS
            </Typography>

            {/* Desktop Navigation Links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
              {navLinks.map((item) => (
                <Button
                  key={item.text}
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    my: 2,
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    fontWeight: location.pathname === item.path ? 'bold' : 'medium',
                    borderBottom: location.pathname === item.path ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
                  }}
                >
                  {item.text}
                </Button>
              ))}

              {/* User Avatar Menu (Only if Logged in) */}
              {user && (
                <Box sx={{ flexGrow: 0, ml: 2 }}>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    keepMounted
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle2" noWrap>{user.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{user.email}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { navigate('/dashboard'); handleCloseUserMenu(); }}>
                      <ListItemIcon><Dashboard fontSize="small"/></ListItemIcon>
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><Logout fontSize="small" color="error"/></ListItemIcon>
                      <Typography color="error">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* --- Mobile Drawer (Slide-out) --- */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* --- Main Content Area --- */}
      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: 4, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center' // Centers content nicely
        }}
      >
        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
      </Container>

      {/* --- Footer --- */}
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' Hospital Management System. All rights reserved.'}
          </Typography>
        </Container>
      </Box>

    </Box>
  )
}