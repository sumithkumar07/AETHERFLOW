import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, MicOff, Volume2, VolumeX, Settings, Play, Pause, Square,
  Zap, Code, MessageSquare, RefreshCw, CheckCircle, AlertCircle,
  Brain, Waves, Target, Sparkles
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Voice-to-Code Component - 2025 Cutting-edge Feature
const VoiceToCode = ({ 
  onCodeGenerated, 
  onCommandExecuted,
  currentFile,
  professionalMode = true 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState('en-US');
  const [voiceCommands, setVoiceCommands] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0);
  const [voicePersonality, setVoicePersonality] = useState('professional');

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const timeoutRef = useRef(null);

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        console.log('Voice recognition started');
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(interimTranscript || finalTranscript);
        setConfidence(event.results[event.results.length - 1][0].confidence || 0);

        if (finalTranscript) {
          processVoiceCommand(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart recognition if we're supposed to be listening
          recognition.start();
        }
      };
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setCurrentTranscript('');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setVoiceEnabled(true);
    }
  };

  const processVoiceCommand = async (transcript) => {
    if (!transcript || transcript.length < 2) return;

    setIsProcessing(true);
    
    try {
      // Clear transcript after a delay
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCurrentTranscript('');
      }, 3000);

      // Send to backend for processing
      const response = await fetch(`${BACKEND_URL}/api/voice/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          context: {
            current_file: currentFile ? {
              name: currentFile.name,
              content: currentFile.content,
              language: detectLanguage(currentFile.name)
            } : null,
            confidence
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        handleVoiceCommandResult(result, transcript);
      } else {
        throw new Error('Failed to process voice command');
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      speakResponse("I'm sorry, I couldn't process that command. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceCommandResult = (result, originalTranscript) => {
    const command = {
      id: Date.now(),
      transcript: originalTranscript,
      type: result.command_type,
      confidence: result.confidence,
      timestamp: new Date(),
      result: result
    };

    setCommandHistory(prev => [command, ...prev.slice(0, 19)]); // Keep last 20 commands

    switch (result.command_type) {
      case 'code_generation':
        if (result.generated_code && onCodeGenerated) {
          onCodeGenerated(result.generated_code, result.position);
          speakResponse(`I've generated ${result.language || 'code'} for you. ${result.description || ''}`);
        }
        break;

      case 'code_explanation':
        if (result.explanation) {
          speakResponse(result.explanation);
        }
        break;

      case 'refactor':
        if (result.refactored_code && onCodeGenerated) {
          onCodeGenerated(result.refactored_code);
          speakResponse("I've refactored the code according to your request.");
        }
        break;

      case 'navigation':
        if (result.action && onCommandExecuted) {
          onCommandExecuted(result.action, result.parameters);
          speakResponse(`Navigating to ${result.target || 'requested location'}.`);
        }
        break;

      case 'search':
        if (result.search_query && onCommandExecuted) {
          onCommandExecuted('search', { query: result.search_query });
          speakResponse(`Searching for ${result.search_query}.`);
        }
        break;

      case 'file_operation':
        if (result.operation && onCommandExecuted) {
          onCommandExecuted('file_operation', result);
          speakResponse(`Performing ${result.operation} operation.`);
        }
        break;

      default:
        speakResponse(result.message || "Command processed successfully.");
    }
  };

  const speakResponse = (text) => {
    if (!aiVoiceEnabled || !synthesisRef.current) return;

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speakingSpeed;
    utterance.pitch = voicePersonality === 'friendly' ? 1.2 : voicePersonality === 'professional' ? 1.0 : 0.8;
    utterance.volume = 0.8;

    // Get available voices and select appropriate one
    const voices = synthesisRef.current.getVoices();
    const voice = voices.find(v => v.lang.includes(language.split('-')[0])) || voices[0];
    if (voice) utterance.voice = voice;

    synthesisRef.current.speak(utterance);
  };

  const detectLanguage = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'cs': 'csharp',
      'php': 'php', 'rb': 'ruby', 'go': 'go', 'rs': 'rust'
    };
    return languageMap[ext] || 'text';
  };

  const clearHistory = () => {
    setCommandHistory([]);
  };

  const reprocessCommand = async (command) => {
    await processVoiceCommand(command.transcript);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-700/50 text-gray-400'
          }`}>
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-white">Voice-to-Code</h3>
            <p className="text-xs text-gray-400">
              {isListening ? 'Listening...' : 'Click to start voice commands'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAiVoiceEnabled(!aiVoiceEnabled)}
            className={`btn btn-xs ${aiVoiceEnabled ? 'btn-primary' : 'btn-ghost'}`}
            title="Toggle AI voice responses"
          >
            {aiVoiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
          
          <button
            onClick={toggleListening}
            className={`btn btn-sm ${
              isListening ? 'btn-danger' : 'btn-primary'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {/* Current Transcript */}
      {(isListening || currentTranscript) && (
        <div className="p-4 border-b border-gray-700 bg-blue-500/5">
          <div className="flex items-center space-x-2 mb-2">
            <Mic className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              {isProcessing ? 'Processing...' : 'Listening'}
            </span>
            {confidence > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-gray-400">{Math.round(confidence * 100)}%</span>
              </div>
            )}
          </div>
          
          <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 min-h-[2rem]">
            {currentTranscript || 'Say something...'}
          </div>

          {isProcessing && (
            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-400">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent" />
              <span>Converting speech to code...</span>
            </div>
          )}
        </div>
      )}

      {/* Voice Commands Help */}
      {voiceEnabled && !isListening && (
        <div className="p-4 border-b border-gray-700">
          <div className="text-sm font-medium text-gray-300 mb-2">Voice Commands</div>
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-400">
            {[
              { command: '"Create a function to..."', description: 'Generate code' },
              { command: '"Refactor this code"', description: 'Improve existing code' },
              { command: '"Explain this function"', description: 'Get code explanation' },
              { command: '"Add error handling"', description: 'Add try-catch blocks' },
              { command: '"Search for files"', description: 'Navigate and search' },
              { command: '"Open settings"', description: 'Navigate to settings' }
            ].map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-blue-400">{item.command}</span>
                <span>{item.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {voiceEnabled && (
        <div className="p-4 space-y-4 border-b border-gray-700">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="it-IT">Italian</option>
              <option value="ja-JP">Japanese</option>
              <option value="ko-KR">Korean</option>
              <option value="zh-CN">Chinese</option>
            </select>
          </div>

          {/* Voice Personality */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">AI Voice</label>
            <div className="flex space-x-2">
              {['professional', 'friendly', 'concise'].map(personality => (
                <button
                  key={personality}
                  onClick={() => setVoicePersonality(personality)}
                  className={`btn btn-xs ${
                    voicePersonality === personality ? 'btn-primary' : 'btn-ghost'
                  }`}
                >
                  {personality}
                </button>
              ))}
            </div>
          </div>

          {/* Speaking Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Speed: {speakingSpeed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speakingSpeed}
              onChange={(e) => setSpeakingSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Command History */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-sm font-medium text-gray-300">Command History</span>
          <button
            onClick={clearHistory}
            className="btn btn-xs btn-ghost"
            disabled={commandHistory.length === 0}
          >
            Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {commandHistory.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div className="max-w-xs">
                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="font-medium text-white mb-2">No Commands Yet</h3>
                <p className="text-sm text-gray-400">
                  Start speaking to see your voice commands appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {commandHistory.map((command) => (
                <div key={command.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        command.result?.success !== false ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <span className="text-sm font-medium text-white capitalize">
                        {command.type?.replace('_', ' ') || 'Command'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {command.confidence ? `${Math.round(command.confidence * 100)}%` : ''}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => reprocessCommand(command)}
                        className="btn btn-xs btn-ghost"
                        title="Retry command"
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-gray-500">
                        {command.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-2">"{command.transcript}"</p>
                  
                  {command.result?.description && (
                    <p className="text-xs text-gray-400">{command.result.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inactive State */}
      {!voiceEnabled && (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="max-w-xs">
            <Mic className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="font-medium text-white mb-2">Voice-to-Code</h3>
            <p className="text-sm text-gray-400 mb-4">
              Speak naturally to generate code, refactor functions, navigate the IDE, and more.
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Natural language code generation</div>
              <div>• Voice-controlled IDE navigation</div>
              <div>• Code explanation and documentation</div>
              <div>• Intelligent refactoring suggestions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceToCode;