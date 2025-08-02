import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  CodeBracketIcon,
  SpeakerWaveIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const EnhancedVoiceToCode = ({ isVisible, onClose, onCodeGenerated }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [voiceCommands, setVoiceCommands] = useState([])
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [voiceSettings, setVoiceSettings] = useState({
    continuous: true,
    interimResults: true,
    language: 'en-US'
  })
  
  const recognitionRef = useRef(null)
  const processingTimeoutRef = useRef(null)

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isVisible || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    
    const recognition = recognitionRef.current
    recognition.continuous = voiceSettings.continuous
    recognition.interimResults = voiceSettings.interimResults
    recognition.lang = voiceSettings.language

    recognition.onstart = () => {
      setIsListening(true)
      toast.success('Voice recognition started')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence

        if (event.results[i].isFinal) {
          finalTranscript += transcript
          setConfidence(confidence)
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)
      
      // Auto-process code generation after pause in speech
      if (finalTranscript && processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
      
      if (finalTranscript) {
        processingTimeoutRef.current = setTimeout(() => {
          processVoiceCommand(finalTranscript)
        }, 2000)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      toast.error(`Voice recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
    }
  }, [isVisible, voiceSettings])

  // Start/Stop Voice Recognition
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      setTranscript('')
      setGeneratedCode('')
      recognitionRef.current.start()
    }
  }, [isListening])

  // Process voice command to generate code
  const processVoiceCommand = async (command) => {
    if (!command.trim()) return

    setIsProcessing(true)
    
    try {
      // Enhanced voice command processing
      const processedCode = await generateCodeFromVoice(command, selectedLanguage)
      setGeneratedCode(processedCode)
      
      // Add to command history
      const newCommand = {
        id: Date.now(),
        transcript: command,
        confidence: confidence,
        language: selectedLanguage,
        generatedCode: processedCode,
        timestamp: new Date()
      }
      setVoiceCommands(prev => [newCommand, ...prev.slice(0, 4)])
      
      toast.success('Code generated successfully!')
    } catch (error) {
      console.error('Code generation error:', error)
      toast.error('Failed to generate code')
    } finally {
      setIsProcessing(false)
    }
  }

  // Enhanced code generation from voice
  const generateCodeFromVoice = async (command, language) => {
    // Voice command patterns and their corresponding code templates
    const patterns = {
      // Function creation
      'create function': (match) => {
        const funcName = extractFunctionName(command)
        return `function ${funcName}() {\n  // Function implementation\n  return null;\n}`
      },
      'arrow function': (match) => {
        const funcName = extractFunctionName(command)
        return `const ${funcName} = () => {\n  // Arrow function implementation\n  return null;\n}`
      },
      
      // Variable declarations
      'create variable': (match) => {
        const varName = extractVariableName(command)
        return `let ${varName} = null;`
      },
      'constant': (match) => {
        const varName = extractVariableName(command)
        return `const ${varName} = null;`
      },
      
      // Control structures
      'if statement': () => 'if (condition) {\n  // Code block\n}',
      'for loop': () => 'for (let i = 0; i < length; i++) {\n  // Loop body\n}',
      'while loop': () => 'while (condition) {\n  // Loop body\n}',
      
      // React components
      'react component': (match) => {
        const compName = extractComponentName(command)
        return `import React from 'react';\n\nconst ${compName} = () => {\n  return (\n    <div>\n      <h1>${compName}</h1>\n    </div>\n  );\n};\n\nexport default ${compName};`
      },
      
      // API calls
      'fetch api': () => {
        return `fetch('/api/endpoint')\n  .then(response => response.json())\n  .then(data => {\n    console.log(data);\n  })\n  .catch(error => {\n    console.error('Error:', error);\n  });`
      },
      
      // Class creation
      'create class': (match) => {
        const className = extractClassName(command)
        return `class ${className} {\n  constructor() {\n    // Constructor\n  }\n\n  method() {\n    // Method implementation\n  }\n}`
      }
    }

    // Find matching pattern
    for (const [pattern, generator] of Object.entries(patterns)) {
      if (command.toLowerCase().includes(pattern)) {
        return generator()
      }
    }

    // Fallback: AI-assisted code generation
    return await fallbackCodeGeneration(command, language)
  }

  // Helper functions to extract names from voice commands
  const extractFunctionName = (command) => {
    const match = command.match(/function (?:called |named )?(\w+)/i)
    return match ? match[1] : 'myFunction'
  }

  const extractVariableName = (command) => {
    const match = command.match(/variable (?:called |named )?(\w+)/i)
    return match ? match[1] : 'myVariable'
  }

  const extractComponentName = (command) => {
    const match = command.match(/component (?:called |named )?(\w+)/i)
    return match ? match[1] : 'MyComponent'
  }

  const extractClassName = (command) => {
    const match = command.match(/class (?:called |named )?(\w+)/i)
    return match ? match[1] : 'MyClass'
  }

  // Fallback AI code generation
  const fallbackCodeGeneration = async (command, language) => {
    // Mock AI response - replace with actual AI API call
    return `// Generated from: "${command}"\n// Language: ${language}\n\n// AI-generated code would appear here\nconsole.log('Voice command processed: ${command}');`
  }

  // Apply generated code
  const applyCode = () => {
    if (generatedCode && onCodeGenerated) {
      onCodeGenerated(generatedCode, selectedLanguage)
      toast.success('Code applied to editor!')
    }
  }

  if (!isVisible) return null

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
              <MicrophoneIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Voice to Code
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Speak your code into existence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Voice Control Button */}
              <button
                onClick={toggleListening}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <StopIcon className="w-5 h-5" />
                    <span>Stop Listening</span>
                  </>
                ) : (
                  <>
                    <MicrophoneIcon className="w-5 h-5" />
                    <span>Start Speaking</span>
                  </>
                )}
              </button>

              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="react">React JSX</option>
              </select>
            </div>

            {/* Confidence Indicator */}
            {confidence > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                <div className={`px-2 py-1 rounded text-sm font-medium ${
                  confidence > 0.8 ? 'bg-green-100 text-green-800' :
                  confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {Math.round(confidence * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Voice Input Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Voice Input</h3>
              {isListening && (
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Listening...</span>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 min-h-[100px] border">
              {transcript ? (
                <p className="text-gray-900 dark:text-white">{transcript}</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Start speaking to see your voice commands here...
                </p>
              )}
              
              {isProcessing && (
                <div className="flex items-center space-x-2 mt-2 text-blue-600">
                  <SparklesIcon className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating code...</span>
                </div>
              )}
            </div>
          </div>

          {/* Generated Code Display */}
          {generatedCode && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Generated Code</h3>
                <button
                  onClick={applyCode}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Apply Code</span>
                </button>
              </div>
              
              <div className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto">
                <pre className="text-sm">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Voice Command History */}
          {voiceCommands.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Recent Commands</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {voiceCommands.map((command) => (
                  <div key={command.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        "{command.transcript}"
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>{command.language}</span>
                        <span>{Math.round(command.confidence * 100)}% confident</span>
                        <span>{command.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setGeneratedCode(command.generatedCode)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      <CodeBracketIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Voice Commands Examples:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
              <div>"Create function called handleClick"</div>
              <div>"Make a React component called Header"</div>
              <div>"Create variable called userName"</div>
              <div>"Add an if statement"</div>
              <div>"Generate a for loop"</div>
              <div>"Create a fetch API call"</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default EnhancedVoiceToCode