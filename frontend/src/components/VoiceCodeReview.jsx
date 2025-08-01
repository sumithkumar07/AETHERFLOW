import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MicrophoneIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  CodeBracketIcon,
  BugAntIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const VoiceCodeReview = ({ 
  isVisible, 
  onClose, 
  codeContent = "",
  reviewType = "general" 
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [reviewSession, setReviewSession] = useState(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [audioText, setAudioText] = useState('')
  const [reviewProgress, setReviewProgress] = useState(0)
  const { user } = useAuthStore()
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)

  useEffect(() => {
    if (isVisible && codeContent) {
      initializeVoiceReview()
    }

    // Initialize speech recognition and synthesis
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          handleVoiceCommand(finalTranscript.toLowerCase().trim())
        }
      }
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      stopListening()
      stopSpeaking()
    }
  }, [isVisible, codeContent])

  const initializeVoiceReview = async () => {
    try {
      const response = await fetch('/api/voice-review/start-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          code_content: codeContent,
          review_type: reviewType
        })
      })

      const data = await response.json()
      if (data.review_session) {
        setSessionId(data.review_session.session_id)
        setReviewSession(data.review_session)
        setAudioText(data.first_audio)
        toast.success('Voice review session started!')
        
        // Start with first section
        if (data.first_audio) {
          speakText(data.first_audio)
        }
      }
    } catch (error) {
      console.error('Failed to start voice review:', error)
      toast.error('Failed to start voice review')
    }
  }

  const speakText = (text) => {
    if (!synthRef.current || !text) return

    stopSpeaking() // Stop any current speech

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      setIsPlaying(true)
      setAudioText(text)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setTimeout(() => {
        startListening() // Start listening for commands after speech ends
      }, 500)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsPlaying(false)
    }

    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsPlaying(false)
    }
  }

  const startListening = () => {
    if (!recognitionRef.current || isListening) return

    try {
      recognitionRef.current.start()
      setIsListening(true)
      setTranscript('')
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
    }
  }

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return

    try {
      recognitionRef.current.stop()
      setIsListening(false)
    } catch (error) {
      console.error('Failed to stop speech recognition:', error)
    }
  }

  const handleVoiceCommand = async (command) => {
    if (!sessionId) return

    try {
      const response = await fetch('/api/voice-review/voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          voice_command: command
        })
      })

      const data = await response.json()
      if (data.command_response) {
        const response = data.command_response
        
        switch (response.action) {
          case 'next_section':
            setCurrentSection(prev => prev + 1)
            setReviewProgress((currentSection + 1) / (reviewSession?.voice_script?.sections?.length || 1) * 100)
            speakText(response.audio_text)
            break
            
          case 'repeat':
            speakText(response.audio_text)
            break
            
          case 'detailed_explanation':
            speakText(response.audio_text)
            break
            
          case 'review_complete':
            speakText(response.audio_text)
            setTimeout(() => {
              setReviewProgress(100)
              toast.success('Voice review completed!')
            }, 3000)
            break
            
          case 'unknown_command':
            speakText(response.audio_text)
            break
            
          default:
            console.log('Unknown voice command response:', response)
        }
      }
    } catch (error) {
      console.error('Failed to process voice command:', error)
    }
  }

  const getVoiceExplanation = async () => {
    if (!codeContent.trim()) {
      toast.error('Add some code to get voice explanation')
      return
    }

    try {
      const response = await fetch('/api/voice-review/voice-explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          code_snippet: codeContent,
          explanation_type: 'walkthrough',
          user_level: 'intermediate'
        })
      })

      const data = await response.json()
      if (data.voice_explanation && data.voice_explanation.segments) {
        const firstSegment = data.voice_explanation.segments[0]
        if (firstSegment) {
          speakText(firstSegment.audio_text)
          toast.success('Starting voice explanation')
        }
      }
    } catch (error) {
      console.error('Failed to get voice explanation:', error)
      toast.error('Failed to get voice explanation')
    }
  }

  const startDebuggingSession = async () => {
    toast.info('Debugging session - feature coming soon!')
    // This would integrate with the interactive debugging service
  }

  const getAvailableCommands = () => [
    { command: "next", description: "Move to next section" },
    { command: "repeat", description: "Repeat current section" },
    { command: "explain more", description: "Get detailed explanation" },
    { command: "skip this", description: "Skip current section" },
    { command: "end review", description: "End the review session" }
  ]

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MicrophoneIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Voice Code Review
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Interactive voice-guided code analysis
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Progress Bar */}
          {reviewSession && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Review Progress
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(reviewProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${reviewProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Audio Status */}
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-3 p-4 rounded-xl ${
                isPlaying ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <SpeakerWaveIcon className={`w-6 h-6 ${
                  isPlaying ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isPlaying ? 'Speaking...' : 'Ready to speak'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isPlaying ? 'AI is explaining your code' : 'Waiting for next command'}
                  </p>
                </div>
              </div>

              <div className={`flex items-center space-x-3 p-4 rounded-xl ${
                isListening ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <MicrophoneIcon className={`w-6 h-6 ${
                  isListening ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {isListening ? 'Listening...' : 'Ready to listen'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isListening ? 'Say a command' : 'Voice commands available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Audio Text */}
            {audioText && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-start space-x-3">
                  <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      AI is saying:
                    </p>
                    <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                      {audioText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex justify-center space-x-3">
              {!reviewSession ? (
                <>
                  <button
                    onClick={getVoiceExplanation}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CodeBracketIcon className="w-4 h-4" />
                    <span>Explain Code</span>
                  </button>
                  <button
                    onClick={startDebuggingSession}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <BugAntIcon className="w-4 h-4" />
                    <span>Debug Session</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => isPlaying ? stopSpeaking() : speakText(audioText)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isPlaying 
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>
                  
                  <button
                    onClick={() => isListening ? stopListening() : startListening()}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isListening 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    <MicrophoneIcon className="w-4 h-4" />
                    <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
                  </button>
                </>
              )}
            </div>

            {/* Voice Commands Help */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                Available Voice Commands
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getAvailableCommands().map((cmd, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded font-mono">
                      "{cmd.command}"
                    </kbd>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {cmd.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Info */}
            {reviewSession && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Session ID: {sessionId}</p>
                <p>Review Type: {reviewType}</p>
                <p>
                  Section {currentSection + 1} of {reviewSession.voice_script?.sections?.length || 1}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VoiceCodeReview