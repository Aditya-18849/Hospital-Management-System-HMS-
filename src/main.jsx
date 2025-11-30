import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider } from '@mui/material'

// Internal Imports
import App from './App'
import theme from './theme'
import './index.css'

// Select the root element from the HTML
const container = document.getElementById('root')

// Production-grade safety check
if (!container) {
  throw new Error('Failed to find the root element. Application cannot mount.')
}

const root = createRoot(container)

root.render(
  <React.StrictMode>
    {/* ThemeProvider makes the MUI theme available to the component tree */}
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      
      {/* BrowserRouter wraps the application to enable routing features */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)