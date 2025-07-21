import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Lightbulb, AlertTriangle, Sparkles, Bot } from 'lucide-react';
import puterAI from '../services/puterAI';

const CodeEditor = ({ file, onSave, onContentChange }) => {
  const editorRef = useRef(null);
  const [isModified, setIsModified] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [completionSuggestions, setCompletionSuggestions] = useState([]);
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(false);
  const [codeReview, setCodeReview] = useState(null);
  const [showCodeReview, setShowCodeReview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIToolbar, setShowAIToolbar] = useState(false);
  const [aiAction, setAiAction] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  // Detect language from file extension
  const getLanguageFromFilename = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'vue': 'html',
      'svelte': 'html'
    };
    return langMap[ext] || 'plaintext';
  };

  // Real-time AI code completion using Puter.js
  const getAICodeCompletion = useCallback(async (code, position) => {
    if (!code.trim() || isLoadingCompletion) return;
    
    setIsLoadingCompletion(true);
    try {
      const result = await puterAI.getCodeCompletion(code, language, position);
      if (result.suggestions && result.suggestions.length > 0) {
        setCompletionSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('Code completion error:', error);
    } finally {
      setIsLoadingCompletion(false);
    }
  }, [language, isLoadingCompletion]);

  // AI Code Review using Puter.js
  const performCodeReview = useCallback(async (code) => {
    if (!code.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      const result = await puterAI.reviewCode(code, language, file?.name || 'untitled');
      setCodeReview(result);
    } catch (error) {
      console.error('Code review error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [language, file?.name, isAnalyzing]);

  // AI Debug Code
  const debugCode = useCallback(async (code, errorMessage = null) => {
    if (!code.trim()) return;
    
    setAiAction('debugging');
    try {
      const result = await puterAI.debugCode(code, errorMessage, language);
      setAiResult(result);
    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setAiAction(null);
    }
  }, [language]);

  // Generate Documentation
  const generateDocumentation = useCallback(async (code) => {
    if (!code.trim()) return;
    
    setAiAction('documenting');
    try {
      const result = await puterAI.generateDocumentation(code, language);
      setAiResult(result);
    } catch (error) {
      console.error('Documentation error:', error);
    } finally {
      setAiAction(null);
    }
  }, [language]);

  // Security Scan
  const scanSecurity = useCallback(async (code) => {
    if (!code.trim()) return;
    
    setAiAction('scanning');
    try {
      const result = await puterAI.scanSecurity(code, language);
      setAiResult(result);
    } catch (error) {
      console.error('Security scan error:', error);
    } finally {
      setAiAction(null);
    }
  }, [language]);

  // Refactor Code
  const refactorCode = useCallback(async (code, focusArea = 'readability') => {
    if (!code.trim()) return;
    
    setAiAction('refactoring');
    try {
      const result = await puterAI.refactorCode(code, language, focusArea);
      setAiResult(result);
    } catch (error) {
      console.error('Refactor error:', error);
    } finally {
      setAiAction(null);
    }
  }, [language]);

  useEffect(() => {
    if (file) {
      setLanguage(getLanguageFromFilename(file.name));
      setIsModified(false);
      setCodeReview(null);
    }
  }, [file]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Set dark theme
    monaco.editor.setTheme('vs-dark');
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    // Add keyboard shortcut for code review
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
      if (file?.content) {
        performCodeReview(file.content);
      }
    });

    // Register AI code completion provider
    const completionProvider = monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: async (model, position) => {
        const code = model.getValue();
        const offset = model.getOffsetAt(position);
        
        // Trigger AI completion
        await getAICodeCompletion(code, {
          line: position.lineNumber - 1,
          column: position.column - 1
        });
        
        // Convert AI suggestions to Monaco format
        const suggestions = completionSuggestions.map((suggestion, index) => ({
          label: suggestion.text,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: suggestion.text,
          documentation: `AI Suggestion (Confidence: ${(suggestion.confidence * 100).toFixed(0)}%)`,
          sortText: `000${index}`,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column,
          }
        }));

        return { suggestions };
      }
    });

    // Auto-completion and other editor features
    editor.updateOptions({
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      wordBasedSuggestions: true,
      minimap: { enabled: true },
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      folding: true,
      bracketMatching: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      lineHeight: 1.5,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      contextmenu: true,
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      cursorBlinking: 'blink',
      renderLineHighlight: 'all',
      showFoldingControls: 'mouseover'
    });

    // Cleanup function
    return () => {
      completionProvider.dispose();
    };
  };

  const handleEditorChange = (value) => {
    if (file && value !== file.content) {
      setIsModified(true);
      onContentChange(value);
    }
  };

  const handleSave = () => {
    if (file && isModified) {
      onSave(file.content);
      setIsModified(false);
    }
  };

  const handleRun = () => {
    // Future: Add code execution functionality
    console.log('Run functionality coming soon!');
  };

  const handleCodeReview = () => {
    if (file?.content) {
      performCodeReview(file.content);
      setShowCodeReview(true);
    }
  };

  const renderCodeReviewPanel = () => {
    if (!showCodeReview || !codeReview) return null;

    return (
      <div className="absolute top-0 right-0 w-80 h-full bg-gray-800 border-l border-gray-600 z-10 overflow-hidden flex flex-col">
        <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white flex items-center">
            <AlertTriangle size={16} className="mr-2 text-yellow-400" />
            Code Review
          </h3>
          <button
            onClick={() => setShowCodeReview(false)}
            className="text-gray-400 hover:text-white text-lg"
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {codeReview.overall_score && (
            <div className="mb-4 p-3 bg-gray-700 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Code Quality Score</span>
                <span className={`text-lg font-bold ${
                  codeReview.overall_score >= 80 ? 'text-green-400' :
                  codeReview.overall_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {codeReview.overall_score}/100
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    codeReview.overall_score >= 80 ? 'bg-green-400' :
                    codeReview.overall_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${codeReview.overall_score}%` }}
                ></div>
              </div>
            </div>
          )}

          {codeReview.issues && codeReview.issues.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300">Issues Found:</h4>
              {codeReview.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    issue.severity === 'high' ? 'bg-red-900/20 border-red-500' :
                    issue.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                    'bg-blue-900/20 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      issue.severity === 'high' ? 'bg-red-600 text-white' :
                      issue.severity === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {issue.type}
                    </span>
                    <span className={`text-xs ${
                      issue.severity === 'high' ? 'text-red-400' :
                      issue.severity === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">{issue.message}</p>
                </div>
              ))}
            </div>
          )}

          {codeReview.summary && (
            <div className="mt-4 p-3 bg-gray-700 rounded">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Summary:</h4>
              <p className="text-sm text-gray-400">{codeReview.summary}</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-sm text-gray-400">Analyzing code...</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-500">
          <p>No file selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 relative">
      {/* File Tab */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white">
            {file.name}
            {isModified && <span className="text-yellow-400 ml-1">•</span>}
          </span>
          <span className="text-xs text-gray-400 uppercase">
            {language}
          </span>
          {isLoadingCompletion && (
            <div className="flex items-center text-xs text-blue-400">
              <div className="animate-spin rounded-full h-3 w-3 border border-blue-400 border-t-transparent mr-2"></div>
              AI Completing...
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCodeReview}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs flex items-center space-x-1"
            title="AI Code Review (Ctrl+R)"
            disabled={isAnalyzing}
          >
            <Lightbulb size={14} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Review'}</span>
          </button>
          
          {language === 'javascript' || language === 'python' ? (
            <button 
              onClick={handleRun}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs flex items-center space-x-1"
              title="Run code"
            >
              <Play size={14} />
              <span>Run</span>
            </button>
          ) : null}
          
          <button 
            onClick={handleSave}
            className={`px-3 py-1 rounded text-xs flex items-center space-x-1 ${
              isModified 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-600 text-gray-400'
            }`}
            disabled={!isModified}
            title="Save file (Ctrl+S)"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          value={file.content || ''}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: 1.5,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            contextmenu: true,
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            cursorBlinking: 'blink',
            renderLineHighlight: 'all',
            bracketMatching: 'always',
            folding: true,
            showFoldingControls: 'mouseover',
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            }
          }}
        />
        
        {renderCodeReviewPanel()}
      </div>
    </div>
  );
};

export default CodeEditor;