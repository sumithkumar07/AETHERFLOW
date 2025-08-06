/**
 * Enhanced Accessibility Components - 2025 Edition
 * WCAG 2.1 AA compliant accessibility enhancements
 */

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Skip to Content Link
export const SkipLink = () => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg"
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
          onClick={(e) => {
            e.preventDefault()
            const mainContent = document.getElementById('main-content')
            if (mainContent) {
              mainContent.focus()
              mainContent.scrollIntoView({ behavior: 'smooth' })
            }
            setIsVisible(false)
          }}
        >
          Skip to main content
        </motion.a>
      )}
    </AnimatePresence>
  )
}

// Screen Reader Only Content
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => (
  <Component className="sr-only">
    {children}
  </Component>
)

// Live Announcer for Screen Readers
export const LiveAnnouncer = () => {
  const [announcements, setAnnouncements] = useState([])
  const announcerRef = useRef(null)

  useEffect(() => {
    const handleAnnouncement = (event) => {
      const { message, priority = 'polite' } = event.detail
      
      setAnnouncements(prev => [{
        id: Date.now(),
        message,
        priority
      }])

      // Clear after announcement
      setTimeout(() => {
        setAnnouncements([])
      }, 1000)
    }

    window.addEventListener('ai-announcement', handleAnnouncement)
    return () => window.removeEventListener('ai-announcement', handleAnnouncement)
  }, [])

  return (
    <>
      {announcements.map((announcement) => (
        <div
          key={announcement.id}
          ref={announcerRef}
          aria-live={announcement.priority}
          aria-atomic="true"
          className="sr-only"
        >
          {announcement.message}
        </div>
      ))}
    </>
  )
}

// Focus Management Hook
export const useFocusManagement = () => {
  const focusHistory = useRef([])
  
  const saveFocus = () => {
    const activeElement = document.activeElement
    if (activeElement && activeElement !== document.body) {
      focusHistory.current.push(activeElement)
    }
  }
  
  const restoreFocus = () => {
    const lastFocused = focusHistory.current.pop()
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus()
    }
  }
  
  const trapFocus = (containerRef) => {
    if (!containerRef.current) return
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    
    containerRef.current.addEventListener('keydown', handleKeyDown)
    
    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown)
    }
  }
  
  return {
    saveFocus,
    restoreFocus,
    trapFocus
  }
}

// Accessible Modal Component
export const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  closeOnEscape = true,
  closeOnOverlayClick = true 
}) => {
  const modalRef = useRef(null)
  const { saveFocus, restoreFocus, trapFocus } = useFocusManagement()
  
  useEffect(() => {
    if (isOpen) {
      saveFocus()
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
      
      // Trap focus within modal
      const cleanup = trapFocus(modalRef)
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      return () => {
        cleanup && cleanup()
        document.body.style.overflow = ''
        restoreFocus()
      }
    }
  }, [isOpen, saveFocus, restoreFocus, trapFocus])
  
  useEffect(() => {
    if (!closeOnEscape) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, closeOnEscape])
  
  if (!isOpen) return null
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
        )}
        <div className="px-6 py-4">
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

// Accessible Button Component
export const AccessibleButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300"
  }
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  }
  
  const handleClick = (e) => {
    if (disabled || loading) return
    onClick && onClick(e)
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick(e)
    }
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

// Accessible Form Input
export const AccessibleInput = ({
  label,
  error,
  help,
  required = false,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${inputId}-error` : undefined
  const helpId = help ? `${inputId}-help` : undefined
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          ${className}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
        aria-required={required}
        {...props}
      />
      
      {help && (
        <p id={helpId} className="text-sm text-gray-600 dark:text-gray-400">
          {help}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// High Contrast Mode Toggle
export const HighContrastToggle = () => {
  const [highContrast, setHighContrast] = useState(false)
  
  useEffect(() => {
    const stored = localStorage.getItem('high-contrast')
    if (stored) {
      const isHighContrast = JSON.parse(stored)
      setHighContrast(isHighContrast)
      document.documentElement.classList.toggle('high-contrast', isHighContrast)
    }
  }, [])
  
  const toggleHighContrast = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    localStorage.setItem('high-contrast', JSON.stringify(newValue))
    document.documentElement.classList.toggle('high-contrast', newValue)
    
    // Announce change
    window.dispatchEvent(new CustomEvent('ai-announcement', {
      detail: {
        message: `High contrast mode ${newValue ? 'enabled' : 'disabled'}`,
        priority: 'polite'
      }
    }))
  }
  
  return (
    <AccessibleButton
      onClick={toggleHighContrast}
      variant="ghost"
      ariaLabel={`${highContrast ? 'Disable' : 'Enable'} high contrast mode`}
      className="p-2"
    >
      <span className="text-sm">
        {highContrast ? '🔆' : '🌓'} High Contrast
      </span>
    </AccessibleButton>
  )
}

// Keyboard Navigation Indicator
export const KeyboardNavigationIndicator = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
        document.body.classList.add('keyboard-navigation')
      }
    }
    
    const handleMouseDown = () => {
      setIsKeyboardUser(false)
      document.body.classList.remove('keyboard-navigation')
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])
  
  return null // This is just for adding the class to body
}

export default {
  SkipLink,
  ScreenReaderOnly,
  LiveAnnouncer,
  AccessibleModal,
  AccessibleButton,
  AccessibleInput,
  HighContrastToggle,
  KeyboardNavigationIndicator,
  useFocusManagement
}