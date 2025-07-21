import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, Lightbulb, AlertTriangle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CodeEditor = ({ file, onSave, onContentChange }) => {
  const editorRef = useRef(null);
  const [isModified, setIsModified] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [completionSuggestions, setCompletionSuggestions] = useState([]);
  const [isLoadingCompletion, setIsLoadingCompletion] = useState(false);
  const [codeReview, setCodeReview] = useState(null);
  const [showCodeReview, setShowCodeReview] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  useEffect(() => {
    if (file) {
      setLanguage(getLanguageFromFilename(file.name));
      setIsModified(false);
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

    // Auto-completion and other editor features
    editor.updateOptions({
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      wordBasedSuggestions: true,
      minimap: { enabled: true },
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      folding: true,
      bracketMatching: 'always',
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true
    });
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
    <div className="flex-1 flex flex-col bg-gray-900">
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
        </div>
        
        <div className="flex items-center space-x-2">
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
      <div className="flex-1">
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
            showFoldingControls: 'mouseover'
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;