import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

// Accessible Button Component
export const AccessibleButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-xl
    transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    hover:transform hover:scale-105 active:scale-95
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600 text-white
      hover:from-blue-700 hover:to-purple-700 
      focus:ring-blue-500 shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white
      hover:bg-gray-200 dark:hover:bg-gray-700
      focus:ring-gray-500 border border-gray-300 dark:border-gray-600
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 text-white
      hover:from-red-700 hover:to-red-800
      focus:ring-red-500 shadow-lg hover:shadow-xl
    `,
    ghost: `
      text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
      focus:ring-gray-500
    `
  }

  const sizes = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2.5 text-sm',
    large: 'px-6 py-3 text-base'
  }

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <svg 
          className="w-4 h-4 mr-2 animate-spin" 
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </motion.button>
  )
}

// Accessible Input Component
export const AccessibleInput = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${inputId}-error`
  const helperId = `${inputId}-helper`

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${helperText ? helperId : ''}`}
          className={`
            block w-full rounded-xl border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500
            transition-colors duration-200
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-10' : 'pr-4'}
            py-2.5
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          id={errorId}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <div
          id={helperId}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </div>
      )}
    </div>
  )
}

// Accessible Select Component
export const AccessibleSelect = ({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const selectRef = useRef(null)
  const listRef = useRef(null)

  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
  const errorId = `${selectId}-error`

  const selectedOption = options.find(option => option.value === value)

  const handleKeyDown = (event) => {
    if (disabled) return

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (isOpen && focusedIndex >= 0) {
          onChange(options[focusedIndex].value)
          setIsOpen(false)
        } else {
          setIsOpen(!isOpen)
        }
        break
      case 'ArrowDown':
        event.preventDefault()
        if (isOpen) {
          setFocusedIndex(Math.min(focusedIndex + 1, options.length - 1))
        } else {
          setIsOpen(true)
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (isOpen) {
          setFocusedIndex(Math.max(focusedIndex - 1, 0))
        }
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        break
    }
  }

  const handleOptionClick = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
    selectRef.current?.focus()
  }

  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      const focusedElement = listRef.current?.children[focusedIndex]
      focusedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex, isOpen])

  return (
    <div className={`relative space-y-1 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Select Button */}
      <div
        ref={selectRef}
        id={selectId}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={label ? `${selectId}-label` : undefined}
        aria-describedby={error ? errorId : undefined}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative w-full bg-white dark:bg-gray-800 border rounded-xl px-4 py-2.5
          cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
          ${disabled ? 'bg-gray-50 dark:bg-gray-900 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="block truncate text-gray-900 dark:text-white">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </span>
      </div>

      {/* Options List */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            ref={listRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none border border-gray-200 dark:border-gray-700"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`
                  relative cursor-pointer select-none py-2 pl-3 pr-9 transition-colors
                  ${value === option.value
                    ? 'bg-blue-600 text-white'
                    : index === focusedIndex
                    ? 'bg-blue-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="block truncate font-normal">
                  {option.label}
                </span>
                {value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          id={errorId}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  )
}

// Accessible Modal Component
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  className = ''
}) => {
  const modalRef = useRef(null)
  const previousFocusRef = useRef(null)

  const sizes = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    full: 'max-w-7xl'
  }

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement
      modalRef.current?.focus()
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleBackdropClick}
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              tabIndex={-1}
              onKeyDown={handleKeyDown}
              className={`
                inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:p-6 w-full
                ${sizes[size]} ${className}
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="text-gray-600 dark:text-gray-300">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Accessible Toast Notification
export const AccessibleToast = ({
  message,
  type = 'info',
  isVisible,
  onDismiss,
  autoHideDuration = 5000
}) => {
  const toastRef = useRef(null)

  const types = {
    success: {
      icon: CheckIcon,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    error: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800'
    }
  }

  const config = types[type]
  const Icon = config.icon

  useEffect(() => {
    if (isVisible && autoHideDuration > 0) {
      const timer = setTimeout(onDismiss, autoHideDuration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, autoHideDuration, onDismiss])

  useEffect(() => {
    if (isVisible && toastRef.current) {
      // Announce to screen readers
      toastRef.current.focus()
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={toastRef}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          className={`
            fixed top-4 right-4 z-50 max-w-sm w-full shadow-lg rounded-xl border p-4
            ${config.bgColor} ${config.textColor} ${config.borderColor}
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`rounded-md inline-flex ${config.textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
                onClick={onDismiss}
                aria-label="Close notification"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Skip Link Component
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    {children}
  </a>
)

// Screen Reader Only Text
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => (
  <Component className="sr-only">
    {children}
  </Component>
)