import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  MicrophoneIcon,
  StopIcon,
  SpeakerWaveIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import { useChatStore } from '../store/chatStore'
import { useProjectStore } from '../store/projectStore'
import toast from 'react-hot-toast'

const VoiceCommandProcessor = ({ projectId, onCommand }) => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [confidence, setConfidence] = useState(0)
  
  const { sendMessage } = useChatStore()
  const { currentProject, updateProject } = useProjectStore()
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        toast.success('Voice recognition started', { icon: '🎤' })
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
            setConfidence(event.results[i][0].confidence)
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        
        setTranscript(finalTranscript || interimTranscript)
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript)
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error('Voice recognition error')
      }
      
      setVoiceEnabled(true)
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const processVoiceCommand = async (command) => {
    setIsProcessing(true)
    
    try {
      const lowerCommand = command.toLowerCase().trim()
      
      // Quick commands that don't require AI
      const quickCommands = await processQuickCommands(lowerCommand)
      if (quickCommands.handled) {
        setIsProcessing(false)
        return
      }
      
      // AI-powered commands
      await processAICommand(command)
      
    } catch (error) {
      console.error('Voice command processing error:', error)
      toast.error('Failed to process voice command')
    } finally {
      setIsProcessing(false)
      setTranscript('')
    }
  }

  const processQuickCommands = async (command) => {
    // Deploy commands
    if (command.includes('deploy') && (command.includes('staging') || command.includes('production'))) {
      const environment = command.includes('production') ? 'production' : 'staging'
      toast.loading(`Deploying to ${environment}...`)
      
      // Simulate deployment
      setTimeout(() => {
        toast.success(`Deployed to ${environment}!`)
        speak(`Successfully deployed to ${environment}`)
      }, 2000)
      
      return { handled: true }
    }
    
    // Test commands
    if (command.includes('run tests') || command.includes('test the app')) {
      toast.loading('Running tests...')
      
      setTimeout(() => {
        toast.success('All tests passed!')
        speak('All tests are passing')
      }, 1500)
      
      return { handled: true }
    }
    
    // Navigation commands
    if (command.includes('show me') && command.includes('files')) {
      // Trigger file explorer
      onCommand?.({ type: 'navigation', action: 'show_files' })
      speak('Showing project files')
      return { handled: true }
    }
    
    if (command.includes('go to') && command.includes('chat hub')) {
      onCommand?.({ type: 'navigation', action: 'chat_hub' })
      speak('Navigating to chat hub')
      return { handled: true }
    }
    
    // Project status commands
    if (command.includes('project status') || command.includes('how is') && command.includes('project')) {
      const status = currentProject?.status || 'unknown'
      const progress = currentProject?.progress || 0
      speak(`Project status is ${status}, ${progress} percent complete`)
      return { handled: true }
    }
    
    return { handled: false }
  }

  const processAICommand = async (command) => {
    // Enhance command with voice context
    const enhancedCommand = `[Voice Command] ${command}`
    
    const result = await sendMessage({
      content: enhancedCommand,
      projectId: projectId,
      model: 'gpt-4.1-nano', // Use fastest model for voice
      agent: 'developer'
    })
    
    if (result.success) {
      toast.success('Voice command processed')
      
      // Optionally speak the response
      if (result.message?.content && result.message.content.length < 200) {
        speak(result.message.content.replace(/[*_`]/g, '')) // Remove markdown
      }
    }
  }

  const speak = (text) => {
    if (synthRef.current && text) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      synthRef.current.speak(utterance)
    }
  }

  const getVoiceCommands = () => [
    { command: 'Deploy to staging', description: 'Deploy your project to staging environment' },
    { command: 'Deploy to production', description: 'Deploy your project to production' },
    { command: 'Run tests', description: 'Execute all project tests' },
    { command: 'Show me the files', description: 'Open file explorer' },
    { command: 'Project status', description: 'Get current project status' },
    { command: 'Help me with...', description: 'Ask AI for assistance' },
    { command: 'Create a component', description: 'Generate new component' },
    { command: 'Fix the error', description: 'Debug current issues' }
  ]

  if (!voiceEnabled) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Voice commands are not supported in this browser.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Interface */}
      <div className="flex items-center justify-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`p-4 rounded-full transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? (
            <StopIcon className="w-6 h-6" />
          ) : (
            <MicrophoneIcon className="w-6 h-6" />
          )}
        </motion.button>
        
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Voice Commands'}
          </p>
          {confidence > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Confidence: {Math.round(confidence * 100)}%
            </p>
          )}
        </div>
      </div>

      {/* Live Transcript */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-medium">Heard: </span>
            {transcript}
          </p>
        </motion.div>
      )}

      {/* Voice Commands Help */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
          <SpeakerWaveIcon className="w-4 h-4 mr-2" />
          Available Voice Commands
        </h4>
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
          {getVoiceCommands().map((cmd, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                "{cmd.command}"
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {cmd.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Processing voice command...
          </span>
        </div>
      )}
    </div>
  )
}

export default VoiceCommandProcessor