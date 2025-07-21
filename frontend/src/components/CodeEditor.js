import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Lightbulb, AlertTriangle, Sparkles, Bot, Wrench, Shield, Bug, FileText } from 'lucide-react';
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

  // Enhanced Real-time AI code completion using meta-llama/llama-4-maverick
  const getAICodeCompletion = useCallback(async (code, position) => {
    if (!code.trim() || isLoadingCompletion) return;
    
    setIsLoadingCompletion(true);
    try {
      // Get more context for better completion
      const lines = code.split('\n');
      const currentLine = position.line || 0;
      const beforeContext = lines.slice(Math.max(0, currentLine - 10), currentLine + 1).join('\n');
      const afterContext = lines.slice(currentLine + 1, currentLine + 6).join('\n');
      
      // Enhanced contextual prompt for meta-llama/llama-4-maverick
      const prompt = `You are an expert ${language} programming assistant. Complete this code with intelligent, contextually aware suggestions.

Context Before:
\`\`\`${language}
${beforeContext}
\`\`\`

Context After:
\`\`\`${language}
${afterContext}
\`\`\`

Current cursor position: Line ${position.line + 1}, Column ${position.column + 1}

Provide 5 different completion suggestions that would logically follow at the cursor position. Each suggestion should be:
1. Syntactically correct for ${language}
2. Contextually appropriate based on surrounding code
3. Following best practices and modern patterns
4. Varying in complexity (simple to advanced)
5. Considering the file type: ${file?.name || 'untitled'}

Return only the code completions, one per line, without explanations:`;

      const result = await puterAI.getCodeCompletion(prompt, language, position);
      if (result.suggestions && result.suggestions.length > 0) {
        // Enhanced suggestions with confidence scoring
        const enhancedSuggestions = result.suggestions.map((suggestion, index) => ({
          ...suggestion,
          confidence: 0.95 - (index * 0.1), // Higher confidence for first suggestions
          source: 'meta-llama-4-maverick',
          contextual: true
        }));
        setCompletionSuggestions(enhancedSuggestions);
      }
    } catch (error) {
      console.error('Enhanced code completion error:', error);
      // Fallback to basic completion
      try {
        const fallbackResult = await puterAI.getCodeCompletion(code, language, position);
        setCompletionSuggestions(fallbackResult.suggestions || []);
      } catch (fallbackError) {
        console.error('Fallback completion failed:', fallbackError);
      }
    } finally {
      setIsLoadingCompletion(false);
    }
  }, [language, isLoadingCompletion, file?.name]);

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
      setAiResult({ error: error.message });
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
      setAiResult({ error: error.message });
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
      setAiResult({ error: error.message });
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
      setAiResult({ error: error.message });
    } finally {
      setAiAction(null);
    }
  }, [language]);

  useEffect(() => {
    if (file) {
      setLanguage(getLanguageFromFilename(file.name));
      setIsModified(false);
      setCodeReview(null);
      setAiResult(null);
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
        
        // Trigger AI completion
        await getAICodeCompletion(code, {
          line: position.lineNumber - 1,
          column: position.column - 1
        });
        
        // Convert AI suggestions to Monaco format
        const suggestions = completionSuggestions.map((suggestion, index) => ({
          label: `🤖 ${suggestion.text}`,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: suggestion.text,
          documentation: `AI Suggestion (Confidence: ${(suggestion.confidence * 100).toFixed(0)}%) - Powered by Puter.js`,
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

  const handleAIAction = (action) => {
    if (!file?.content) return;
    
    setShowAIToolbar(false);
    
    switch (action) {
      case 'debug':
        debugCode(file.content);
        break;
      case 'document':
        generateDocumentation(file.content);
        break;
      case 'security':
        scanSecurity(file.content);
        break;
      case 'refactor-performance':
        refactorCode(file.content, 'performance');
        break;
      case 'refactor-readability':
        refactorCode(file.content, 'readability');
        break;
      default:
        break;
    }
  };

  const renderAIToolbar = () => {
    if (!showAIToolbar) return null;

    return (
      <div className="absolute top-12 right-4 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-20 p-2 min-w-48">
        <div className="space-y-1">
          <button
            onClick={() => handleAIAction('debug')}
            className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center text-sm text-gray-300"
          >
            <Bug size={14} className="mr-2" /> Debug Code
          </button>
          <button
            onClick={() => handleAIAction('document')}
            className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center text-sm text-gray-300"
          >
            <FileText size={14} className="mr-2" /> Generate Docs
          </button>
          <button
            onClick={() => handleAIAction('security')}
            className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center text-sm text-gray-300"
          >
            <Shield size={14} className="mr-2" /> Security Scan
          </button>
          <div className="border-t border-gray-600 my-1"></div>
          <button
            onClick={() => handleAIAction('refactor-performance')}
            className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center text-sm text-gray-300"
          >
            <Sparkles size={14} className="mr-2" /> Optimize Performance
          </button>
          <button
            onClick={() => handleAIAction('refactor-readability')}
            className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded flex items-center text-sm text-gray-300"
          >
            <Wrench size={14} className="mr-2" /> Improve Readability
          </button>
        </div>
      </div>
    );
  };

  const renderAIResultPanel = () => {
    if (!aiResult) return null;

    return (
      <div className="absolute top-0 right-0 w-96 h-full bg-gray-800 border-l border-gray-600 z-10 overflow-hidden flex flex-col">
        <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white flex items-center">
            <Bot size={16} className="mr-2 text-purple-400" />
            AI Assistant
          </h3>
          <button
            onClick={() => setAiResult(null)}
            className="text-gray-400 hover:text-white text-lg"
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {aiResult.error ? (
            <div className="text-red-400 text-sm">
              <p>AI service temporarily unavailable: {aiResult.error}</p>
            </div>
          ) : (
            <>
              {aiResult.analysis && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-red-400 flex items-center">
                    <Bug size={16} className="mr-2" />
                    Debug Analysis
                  </h4>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">{aiResult.analysis}</div>
                  
                  {aiResult.fixes && aiResult.fixes.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-green-400 mb-2">Suggested Fixes:</h5>
                      {aiResult.fixes.map((fix, index) => (
                        <div key={index} className="bg-gray-700 p-3 rounded mb-2">
                          <p className="text-sm text-gray-300 mb-2">{fix.description}</p>
                          <pre className="bg-gray-900 p-2 rounded text-xs text-green-400 overflow-x-auto">
                            <code>{fix.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {aiResult.documentation && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-blue-400 flex items-center">
                    <FileText size={16} className="mr-2" />
                    Generated Documentation
                  </h4>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">{aiResult.documentation}</div>
                </div>
              )}

              {aiResult.vulnerabilities !== undefined && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-orange-400 flex items-center">
                    <Shield size={16} className="mr-2" />
                    Security Analysis
                  </h4>
                  
                  {aiResult.risk_score !== undefined && (
                    <div className="bg-gray-700 p-3 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Risk Score</span>
                        <span className={`text-lg font-bold ${
                          aiResult.risk_score <= 20 ? 'text-green-400' :
                          aiResult.risk_score <= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {aiResult.risk_score}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            aiResult.risk_score <= 20 ? 'bg-green-400' :
                            aiResult.risk_score <= 50 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${aiResult.risk_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {aiResult.vulnerabilities && aiResult.vulnerabilities.length > 0 ? (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-300">Vulnerabilities Found:</h5>
                      {aiResult.vulnerabilities.map((vuln, index) => (
                        <div key={index} className={`p-3 rounded border-l-4 ${
                          vuln.severity === 'high' ? 'bg-red-900/20 border-red-500' :
                          vuln.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-500' :
                          'bg-blue-900/20 border-blue-500'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              vuln.severity === 'high' ? 'bg-red-600 text-white' :
                              vuln.severity === 'medium' ? 'bg-yellow-600 text-white' :
                              'bg-blue-600 text-white'
                            }`}>
                              {vuln.type}
                            </span>
                            <span className={`text-xs ${
                              vuln.severity === 'high' ? 'text-red-400' :
                              vuln.severity === 'medium' ? 'text-yellow-400' :
                              'text-blue-400'
                            }`}>
                              {vuln.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{vuln.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-green-400 text-sm">✅ No security vulnerabilities detected!</div>
                  )}
                </div>
              )}

              {aiResult.refactored_code && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-cyan-400 flex items-center">
                    <Wrench size={16} className="mr-2" />
                    Refactoring Suggestions
                  </h4>
                  
                  <div className="bg-gray-700 p-3 rounded">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Refactored Code:</h5>
                    <pre className="bg-gray-900 p-3 rounded text-xs text-green-400 overflow-x-auto">
                      <code>{aiResult.refactored_code}</code>
                    </pre>
                  </div>
                  
                  {aiResult.explanation && (
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">{aiResult.explanation}</div>
                  )}
                </div>
              )}
            </>
          )}

          {aiAction && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <span className="ml-3 text-sm text-gray-400">
                AI {aiAction}...
              </span>
            </div>
          )}
        </div>
      </div>
    );
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
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-xl font-bold mb-2">No file selected</h2>
          <p>Select a file from the explorer to start coding with AI assistance</p>
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
            <div className="flex items-center text-xs text-purple-400">
              <div className="animate-spin rounded-full h-3 w-3 border border-purple-400 border-t-transparent mr-2"></div>
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

          <button
            onClick={() => setShowAIToolbar(!showAIToolbar)}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-xs flex items-center space-x-1"
            title="AI Assistant Tools"
          >
            <Bot size={14} />
            <span>AI Tools</span>
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
        
        {renderAIToolbar()}
        {renderCodeReviewPanel()}
        {renderAIResultPanel()}
      </div>
    </div>
  );
};

export default CodeEditor;