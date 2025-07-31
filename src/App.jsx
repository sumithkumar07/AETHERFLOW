import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Chat from './pages/Chat'
import Templates from './pages/Templates'
import Projects from './pages/Projects'
import ProjectEditor from './pages/ProjectEditor'
import Integrations from './pages/Integrations'
import Subscription from './pages/Subscription'
import Settings from './pages/Settings'
import Agents from './pages/Agents'
import Enterprise from './pages/Enterprise'
import { useAuthStore } from './store/authStore'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/templates" element={<Templates />} />
            {isAuthenticated ? (
              <>
                <Route path="/chat" element={<Chat />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:projectId" element={<ProjectEditor />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/enterprise" element={<Enterprise />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/settings" element={<Settings />} />
              </>
            ) : (
              <Route path="*" element={<Login />} />
            )}
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  )
}

export default App