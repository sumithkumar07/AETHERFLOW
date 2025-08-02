import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  MicrophoneIcon, 
  SpeakerWaveIcon,
  StopIcon,
  PlayIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useAdvancedAIStore } from '../../store/advancedAIStore'
import toast from 'react-hot-toast'

/**
 * Voice Interface Component - Process voice commands and audio
 * Connects to /api/voice/* endpoints
 */
const VoiceInterface = () => {
  const {
    voiceCapabilities,
    conversationHistory,
    voiceEnabled,
    loading,
    error,
    fetchVoiceCapabilities,
    processVoiceCommand,
    toggleVoice,
    clearError
  } = useAdvancedAIStore()

  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [textInput, setTextInput] = useState('')
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  React.useEffect(() => {
    fetchVoiceCapabilities()
  }, [fetchVoiceCapabilities])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        // Process the audio with backend
        processAudioCommand(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      toast.success('Recording started...')
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      toast.success('Recording stopped')
    }
  }

  const processAudioCommand = async (audioBlob) => {
    try {
      // Create FormData for audio upload
      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'voice_command.wav')
      
      // This would be implemented when the backend endpoint is available
      toast.info('Audio processing will be implemented when backend endpoint is ready')
    } catch (error) {
      toast.error('Failed to process audio command')
    }
  }

  const handleTextVoiceCommand = async () => {
    if (!textInput.trim()) return
    
    const result = await processVoiceCommand(textInput)
    
    if (result.success) {
      setTextInput('')
      toast.success('Voice command processed successfully!')
    }
  }

  const handleToggleVoice = async () => {
    const result = await toggleVoice(!voiceEnabled)
    
    if (result.success) {
      toast.success(`Voice interface ${!voiceEnabled ? 'enabled' : 'disabled'}`)
    }
  }

  const getIntentIcon = (intentType) => {
    const icons = {
      create_project: '🚀',
      search_templates: '🔍',
      deploy_app: '📦',
      ai_chat: '💬',
      get_integrations: '🔗',
      project_status: '📊',
      help: '❓'
    }
    return icons[intentType] || '🎤'
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Voice Interface
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Control AI Tempo using voice commands or text
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Voice Interface</span>
              <button
                onClick={handleToggleVoice}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  voiceEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex justify-between">
            <div className="text-red-800 dark:text-red-200">{error}</div>
            <button onClick={clearError} className="text-red-600 hover:text-red-800">
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Voice Recording Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Voice Recording
          </h2>

          {/* Recording Interface */}
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!voiceEnabled || loading}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-semibold transition-colors ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? (
                  <StopIcon className="h-8 w-8" />
                ) : (
                  <MicrophoneIcon className="h-8 w-8" />
                )}
              </motion.button>
              
              {isRecording && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute inset-0 rounded-full border-4 border-red-400 opacity-75"
                />
              )}
            </div>

            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isRecording ? 'Recording...' : 'Tap to start recording'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {voiceEnabled ? 'Voice commands are enabled' : 'Enable voice interface first'}
            </p>

            {audioUrl && (
              <div className="mt-4">
                <audio controls src={audioUrl} className="w-full" />
              </div>
            )}
          </div>
        </div>

        {/* Text Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Text Voice Commands
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter voice command as text
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your command here..."
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleTextVoiceCommand()}
                />
                <button
                  onClick={handleTextVoiceCommand}
                  disabled={loading || !textInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Send'}
                </button>
              </div>
            </div>

            {/* Quick Command Examples */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick examples:
              </p>
              <div className="space-y-1">
                {[
                  "Create a new React project",
                  "Show me templates",
                  "Deploy my app",
                  "Check project status",
                  "Help me with integrations"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setTextInput(example)}
                    className="block text-left text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Capabilities */}
      {voiceCapabilities.supported_intents && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Supported Voice Commands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voiceCapabilities.supported_intents.map((intent) => (
              <div key={intent.intent} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getIntentIcon(intent.intent)}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {intent.intent.replace('_', ' ').toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {intent.description}
                    </p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Examples:</p>
                      {intent.examples?.slice(0, 2).map((example, index) => (
                        <div key={index} className="text-xs text-gray-600 dark:text-gray-300">
                          • "{example}"
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Specifications */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Audio Formats</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {voiceCapabilities.supported_audio_formats?.join(', ') || 'WAV, MP3'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Max Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {voiceCapabilities.max_audio_duration || '60 seconds'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Max File Size</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {voiceCapabilities.max_audio_size || '10MB'}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-300">Status</p>
                <p className={`font-medium ${
                  voiceCapabilities.voice_enabled 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {voiceCapabilities.voice_enabled ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Recent Voice Commands
          </h2>
          <div className="space-y-4">
            {conversationHistory.slice(-5).map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MicrophoneIcon className="h-5 w-5 text-indigo-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 dark:text-white">
                        "{item.input}"
                      </p>
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Result: {JSON.stringify(item.result, null, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceInterface