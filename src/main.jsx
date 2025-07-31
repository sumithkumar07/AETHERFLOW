import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { useThemeStore } from './store/themeStore'

// Initialize theme
const initializeTheme = () => {
  // Initialize theme store immediately
  useThemeStore.getState().initializeTheme()
}

// Initialize Puter.js AI if available (non-blocking)
const initializePuterAI = async () => {
  try {
    // Check if Puter.js is available
    if (typeof window !== 'undefined' && !window.puter) {
      // Load Puter.js from CDN
      const script = document.createElement('script')
      script.src = 'https://js.puter.com/v2/'
      script.async = true
      script.onerror = () => {
        console.warn('⚠️ Puter.js AI could not be loaded, using fallback responses')
      }
      script.onload = () => {
        console.log('✅ Puter.js AI initialized successfully')
      }
      document.head.appendChild(script)
    }
  } catch (error) {
    console.warn('⚠️ Puter.js AI not available, using fallback responses', error)
  }
}

// Initialize theme immediately
initializeTheme()

// Render the React app immediately (non-blocking)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Initialize Puter.js in parallel (non-blocking)
initializePuterAI()