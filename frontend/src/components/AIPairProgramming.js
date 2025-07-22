import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bot, Zap, Code, Lightbulb, Play, Pause, Settings,
  MessageSquare, GitBranch, Bug, Sparkles, Brain,
  Users, Target, CheckCircle, AlertCircle, Clock
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// AI Pair Programming Component - 2025 Cutting-edge Feature
const AIPairProgramming = ({ 
  currentFile, 
  onCodeSuggestion, 
  onInsertCode,
  professionalMode = true 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [pairMode, setPairMode] = useState('assistant'); // assistant, navigator, reviewer
  const [aiPersonality, setAiPersonality] = useState('helpful'); // helpful, expert, creative
  const [contextAwareness, setContextAwareness] = useState(true);
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    suggestionsGenerated: 0,
    suggestionsAccepted: 0,
    linesGenerated: 0,
    timeActive: 0
  });

  const sessionStartTime = useRef(null);
  const suggestionTimeout = useRef(null);

  // Initialize AI Pair Programming Session
  useEffect(() => {
    if (isActive) {
      sessionStartTime.current = Date.now();
      initializePairSession();
    } else {
      if (sessionStartTime.current) {
        const sessionDuration = (Date.now() - sessionStartTime.current) / 1000;
        setSessionStats(prev => ({
          ...prev,
          timeActive: prev.timeActive + sessionDuration
        }));
      }
    }

    return () => {
      if (suggestionTimeout.current) {
        clearTimeout(suggestionTimeout.current);
      }
    };
  }, [isActive]);

  // Context-aware code analysis
  useEffect(() => {
    if (isActive && autoSuggest && currentFile) {
      // Debounce suggestions
      if (suggestionTimeout.current) {
        clearTimeout(suggestionTimeout.current);
      }
      
      suggestionTimeout.current = setTimeout(() => {
        analyzeCodeForSuggestions();
      }, 2000);
    }
  }, [currentFile?.content, isActive, autoSuggest]);

  const initializePairSession = async () => {
    try {
      setIsThinking(true);
      const response = await fetch(`${BACKEND_URL}/api/ai/pair-programming/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: pairMode,
          personality: aiPersonality,
          context_awareness: contextAwareness,
          file_context: currentFile ? {
            name: currentFile.name,
            content: currentFile.content,
            language: detectLanguage(currentFile.name)
          } : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AI Pair Programming session initialized:', data);
      }
    } catch (error) {
      console.error('Error initializing pair session:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const analyzeCodeForSuggestions = async () => {
    if (!currentFile) return;

    try {
      setIsThinking(true);
      const response = await fetch(`${BACKEND_URL}/api/ai/pair-programming/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentFile.content,
          filename: currentFile.name,
          language: detectLanguage(currentFile.name),
          cursor_position: getCurrentCursorPosition(),
          mode: pairMode
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setSessionStats(prev => ({
          ...prev,
          suggestionsGenerated: prev.suggestionsGenerated + (data.suggestions?.length || 0)
        }));
        
        // Auto-show most relevant suggestion
        if (data.suggestions && data.suggestions.length > 0) {
          setCurrentSuggestion(data.suggestions[0]);
        }
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const acceptSuggestion = async (suggestion) => {
    try {
      if (onInsertCode) {
        onInsertCode(suggestion.code, suggestion.position);
      }

      setSessionStats(prev => ({
        ...prev,
        suggestionsAccepted: prev.suggestionsAccepted + 1,
        linesGenerated: prev.linesGenerated + suggestion.code.split('\n').length
      }));

      // Send feedback to AI
      await fetch(`${BACKEND_URL}/api/ai/pair-programming/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestion_id: suggestion.id,
          action: 'accepted',
          context: 'user_accepted_suggestion'
        })
      });

      setCurrentSuggestion(null);
    } catch (error) {
      console.error('Error accepting suggestion:', error);
    }
  };

  const rejectSuggestion = async (suggestion) => {
    try {
      // Send feedback to AI
      await fetch(`${BACKEND_URL}/api/ai/pair-programming/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestion_id: suggestion.id,
          action: 'rejected',
          context: 'user_rejected_suggestion'
        })
      });

      setCurrentSuggestion(null);
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
    }
  };

  const requestSpecificHelp = async (request) => {
    try {
      setIsThinking(true);
      const response = await fetch(`${BACKEND_URL}/api/ai/pair-programming/help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request,
          code_context: currentFile?.content,
          filename: currentFile?.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.suggestion) {
          setCurrentSuggestion(data.suggestion);
        }
      }
    } catch (error) {
      console.error('Error requesting help:', error);
    } finally {
      setIsThinking(false);
    }
  };

  const detectLanguage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    return languageMap[ext] || 'text';
  };

  const getCurrentCursorPosition = () => {
    // This would integrate with the code editor to get cursor position
    return { line: 0, column: 0 };
  };

  const pairModeConfig = {
    assistant: {
      icon: <Bot className="w-4 h-4" />,
      description: "AI assists with suggestions and completions",
      color: "blue"
    },
    navigator: {
      icon: <Target className="w-4 h-4" />,
      description: "AI guides development direction",
      color: "green"
    },
    reviewer: {
      icon: <Bug className="w-4 h-4" />,
      description: "AI reviews code for improvements",
      color: "orange"
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'
          }`}>
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-white">AI Pair Programming</h3>
            <p className="text-xs text-gray-400">
              {isActive ? `${pairMode} mode active` : 'Click to start pair session'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsActive(!isActive)}
          className={`btn btn-sm ${
            isActive ? 'btn-success' : 'btn-primary'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isActive ? 'Pause' : 'Start'}
        </button>
      </div>

      {/* Configuration Panel */}
      {isActive && (
        <div className="p-4 space-y-4 border-b border-gray-700">
          {/* Pair Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Pair Programming Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(pairModeConfig).map(([mode, config]) => (
                <button
                  key={mode}
                  onClick={() => setPairMode(mode)}
                  className={`p-2 rounded-lg border text-xs transition-all ${
                    pairMode === mode
                      ? `border-${config.color}-500 bg-${config.color}-500/20 text-${config.color}-400`
                      : 'border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    {config.icon}
                    <span className="font-medium capitalize">{mode}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={contextAwareness}
                onChange={(e) => setContextAwareness(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500"
              />
              <span className="text-gray-300">Context Awareness</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoSuggest}
                onChange={(e) => setAutoSuggest(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500"
              />
              <span className="text-gray-300">Auto Suggestions</span>
            </label>
          </div>
        </div>
      )}

      {/* Active Session Interface */}
      {isActive && (
        <div className="flex-1 flex flex-col">
          {/* Current Suggestion */}
          {currentSuggestion && (
            <div className="p-4 border-b border-gray-700 bg-blue-500/5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-blue-400">
                    {currentSuggestion.type === 'completion' ? 'Code Completion' :
                     currentSuggestion.type === 'refactor' ? 'Refactor Suggestion' :
                     currentSuggestion.type === 'fix' ? 'Bug Fix' : 'Suggestion'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => acceptSuggestion(currentSuggestion)}
                    className="btn btn-xs btn-success"
                    title="Accept suggestion (Tab)"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => rejectSuggestion(currentSuggestion)}
                    className="btn btn-xs btn-ghost"
                    title="Reject suggestion (Esc)"
                  >
                    <AlertCircle className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-2">{currentSuggestion.description}</p>
              
              <pre className="bg-gray-800 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                <code>{currentSuggestion.code}</code>
              </pre>
              
              {currentSuggestion.explanation && (
                <p className="text-xs text-gray-400 mt-2">{currentSuggestion.explanation}</p>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-4 space-y-2">
            <div className="text-sm font-medium text-gray-300 mb-3">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Optimize Code', action: 'optimize', icon: <Zap className="w-3 h-3" /> },
                { label: 'Add Comments', action: 'document', icon: <MessageSquare className="w-3 h-3" /> },
                { label: 'Find Bugs', action: 'debug', icon: <Bug className="w-3 h-3" /> },
                { label: 'Refactor', action: 'refactor', icon: <Code className="w-3 h-3" /> }
              ].map((item) => (
                <button
                  key={item.action}
                  onClick={() => requestSpecificHelp(item.action)}
                  className="btn btn-xs btn-ghost text-left justify-start"
                  disabled={isThinking}
                >
                  {item.icon}
                  <span className="ml-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Session Stats */}
          <div className="mt-auto p-4 border-t border-gray-700">
            <div className="text-xs font-medium text-gray-300 mb-2">Session Stats</div>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div>
                <span className="block text-gray-500">Suggestions</span>
                <span className="text-white">{sessionStats.suggestionsGenerated}</span>
              </div>
              <div>
                <span className="block text-gray-500">Accepted</span>
                <span className="text-green-400">{sessionStats.suggestionsAccepted}</span>
              </div>
              <div>
                <span className="block text-gray-500">Lines Generated</span>
                <span className="text-blue-400">{sessionStats.linesGenerated}</span>
              </div>
              <div>
                <span className="block text-gray-500">Active Time</span>
                <span className="text-purple-400">{Math.round(sessionStats.timeActive)}s</span>
              </div>
            </div>
          </div>

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inactive State */}
      {!isActive && (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="max-w-xs">
            <Brain className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="font-medium text-white mb-2">AI Pair Programming</h3>
            <p className="text-sm text-gray-400 mb-4">
              Get intelligent code suggestions, optimizations, and real-time assistance while you code.
            </p>
            <div className="space-y-2 text-xs text-gray-500">
              <div>• Context-aware suggestions</div>
              <div>• Real-time code review</div>
              <div>• Bug detection & fixes</div>
              <div>• Refactoring recommendations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPairProgramming;