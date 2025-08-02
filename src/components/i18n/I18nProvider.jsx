import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const I18nContext = createContext()

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', native: 'Español', direction: 'ltr' },
  { code: 'fr', name: 'French', native: 'Français', direction: 'ltr' },
  { code: 'de', name: 'German', native: 'Deutsch', direction: 'ltr' },
  { code: 'it', name: 'Italian', native: 'Italiano', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', native: 'Português', direction: 'ltr' },
  { code: 'ru', name: 'Russian', native: 'Русский', direction: 'ltr' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', native: '日本語', direction: 'ltr' },
  { code: 'ko', name: 'Korean', native: '한국어', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', native: 'العربية', direction: 'rtl' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', direction: 'ltr' }
]

const DEFAULT_TRANSLATIONS = {
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter'
    },
    nav: {
      home: 'Home',
      templates: 'Templates',
      chat: 'Chat',
      integrations: 'Integrations',
      settings: 'Settings',
      login: 'Sign In',
      signup: 'Sign Up'
    },
    home: {
      title: 'Code with AI Tempo',
      subtitle: 'Build applications through conversation. Deploy with a thought. Experience the rhythm of AI-powered development.',
      start_coding: 'Start Coding',
      explore_templates: 'Explore Templates'
    },
    features: {
      conversational_coding: 'Conversational Coding',
      multi_agent: 'Multi-Agent Intelligence',
      live_editor: 'Live Code Editor',
      instant_deployment: 'Instant Deployment'
    },
    chat: {
      welcome: 'Welcome back, {name}!',
      ready_to_build: 'Ready to build something amazing?',
      project_idea_placeholder: 'Describe your project idea in detail... The more context you provide, the better our AI can assist you!'
    },
    auth: {
      email: 'Email',
      password: 'Password',
      login_success: 'Login successful! Welcome to AI Tempo.'
    },
    projects: {
      recent: 'Recent Projects',
      create_new: 'Create New Project',
      status: {
        active: 'Active',
        completed: 'Completed'
      }
    },
    templates: {
      title: 'Templates',
      description: 'Discover production-ready templates for web apps, mobile apps, APIs, and more.'
    },
    error: {
      generic: 'An error occurred. Please try again.',
      network: 'Network error. Please check your connection.'
    }
  }
}

export const I18nProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useLocalStorage('ai-tempo-language', 'en')
  const [translations, setTranslations] = useState(DEFAULT_TRANSLATIONS)
  const [isLoading, setIsLoading] = useState(false)

  // Load translations for a specific language
  const loadTranslations = async (languageCode) => {
    if (translations[languageCode]) {
      return // Already loaded
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/i18n/frontend/${languageCode}`)
      if (response.ok) {
        const data = await response.json()
        setTranslations(prev => ({
          ...prev,
          [languageCode]: data.translations
        }))
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${languageCode}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  // Change language
  const changeLanguage = async (languageCode) => {
    if (languageCode === currentLanguage) return

    await loadTranslations(languageCode)
    setCurrentLanguage(languageCode)

    // Update document direction
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode)
    document.documentElement.dir = language?.direction || 'ltr'
    document.documentElement.lang = languageCode
  }

  // Get translation function
  const t = (key, params = {}, count = null) => {
    const keys = key.split('.')
    let value = translations[currentLanguage]

    // Navigate through nested keys
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // Fallback to English
        value = DEFAULT_TRANSLATIONS.en
        for (const k of keys) {
          if (value && typeof value === 'object') {
            value = value[k]
          } else {
            return key // Return key if translation not found
          }
        }
        break
      }
    }

    // Handle pluralization
    if (count !== null && typeof value === 'object') {
      if (count === 0 && value.zero) {
        value = value.zero
      } else if (count === 1 && value.one) {
        value = value.one
      } else if (value.other) {
        value = value.other
      }
    } else if (typeof value === 'object' && value.other) {
      value = value.other
    }

    // Handle parameter interpolation
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([param, paramValue]) => {
        value = value.replace(new RegExp(`{${param}}`, 'g'), paramValue)
      })
    }

    return typeof value === 'string' ? value : key
  }

  // Format date according to current locale
  const formatDate = (date, options = { dateStyle: 'medium' }) => {
    try {
      return new Intl.DateTimeFormat(currentLanguage, options).format(date)
    } catch {
      return date.toLocaleDateString()
    }
  }

  // Format number according to current locale
  const formatNumber = (number, options = {}) => {
    try {
      return new Intl.NumberFormat(currentLanguage, options).format(number)
    } catch {
      return number.toString()
    }
  }

  // Get current language info
  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0]
  }

  // Initialize
  useEffect(() => {
    // Detect browser language if no language is set
    if (!currentLanguage) {
      const browserLang = navigator.language.split('-')[0]
      const supportedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang)
      if (supportedLang) {
        changeLanguage(supportedLang.code)
      }
    } else {
      // Load translations for current language
      loadTranslations(currentLanguage)
    }

    // Set initial document properties
    const language = getCurrentLanguage()
    document.documentElement.dir = language.direction
    document.documentElement.lang = currentLanguage
  }, [])

  const value = {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    t,
    formatDate,
    formatNumber,
    getCurrentLanguage,
    isLoading,
    isRTL: getCurrentLanguage().direction === 'rtl'
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export default I18nProvider