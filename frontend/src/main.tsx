import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { NavBar } from './components/NavBar'
import { BefundDetailPage } from './pages/BefundDetailPage'
import { BefundListPage } from './pages/BefundListPage'
import { ImportPage } from './pages/ImportPage'
import { PatientSearchPage } from './pages/PatientSearchPage'
import { ReviewQueuePage } from './pages/ReviewQueuePage'
import { SplitViewPage } from './pages/SplitViewPage'
import { theme } from './theme'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/"               element={<ImportPage />} />
            <Route path="/review"         element={<ReviewQueuePage />} />
            <Route path="/review/:labId"  element={<SplitViewPage />} />
            <Route path="/befunde"        element={<BefundListPage />} />
            <Route path="/befunde/:labId" element={<BefundDetailPage />} />
            <Route path="/patienten"      element={<PatientSearchPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
