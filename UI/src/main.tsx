import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from './apollo/client.ts'
import { AuthProvider } from './auth/AuthContext.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@emotion/react'
import { createTheme, CssBaseline, PaletteMode } from '@mui/material'
import { useMemo, useState } from 'react'
import { App } from './App.tsx'
const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => (localStorage.getItem('theme_mode') as PaletteMode) || 'light')

  const toggle = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme_mode', next)
      return next
    })
  }

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode])

  return (
    <ThemeProvider theme={{ ...theme, toggleTheme: toggle }}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <BrowserRouter>
          <ThemeWrapper>
            <App />
          </ThemeWrapper>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)
