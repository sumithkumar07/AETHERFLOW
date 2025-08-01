import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MicrophoneIcon, StopIcon, SpeakerWaveIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const VoiceInterface = ({ onClose, onCommandExecuted }) => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState(null)
  const [conversationHistory, setConversationHistory] = useState([])
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  
  const { token } = useAuthStore()
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recognitionRef = useRef(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
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
        toast.error('Speech recognition error. Please try again.')
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = useCallback(async () => {
    try {
      if (recognitionRef.current) {
        setIsListening(true)
        setTranscript('')
        setResponse(null)
        recognitionRef.current.start()
      } else {
        // Fallback: use audio recording
        await startAudioRecording()
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      toast.error('Could not start voice recognition')
      setIsListening(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    setIsListening(false)
  }, [isListening])

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processAudioCommand(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start()
      setIsListening(true)
    } catch (error) {
      console.error('Error starting audio recording:', error)
      toast.error('Could not access microphone')
    }
  }

  const processVoiceCommand = async (textInput) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/voice/process-voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text_input: textInput })
      })
      
      if (!response.ok) {
        throw new Error('Failed to process voice command')
      }
      
      const data = await response.json()
      setResponse(data.result)
      
      // Add to conversation history
      const newInteraction = {
        timestamp: new Date().toISOString(),
        input: textInput,
        response: data.result
      }
      
      setConversationHistory(prev => [...prev, newInteraction])
      
      // Execute command if applicable
      if (onCommandExecuted && data.result.actions) {
        onCommandExecuted(data.result)
      }
      
      // Speak response if voice is enabled
      if (voiceEnabled && data.result.response_text) {
        speakResponse(data.result.response_text)
      }
      
    } catch (error) {
      console.error('Error processing voice command:', error)
      toast.error('Failed to process voice command')
    } finally {
      setIsProcessing(false)
    }
  }

  const processAudioCommand = async (audioBlob) => {
    setIsProcessing(true)
    
    try {
      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'voice_command.wav')
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/voice/process-audio`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to process audio command')
      }
      
      const data = await response.json()
      setResponse(data.result)
      
      // Add to conversation history
      const newInteraction = {
        timestamp: new Date().toISOString(),
        input: '[Audio Command]',
        response: data.result
      }
      
      setConversationHistory(prev => [...prev, newInteraction])
      
      // Execute command if applicable
      if (onCommandExecuted && data.result.actions) {
        onCommandExecuted(data.result)
      }
      
      // Speak response if voice is enabled
      if (voiceEnabled && data.result.response_text) {
        speakResponse(data.result.response_text)
      }
      
    } catch (error) {
      console.error('Error processing audio command:', error)
      toast.error('Failed to process audio command')
    } finally {
      setIsProcessing(false)
    }
  }

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      // Use a more natural voice if available
      const voices = speechSynthesis.getVoices()
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Alex') || 
        voice.name.includes('Samantha')
      )
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      speechSynthesis.speak(utterance)
    }
  }

  const processTextInput = async (text) => {
    if (!text.trim()) return
    
    await processVoiceCommand(text.trim())
    setTranscript('')
  }

  const executeAction = async (action) => {
    try {
      // Handle different action types
      switch (action) {
        case 'setup_structure':
          toast.success('Setting up project structure...')
          break
        case 'add_integrations':
          toast.success('Opening integrations marketplace...')
          break
        case 'open_editor':
          toast.success('Opening code editor...')
          break
        case 'select_template':
          toast.success('Opening template selection...')
          break
        case 'monitor_deployment':
          toast.success('Opening deployment monitor...')
          break
        default:
          toast.info(`Executing: ${action}`)
      }
      
      // Notify parent component
      if (onCommandExecuted) {
        onCommandExecuted({ action })
      }
    } catch (error) {
      console.error('Error executing action:', error)
      toast.error('Failed to execute action')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MicrophoneIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Voice Assistant
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Speak or type your command
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                voiceEnabled 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              }`}
              title={voiceEnabled ? 'Voice responses enabled' : 'Voice responses disabled'}
            >
              <SpeakerWaveIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[500px]">
          {/* Voice Control */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-4">
              <motion.button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isListening ? (
                  <StopIcon className="w-6 h-6" />
                ) : (
                  <MicrophoneIcon className="w-6 h-6" />
                )}
                
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-300"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </motion.button>
              
              <div className="flex-1">
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      processTextInput(transcript)
                    }
                  }}
                  placeholder={isListening ? "Listening..." : "Type your command or click to speak"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isListening || isProcessing}
                />
              </div>
              
              <button
                onClick={() => processTextInput(transcript)}
                disabled={!transcript.trim() || isProcessing}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                Send
              </button>
            </div>
            
            {isProcessing && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-2 text-sm">Processing...</span>
              </div>
            )}
          </div>

          {/* Response Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {response ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      AI Response:
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200">
                      {response.response_text}
                    </p>
                  </div>

                  {response.data && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Details:
                      </h4>
                      <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {JSON.stringify(response.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {response.actions && response.actions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Quick Actions:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {response.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => executeAction(action)}
                            className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/50 dark:hover:bg-purple-900/70 text-purple-700 dark:text-purple-300 rounded-lg transition-colors"
                          >
                            {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {response.next_suggestions && response.next_suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        Try saying:
                      </h4>
                      <div className="space-y-1">
                        {response.next_suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => processTextInput(suggestion)}
                            className="block w-full text-left px-3 py-2 text-sm bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                          >
                            "{suggestion}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-500 dark:text-gray-400 py-12"
                >
                  <MicrophoneIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click the microphone button or type to get started</p>
                  <div className="mt-4 text-sm space-y-1">
                    <p>Try saying:</p>
                    <p className="italic">"Create a new React project"</p>
                    <p className="italic">"Show me templates"</p>
                    <p className="italic">"Deploy my app"</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default VoiceInterface