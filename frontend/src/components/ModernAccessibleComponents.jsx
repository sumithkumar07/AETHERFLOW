import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

// Enhanced Button with full accessibility support
export const AccessibleButton = forwardRef(({ 
  children, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  ariaLabel,
  ariaDescribedBy,
  onClick,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = `
    relative inline-flex items-center justify-center font-medium 
    transition-all duration-200 ease-in-out focus:outline-none 
    focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    disabled:cursor-not-allowed disabled:opacity-50
    rounded-xl border-0 shadow-lg hover:shadow-xl
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600 text-white 
      hover:from-blue-700 hover:to-purple-700 
      active:from-blue-800 active:to-purple-800
    `,
    secondary: `
      bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
      border border-gray-300 dark:border-gray-600
      hover:bg-gray-50 dark:hover:bg-gray-700
    `,
    ghost: `
      bg-transparent text-gray-700 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-gray-800
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700 text-white
      hover:from-red-700 hover:to-red-800
    `
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm', 
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  return (
    <motion.button
      ref={ref}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onClick={onClick}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-3 h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {/* Left icon */}
      {LeftIcon && !loading && (
        <LeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />
      )}
      
      {/* Button text */}
      <span>{children}</span>
      
      {/* Right icon */}
      {RightIcon && (
        <RightIcon className="w-5 h-5 ml-2" aria-hidden="true" />
      )}
    </motion.button>
  )
})

// Enhanced Input with validation and accessibility
export const AccessibleInput = forwardRef(({ 
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  required = false,
  disabled = false,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  rightElement = null,
  className = '',
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputId = useRef(`input-${Math.random().toString(36).substr(2, 9)}`)
  const hintId = hint ? `${inputId.current}-hint` : undefined
  const errorId = error ? `${inputId.current}-error` : undefined

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId.current}
          className={`
            block text-sm font-medium mb-2 transition-colors duration-200
            ${error 
              ? 'text-red-700 dark:text-red-400' 
              : 'text-gray-700 dark:text-gray-300'
            }
          `}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <LeftIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={inputId.current}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? 'true' : 'false'}
          className={`
            w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 border rounded-xl
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
            ${LeftIcon ? 'pl-10' : ''}
            ${(RightIcon || rightElement || type === 'password') ? 'pr-10' : ''}
            ${error 
              ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
              : focused 
                ? 'border-blue-300 dark:border-blue-600' 
                : 'border-gray-300 dark:border-gray-600'
            }
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
          `}
          {...props}
        />

        {/* Right element (password toggle, icon, or custom element) */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          )}
          {RightIcon && type !== 'password' && (
            <RightIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
          )}
          {rightElement && type !== 'password' && rightElement}
        </div>
      </div>

      {/* Hint text */}
      {hint && !error && (
        <p id={hintId} className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {hint}
        </p>
      )}

      {/* Error message */}
      {error && (
        <motion.p
          id={errorId}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start"
          role="alert"
        >
          <ExclamationTriangleIcon className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  )
})

// Enhanced Select with search and accessibility
export const AccessibleSelect = forwardRef(({ 
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  error,
  hint,
  required = false,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const selectRef = useRef(null)
  const listboxRef = useRef(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  const selectId = useRef(`select-${Math.random().toString(36).substr(2, 9)}`)
  const listboxId = `${selectId.current}-listbox`
  const hintId = hint ? `${selectId.current}-hint` : undefined
  const errorId = error ? `${selectId.current}-error` : undefined

  // Filter options based on search query
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  // Get selected option
  const selectedOption = options.find(option => option.value === value)

  // Handle option selection
  const handleSelect = (option) => {
    onChange?.(option.value)
    setIsOpen(false)
    setSearchQuery('')
    setFocusedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          setIsOpen(true)
          setFocusedIndex(0)
        } else if (focusedIndex >= 0) {
          handleSelect(filteredOptions[focusedIndex])
        }
        e.preventDefault()
        break
      case 'Escape':
        setIsOpen(false)
        setFocusedIndex(-1)
        selectRef.current?.focus()
        break
      case 'ArrowDown':
        if (isOpen) {
          setFocusedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
        } else {
          setIsOpen(true)
          setFocusedIndex(0)
        }
        e.preventDefault()
        break
      case 'ArrowUp':
        if (isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
        }
        e.preventDefault()
        break
    }
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId.current}
          className={`
            block text-sm font-medium mb-2 transition-colors duration-200
            ${error 
              ? 'text-red-700 dark:text-red-400' 
              : 'text-gray-700 dark:text-gray-300'
            }
          `}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}

      {/* Select button */}
      <button
        ref={ref}
        id={selectId.current}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={label ? `${selectId.current}-label` : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-4 py-3 text-left bg-white dark:bg-gray-800 border rounded-xl
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500' 
            : isOpen 
              ? 'border-blue-300 dark:border-blue-600' 
              : 'border-gray-300 dark:border-gray-600'
          }
          text-gray-900 dark:text-white flex items-center justify-between
        `}
        {...props}
      >
        <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Search input */}
            {searchable && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Options list */}
            <div 
              ref={listboxRef}
              role="listbox"
              id={listboxId}
              className="max-h-60 overflow-y-auto"
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full text-left px-4 py-3 text-sm transition-colors duration-150
                      ${option.value === value 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200' 
                        : index === focusedIndex
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {option.value === value && (
                        <CheckIcon className="w-4 h-4 text-blue-600" aria-hidden="true" />
                      )}
                    </div>
                    {option.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint text */}
      {hint && !error && (
        <p id={hintId} className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {hint}
        </p>
      )}

      {/* Error message */}
      {error && (
        <motion.p
          id={errorId}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-start"
          role="alert"
        >
          <ExclamationTriangleIcon className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  )
})

// Enhanced Alert component
export const AccessibleAlert = ({ 
  type = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
  ...props 
}) => {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const alertConfig = {
    success: {
      icon: CheckIcon,
      colors: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      iconColors: 'text-green-400'
    },
    error: {
      icon: XMarkIcon,
      colors: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      iconColors: 'text-red-400'
    },
    warning: {
      icon: ExclamationTriangleIcon,
      colors: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
      iconColors: 'text-yellow-400'
    },
    info: {
      icon: InformationCircleIcon,
      colors: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      iconColors: 'text-blue-400'
    }
  }

  const config = alertConfig[type]
  const Icon = config.icon

  if (dismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      role="alert"
      className={`
        relative p-4 border rounded-xl ${config.colors} ${className}
      `}
      {...props}
    >
      <div className="flex items-start">
        <Icon className={`w-5 h-5 mt-0.5 mr-3 flex-shrink-0 ${config.iconColors}`} />
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-2">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={`ml-3 -mr-1 -mt-1 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-75 ${config.iconColors}`}
            aria-label="Dismiss alert"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// Screen reader only content
export const ScreenReaderOnly = ({ children, ...props }) => (
  <span 
    className="sr-only"
    {...props}
  >
    {children}
  </span>
)

// Skip link for keyboard navigation
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    {children}
  </a>
)

export default {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
  AccessibleAlert,
  ScreenReaderOnly,
  SkipLink
}