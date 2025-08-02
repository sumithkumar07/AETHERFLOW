import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MicrophoneIcon,
  StopIcon,
  SpeakerWaveIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAdvancedFeaturesStore } from '../store/advancedFeaturesStore'
import toast from 'react-hot-toast'

const VoiceCommandProcessor = ({ projectId, onCommand }) => {
  const { 
    voiceInterface,
    initializeVoiceInterface,
    startVoiceListening,
    stopVoiceListening,
    processVoiceCommand
  } = useAdvancedFeaturesStore()

  const [recognition, setRecognition] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    initializeVoiceInterface()
  }, [])

  const handleStartListening = () => {
    if (!voiceInterface.isSupported) {
      toast.error('Voice recognition is not supported in this browser')
      return
    }

    const recognitionInstance = startVoiceListening()
    setRecognition(recognitionInstance)
  }

  const handleStopListening = () => {
    if (recognition) {
      stopVoiceListening(recognition)
      setRecognition(null)
      
      // Process the command if we have a transcript
      if (voiceInterface.transcript) {
        handleProcessCommand(voiceInterface.transcript)
      }
    }
  }

  const handleProcessCommand = async (command) => {
    if (!command.trim()) return

    setIsProcessing(true)
    
    try {
      const result = await processVoiceCommand(command)
      
      if (result.success && onCommand) {
        onCommand({
          type: 'voice_command',
          command: command,
          action: result.action,
          projectId: projectId
        })
      }
    } catch (error) {
      console.error('Voice command processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!voiceInterface.isSupported) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Voice Recognition Not Available</span>
        </div>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
          Your browser doesn't support speech recognition
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 dark:text-white">Voice Commands</h3>
      
      {/* Voice Control Interface */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <SpeakerWaveIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-100">Voice Assistant</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {voiceInterface.isListening ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStopListening}
                className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                <StopIcon className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartListening}
                className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                <MicrophoneIcon className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${
            voiceInterface.isListening 
              ? 'bg-green-500 animate-pulse' 
              : isProcessing
              ? 'bg-yellow-500'
              : 'bg-gray-400'
          }`} />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {voiceInterface.isListening 
              ? 'Listening...' 
              : isProcessing
              ? 'Processing command...'
              : 'Ready'}
          </span>
        </div>

        {/* Transcript Display */}
        {voiceInterface.transcript && (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
              "{voiceInterface.transcript}"
            </p>
          </div>
        )}

        {/* Available Commands */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Commands:</h4>
          <div className="space-y-1">
            {[
              "Show files",
              "Run tests", 
              "Start build",
              "Deploy project",
              "Switch to chat",
              "Open settings"
            ].map((command, index) => (
              <div key={index} className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                "{command}"
              </div>
            ))}
          </div>
        </div>

        {voiceInterface.error && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
            Error: {voiceInterface.error}
          </div>
        )}
      </div>

      {/* Quick Command Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { command: "show project files", label: "Show Files" },
          { command: "run all tests", label: "Run Tests" },
          { command: "start project build", label: "Start Build" },
          { command: "deploy to production", label: "Deploy" }
        ].map((item, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleProcessCommand(item.command)}
            disabled={isProcessing}
            className="p-2 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {item.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default VoiceCommandProcessor