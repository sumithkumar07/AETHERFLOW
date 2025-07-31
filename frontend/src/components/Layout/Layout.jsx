import React from 'react'
import Navigation from './Navigation'
import Footer from './Footer'
import ErrorBoundary from '../Common/ErrorBoundary'

const Layout = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <ErrorBoundary>
        <main className="flex-1">
          {children}
        </main>
      </ErrorBoundary>
      {showFooter && <Footer />}
    </div>
  )
}

export default Layout