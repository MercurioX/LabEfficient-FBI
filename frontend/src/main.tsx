import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { BefundDetailPage } from './pages/BefundDetailPage'
import { BefundListPage } from './pages/BefundListPage'
import { ImportPage } from './pages/ImportPage'
import { PatientSearchPage } from './pages/PatientSearchPage'
import { ReviewQueuePage } from './pages/ReviewQueuePage'
import { SplitViewPage } from './pages/SplitViewPage'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
  </React.StrictMode>,
)
