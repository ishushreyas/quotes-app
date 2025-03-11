import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import QuotesApp from './QuotesApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QuotesApp />
  </StrictMode>,
)
