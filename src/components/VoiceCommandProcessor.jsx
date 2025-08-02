import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MicrophoneIcon,
  StopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const VoiceCommandProcessor = ({ 
  projectId, 
  onCommand, 
  className = '' 
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [volume, setVolume] = useState(0)
  
  const recognition = useRef(null)
  const volumeAnalyzer = useRef(null)
  const audioContext = useRef(null)

  // Available voice commands
  const commands = {
    navigation: [
      { pattern: /show (files|file structure|project files)/i, action: 'show_files' },
      { pattern: /go to (chat|chat hub|projects)/i, action: 'chat_hub' },
      { pattern: /open (settings|preferences)/i, action: 'open_settings' }
    ],
    project: [
      { pattern: /create (new )?project/i, action: 'create_project' },
      { pattern: /build (project|app)/i, action: 'build_project' },
      { pattern: /deploy (project|app)/i, action: 'deploy_project' }
    ],
    ai: [
      { pattern: /switch to (developer|designer|tester|integrator|analyst) agent/i, action: 'switch_agent' },
      { pattern: /use (gpt|claude|gemini) model/i, action: 'switch_model' },
      { pattern: /help me with (.+)/i, action: 'ai_help' }
    ]
  }

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = true
      recognition.current.lang = 'en-US'

      recognition.current.onstart = () => {
        setIsListening(true)
        startVolumeMonitoring()
        toast.success('Voice command activated', { icon: '🎤' })
      }

      recognition.current.onresult = (event) => {
        const result = event.results[event.results.length - 1]
        const transcript = result[0].transcript
        setTranscript(transcript)

        if (result.isFinal) {
          processVoiceCommand(transcript)
        }
      }

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setIsProcessing(false)
        stopVolumeMonitoring()
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied')
        } else {
          toast.error('Voice recognition error')
        }
      }

      recognition.current.onend = () => {
        setIsListening(false)
        setIsProcessing(false)
        setTranscript('')
        stopVolumeMonitoring()
      }
    }

    return () => {
      if (recognition.current) {
        recognition.current.abort()
      }
      stopVolumeMonitoring()
    }
  }, [])

  const startVolumeMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)()
      
      const analyser = audioContext.current.createAnalyser()
      const microphone = audioContext.current.createMediaStreamSource(stream)
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      analyser.fftSize = 256
      microphone.connect(analyser)
      
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
        setVolume(average)
        
        if (isListening) {
          requestAnimationFrame(updateVolume)
        }
      }
      
      updateVolume()
      volumeAnalyzer.current = { stream, analyser, microphone }
    } catch (error) {
      console.error('Failed to access microphone:', error)
    }
  }

  const stopVolumeMonitoring = () => {
    if (volumeAnalyzer.current) {
      volumeAnalyzer.current.stream.getTracks().forEach(track => track.stop())
      volumeAnalyzer.current = null
    }
    if (audioContext.current) {
      audioContext.current.close()
      audioContext.current = null
    }
    setVolume(0)
  }

  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice commands not supported in this browser')
      return
    }

    if (recognition.current && !isListening) {
      setTranscript('')
      recognition.current.start()
    }
  }

  const stopListening = () => {
    if (recognition.current && isListening) {
      recognition.current.stop()
    }
  }

  const processVoiceCommand = async (transcript) => {
    setIsProcessing(true)
    
    try {
      const lowerTranscript = transcript.toLowerCase()
      let commandFound = false

      // Check all command categories
      for (const [category, categoryCommands] of Object.entries(commands)) {
        for (const command of categoryCommands) {
          const match = transcript.match(command.pattern)
          if (match) {
            const commandData = {
              type: category,
              action: command.action,
              transcript,
              match: match[1] || null // Capture group if exists
            }
            
            await onCommand(commandData)
            toast.success(`Command executed: ${command.action}`, { icon: '✓' })
            commandFound = true
            break
          }
        }
        if (commandFound) break
      }

      if (!commandFound) {
        // Fallback: treat as AI query
        if (onCommand) {
          await onCommand({
            type: 'ai_query',
            action: 'send_message',
            transcript,
            message: transcript
          })
          toast.success('Voice message sent to AI', { icon: '🤖' })
        }
      }
    } catch (error) {
      console.error('Voice command processing error:', error)
      toast.error('Failed to process voice command')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isSupported) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <SpeakerXMarkIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Voice commands not supported
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-2">
        <MicrophoneIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Voice Commands
        </h3>
      </div>

      {/* Voice Control Interface */}
      <div className="space-y-4">
        {/* Main Control Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                : isProcessing
                ? 'bg-yellow-500 text-white cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isListening ? (
              <StopIcon className="w-8 h-8" />
            ) : isProcessing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <MicrophoneIcon className="w-8 h-8" />
            )}

            {/* Volume visualization */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-red-300"
                animate={{ 
                  scale: 1 + (volume / 255) * 0.5,
                  opacity: 0.3 + (volume / 255) * 0.7
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            )}
          </motion.button>
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {isListening 
              ? 'Listening...' 
              : isProcessing 
              ? 'Processing...' 
              : 'Click to start voice command'
            }
          </p>
        </div>

        {/* Live Transcript */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700"
            >
              <div className="flex items-center space-x-2 mb-2">
                <SpeakerWaveIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Transcript:
                </span>
              </div>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                "{transcript}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Command Examples */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Try these commands:
          </h4>
          
          <div className="space-y-2">
            {[
              { category: 'Navigation', commands: ['Show files', 'Go to chat hub'] },
              { category: 'Project', commands: ['Create new project', 'Build project'] },
              { category: 'AI', commands: ['Switch to developer agent', 'Help me with authentication'] }
            ].map((group) => (
              <div key={group.category} className="text-xs">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  {group.category}:
                </span>
                <div className="ml-2 space-y-1">
                  {group.commands.map((command) => (
                    <div key={command} className="text-gray-500 dark:text-gray-500">
                      • "{command}"
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${
            isListening 
              ? 'bg-red-500 animate-pulse' 
              : isProcessing
              ? 'bg-yellow-500 animate-pulse'
              : 'bg-green-500'
          }`} />
          <span className="text-gray-500 dark:text-gray-400">
            {isListening 
              ? 'Active' 
              : isProcessing 
              ? 'Processing' 
              : 'Ready'
            }
          </span>
        </div>
      </div>
    </div>
  )
}

export default VoiceCommandProcessor