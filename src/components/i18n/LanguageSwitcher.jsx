import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useI18n } from './I18nProvider'

const LanguageSwitcher = ({ className = '', showLabel = true }) => {
  const { currentLanguage, supportedLanguages, changeLanguage, isLoading } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage)

  const handleLanguageChange = async (languageCode) => {
    setIsOpen(false)
    await changeLanguage(languageCode)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <GlobeAltIcon className="w-4 h-4" />
        {showLabel && (
          <>
            <span>{currentLang?.native || currentLang?.name || 'English'}</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto"
          >
            <div className="py-2">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    language.code === currentLanguage
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {language.code.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{language.native}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {language.name}
                      </div>
                    </div>
                  </div>
                  {language.code === currentLanguage && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Language completion stats */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {supportedLanguages.length} languages supported
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                Powered by AI Tempo i18n
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default LanguageSwitcher