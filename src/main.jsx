import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Enhanced theme initialization with system preference detection
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('ai-tempo-theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  // Parse saved theme if it exists
  let effectiveTheme = 'light'
  if (savedTheme) {
    try {
      const themeData = JSON.parse(savedTheme)
      const theme = themeData?.state?.theme || 'system'
      effectiveTheme = theme === 'system' 
        ? (systemPrefersDark ? 'dark' : 'light')
        : theme
    } catch (error) {
      console.warn('Failed to parse saved theme, using system preference')
      effectiveTheme = systemPrefersDark ? 'dark' : 'light'
    }
  } else {
    effectiveTheme = systemPrefersDark ? 'dark' : 'light'
  }
  
  // Apply theme to document
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Initialize theme before React renders to prevent flash
initializeTheme()

// Listen for system theme changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', (e) => {
  // Only update if user hasn't set a specific preference
  const savedTheme = localStorage.getItem('ai-tempo-theme')
  if (!savedTheme) {
    if (e.matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
})

// Enhanced error handling for development
if (process.env.NODE_ENV === 'development') {
  // Add global error handlers for debugging
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
  })
}

// Create React root with enhanced error handling
const root = ReactDOM.createRoot(document.getElementById('root'))

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (error) {
  console.error('Failed to render React app:', error)
  
  // Fallback UI for critical render errors
  document.getElementById('root').innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    ">
      <div style="
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 2rem;
        max-width: 400px;
      ">
        <h1 style="margin-bottom: 1rem; font-size: 2rem;">⚠️ AI Tempo</h1>
        <p style="margin-bottom: 1rem; opacity: 0.9;">
          The application failed to load. Please refresh the page or contact support.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
          "
        >
          Refresh Page
        </button>
      </div>
    </div>
  `
}