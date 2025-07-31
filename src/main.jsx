import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { useThemeStore } from './store/themeStore'

// Initialize theme immediately
const initializeTheme = () => {
  useThemeStore.getState().initializeTheme()
}

// Initialize Puter.js AI (already loaded via HTML script tag)
const initializePuterAI = () => {
  try {
    if (typeof window !== 'undefined' && window.puter) {
      console.log('✅ Puter.js AI available and ready')
    } else {
      console.warn('⚠️ Puter.js AI not available, using fallback responses')
    }
  } catch (error) {
    console.warn('⚠️ Puter.js AI initialization error, using fallback responses', error)
  }
}

// Initialize theme immediately
initializeTheme()

// Render the React app immediately
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Check Puter.js availability (non-blocking)
initializePuterAI()