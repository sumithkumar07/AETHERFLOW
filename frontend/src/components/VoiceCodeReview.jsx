import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MicrophoneIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const VoiceCodeReview = ({ projectId, projectName }) => {
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioResponse, setAudioResponse] = useState(null)
  const [voiceCommands, setVoiceCommands] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef(null)
  const audioRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        toast.success('Voice recognition started')
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript)
          processVoiceCommand(finalTranscript)
        }
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        toast.error('Voice recognition error: ' + event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Predefined voice commands
  const commandPatterns = [
    {
      pattern: /explain.*code|what.*this.*code|code.*explanation/i,
      action: 'explain_code',
      description: 'Explains the current code section'
    },
    {
      pattern: /review.*code|code.*review|analyze.*code/i,
      action: 'review_code',
      description: 'Reviews code for improvements'
    },
    {
      pattern: /find.*bug|debug.*code|what.*wrong/i,
      action: 'debug_code',
      description: 'Analyzes code for potential bugs'
    },
    {
      pattern: /optimize.*code|improve.*performance|make.*faster/i,
      action: 'optimize_code',
      description: 'Suggests performance optimizations'
    },
    {
      pattern: /add.*comment|document.*code|add.*documentation/i,
      action: 'add_documentation',
      description: 'Generates code documentation'
    },
    {
      pattern: /refactor.*code|clean.*code|improve.*structure/i,
      action: 'refactor_code',
      description: 'Suggests code refactoring'
    }
  ]

  const processVoiceCommand = async (transcript) => {
    setIsProcessing(true)
    
    try {
      // Match command pattern
      const matchedCommand = commandPatterns.find(cmd => 
        cmd.pattern.test(transcript)
      )
      
      if (matchedCommand) {
        const command = {
          id: Date.now(),
          transcript,
          action: matchedCommand.action,
          description: matchedCommand.description,
          timestamp: new Date()
        }
        
        setVoiceCommands(prev => [command, ...prev.slice(0, 4)])
        
        // Process the command
        const response = await processCodeCommand(matchedCommand.action, transcript)
        
        // Generate audio response
        await generateAudioResponse(response)
        
        toast.success(`Command executed: ${matchedCommand.description}`)
      } else {
        toast.info('Command not recognized. Try "explain this code" or "review code"')
      }
    } catch (error) {
      console.error('Voice command processing error:', error)
      toast.error('Failed to process voice command')
    } finally {
      setIsProcessing(false)
    }
  }

  const processCodeCommand = async (action, transcript) => {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const responses = {
      explain_code: `This code section implements a React component with state management. The component uses hooks to manage local state and effects to handle side effects. The structure follows modern React patterns with functional components and the composition pattern for reusability.`,
      
      review_code: `Code review complete. I found several areas for improvement: 1. Consider adding error boundaries for better error handling. 2. Extract inline functions to prevent unnecessary re-renders. 3. Add PropTypes or TypeScript for better type safety. 4. Consider memoizing expensive calculations.`,
      
      debug_code: `I've analyzed the code for potential bugs. Found: 1. Missing null checks on props that could be undefined. 2. Possible memory leak from event listeners not being cleaned up. 3. Race condition in async operations. I recommend adding proper error handling and cleanup functions.`,
      
      optimize_code: `Performance analysis complete. Suggestions: 1. Use React.memo for components that don't need frequent re-renders. 2. Implement virtual scrolling for large lists. 3. Lazy load components that aren't immediately visible. 4. Use useCallback for event handlers to prevent child re-renders.`,
      
      add_documentation: `I've generated comprehensive documentation for this code. Added JSDoc comments explaining the purpose, parameters, and return values. Also included examples of usage and notes about any side effects or dependencies.`,
      
      refactor_code: `Refactoring suggestions: 1. Extract complex logic into custom hooks. 2. Break down large components into smaller, focused components. 3. Use composition over inheritance. 4. Implement proper separation of concerns with dedicated service layers.`
    }
    
    return responses[action] || "I've processed your request. The code analysis is complete."
  }

  const generateAudioResponse = async (text) => {
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => {
        setIsPlaying(false)
        toast.error('Audio playback failed')
      }
      
      window.speechSynthesis.speak(utterance)
      setAudioResponse(utterance)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const toggleAudioPlayback = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    } else if (audioResponse) {
      window.speechSynthesis.speak(audioResponse)
      setIsPlaying(true)
    }
  }

  const quickCommands = [
    { text: 'Explain this code', icon: DocumentTextIcon },
    { text: 'Review code', icon: CheckCircleIcon },
    { text: 'Find bugs', icon: ExclamationTriangleIcon },
    { text: 'Optimize performance', icon: CodeBracketIcon }
  ]

  return (
    <div className="fixed bottom-20 left-6 z-40">
      {/* Voice Control Button */}
      <motion.button
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-gradient-to-br from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MicrophoneIcon className="w-6 h-6 text-white" />
      </motion.button>

      {/* Voice Interface Panel */}
      <AnimatePresence>
        {(isListening || voiceCommands.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="absolute bottom-16 left-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl w-80 p-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                  <SpeakerWaveIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Voice Code Review
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isListening ? 'Listening...' : 'Voice commands ready'}
                  </p>
                </div>
              </div>
              {isPlaying && (
                <button
                  onClick={toggleAudioPlayback}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <PauseIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}
            </div>

            {/* Current Transcript */}
            {isListening && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  {transcript || 'Say something...'}
                </p>
                {isProcessing && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-xs text-blue-600 dark:text-blue-400">Processing...</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Commands */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Quick Commands:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {quickCommands.map((command, index) => {
                  const Icon = command.icon
                  return (
                    <button
                      key={index}
                      onClick={() => processVoiceCommand(command.text)}
                      disabled={isProcessing}
                      className="p-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 transition-colors text-left group disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {command.text}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Recent Commands */}
            {voiceCommands.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Recent Commands:
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {voiceCommands.map((command) => (
                    <div
                      key={command.id}
                      className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {command.description}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        "{command.transcript}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {isListening ? 'Listening for commands...' : 'Click mic to start'}
                </span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-400">
                    {isListening ? 'Active' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VoiceCodeReview