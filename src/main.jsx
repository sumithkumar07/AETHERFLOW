import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { useThemeStore } from './store/themeStore'

// Initialize theme
const initializeTheme = () => {
  // Initialize theme store
  useThemeStore.getState().initializeTheme()
}

// Initialize Puter.js AI if available
const initializePuterAI = async () => {
  try {
    // Check if Puter.js is available
    if (typeof window !== 'undefined' && !window.puter) {
      // Load Puter.js from CDN
      const script = document.createElement('script')
      script.src = 'https://js.puter.com/v2/'
      script.async = true
      document.head.appendChild(script)
      
      await new Promise((resolve) => {
        script.onload = resolve
      })
      
      console.log('✅ Puter.js AI initialized successfully')
    }
  } catch (error) {
    console.warn('⚠️ Puter.js AI not available, using fallback responses', error)
  }
}

// Initialize everything
const initialize = async () => {
  initializeTheme()
  await initializePuterAI()
}

// Initialize and render the app
initialize().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})