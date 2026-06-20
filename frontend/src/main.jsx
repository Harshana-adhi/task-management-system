import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppToaster from './components/common/Toast.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <AppToaster />
  </StrictMode>,
)
