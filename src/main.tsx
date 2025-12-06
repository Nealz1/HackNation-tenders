import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './contexts/LanguageContext'
import { AnalysisPage } from './pages'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/c/:sessionId" element={<App />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
