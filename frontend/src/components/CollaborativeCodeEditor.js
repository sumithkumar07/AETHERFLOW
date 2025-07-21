import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import collaborationService from '../services/collaborationService';
import CollaborativeCursors from './CollaborativeCursors';

const CollaborativeCodeEditor = ({ 
  file, 
  onSave, 
  onContentChange, 
  preferences,
  isOnline,
  autoSaveEnabled,
  ...props 
}) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isModified, setIsModified] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [pendingOperations, setPendingOperations] = useState([]);
  const [fileVersion, setFileVersion] = useState(0);
  const [lastSyncedContent, setLastSyncedContent] = useState('');
  
  // Operational Transform state
  const isApplyingRemoteChanges = useRef(false);
  const lastCursorPosition = useRef(null);
  const changeBuffer = useRef([]);
  const syncTimeoutRef = useRef(null);

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

  // Update language when file changes
  useEffect(() => {
    if (file) {
      const newLang = getLanguageFromFilename(file.name);
      setLanguage(newLang);
      setLastSyncedContent(file.content || '');
      setFileVersion(collaborationService.getFileVersion(file.id) || 0);
    }
  }, [file]);

  // Setup collaboration event listeners
  useEffect(() => {
    if (!file) return;

    const handleFileEdit = (data) => {
      if (data.fileId === file.id && data.userId !== collaborationService.currentUser?.id) {
        applyRemoteChanges(data);
      }
    };

    const handleEditAcknowledged = (data) => {
      if (data.file_id === file.id) {
        setFileVersion(data.new_version);
        // Clear acknowledged operations from pending queue
        setPendingOperations(prev => []);
      }
    };

    const handlePresenceUpdate = (data) => {
      if (data.presence.file_id === file.id) {
        updateCollaboratorsList();
      }
    };

    const handleUserJoined = () => {
      updateCollaboratorsList();
    };

    const handleUserLeft = () => {
      updateCollaboratorsList();
    };

    // Register event listeners
    collaborationService.on('file_edit', handleFileEdit);
    collaborationService.on('edit_acknowledged', handleEditAcknowledged);
    collaborationService.on('presence_update', handlePresenceUpdate);
    collaborationService.on('user_joined', handleUserJoined);
    collaborationService.on('user_left', handleUserLeft);

    // Update collaboration status
    setIsCollaborating(collaborationService.isConnected);
    updateCollaboratorsList();

    return () => {
      collaborationService.off('file_edit', handleFileEdit);
      collaborationService.off('edit_acknowledged', handleEditAcknowledged);
      collaborationService.off('presence_update', handlePresenceUpdate);
      collaborationService.off('user_joined', handleUserJoined);
      collaborationService.off('user_left', handleUserLeft);
    };
  }, [file]);

  const updateCollaboratorsList = () => {
    if (!file) return;
    
    const cursors = collaborationService.getCollaborativeCursors(file.id);
    setCollaborators(cursors);
  };

  // Apply remote changes using operational transform
  const applyRemoteChanges = useCallback((data) => {
    if (!editorRef.current || !monacoRef.current || isApplyingRemoteChanges.current) {
      return;
    }

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    
    isApplyingRemoteChanges.current = true;

    try {
      const model = editor.getModel();
      const currentContent = model.getValue();
      
      // Apply each operation
      data.operations.forEach(operation => {
        const { operation_type, position, content, length } = operation;
        
        if (operation_type === 'insert' && content) {
          const pos = model.getPositionAt(position);
          const range = new monaco.Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);
          
          model.pushEditOperations(
            [],
            [{ range, text: content }],
            () => null
          );
        } else if (operation_type === 'delete' && length) {
          const startPos = model.getPositionAt(position);
          const endPos = model.getPositionAt(position + length);
          const range = new monaco.Range(
            startPos.lineNumber, startPos.column,
            endPos.lineNumber, endPos.column
          );
          
          model.pushEditOperations(
            [],
            [{ range, text: '' }],
            () => null
          );
        }
      });

      // Update synchronized content and version
      setLastSyncedContent(model.getValue());
      setFileVersion(data.newVersion);
      
    } catch (error) {
      console.error('Error applying remote changes:', error);
    } finally {
      isApplyingRemoteChanges.current = false;
    }
  }, []);

  // Convert editor changes to operational transform operations
  const createOperations = useCallback((event) => {
    if (!event.changes || event.changes.length === 0) return [];
    
    const operations = [];
    
    event.changes.forEach(change => {
      const startOffset = change.rangeOffset;
      const endOffset = startOffset + change.rangeLength;
      
      // Handle deletions
      if (change.rangeLength > 0) {
        operations.push({
          operation_type: 'delete',
          position: startOffset,
          length: change.rangeLength
        });
      }
      
      // Handle insertions
      if (change.text && change.text.length > 0) {
        operations.push({
          operation_type: 'insert',
          position: startOffset,
          content: change.text
        });
      }
    });
    
    return operations;
  }, []);

  // Debounced function to send changes to collaboration service
  const sendCollaborativeChanges = useCallback((operations) => {
    if (operations.length === 0 || !isCollaborating || !file) return;
    
    // Clear previous timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    // Buffer operations for batching
    changeBuffer.current.push(...operations);
    
    // Send after a short delay to batch rapid changes
    syncTimeoutRef.current = setTimeout(() => {
      if (changeBuffer.current.length > 0) {
        const batchedOperations = [...changeBuffer.current];
        changeBuffer.current = [];
        
        // Add to pending operations
        setPendingOperations(prev => [...prev, ...batchedOperations]);
        
        // Send to collaboration service
        collaborationService.applyEditOperations(file.id, batchedOperations);
      }
    }, 100); // 100ms debounce
  }, [isCollaborating, file]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Set dark theme
    monaco.editor.setTheme('vs-dark');
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    // Configure editor for collaboration
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
      formatOnType: false, // Disable to avoid conflicts with collaboration
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

    // Listen for content changes
    editor.onDidChangeModelContent((event) => {
      if (isApplyingRemoteChanges.current) {
        return; // Skip processing remote changes
      }

      const value = editor.getValue();
      
      // Update local state
      if (file && value !== file.content) {
        setIsModified(true);
        onContentChange(value);
      }

      // Create and send collaborative operations
      if (isCollaborating && file) {
        const operations = createOperations(event);
        sendCollaborativeChanges(operations);
      }
    });

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((event) => {
      if (isCollaborating && file && !isApplyingRemoteChanges.current) {
        const position = {
          line: event.position.lineNumber,
          column: event.position.column
        };
        
        const selection = editor.getSelection();
        let selectionData = null;
        
        if (selection && !selection.isEmpty()) {
          selectionData = {
            start: {
              line: selection.startLineNumber,
              column: selection.startColumn
            },
            end: {
              line: selection.endLineNumber,
              column: selection.endColumn
            }
          };
        }
        
        // Throttle cursor updates
        if (lastCursorPosition.current) {
          clearTimeout(lastCursorPosition.current);
        }
        
        lastCursorPosition.current = setTimeout(() => {
          collaborationService.updatePresence(file.id, position, selectionData, false);
        }, 50);
      }
    });

    // Listen for selection changes for collaborative selections
    editor.onDidChangeCursorSelection((event) => {
      if (isCollaborating && file && !isApplyingRemoteChanges.current) {
        const selection = event.selection;
        
        if (selection && !selection.isEmpty()) {
          const selectionData = {
            start: {
              line: selection.startLineNumber,
              column: selection.startColumn
            },
            end: {
              line: selection.endLineNumber,
              column: selection.endColumn
            }
          };
          
          const position = {
            line: selection.endLineNumber,
            column: selection.endColumn
          };
          
          collaborationService.updatePresence(file.id, position, selectionData, false);
        }
      }
    });
  };

  const handleEditorChange = (value) => {
    // This is handled in onDidChangeModelContent for better collaboration support
  };

  const handleSave = () => {
    if (file && isModified) {
      onSave(file.content);
      setIsModified(false);
      
      // Update synced content
      setLastSyncedContent(file.content);
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (lastCursorPosition.current) {
        clearTimeout(lastCursorPosition.current);
      }
    };
  }, []);

  return (
    <div className="h-full relative">
      {/* Collaboration Status Bar */}
      {file && (
        <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isCollaborating && isOnline ? (
                <Wifi size={14} className="text-green-400" />
              ) : (
                <WifiOff size={14} className="text-gray-400" />
              )}
              <span className="text-gray-300">
                {isCollaborating ? 'Collaborative' : 'Solo'} Editing
              </span>
            </div>
            
            {collaborators.length > 0 && (
              <div className="flex items-center space-x-2">
                <Users size={14} className="text-blue-400" />
                <span className="text-gray-400">
                  {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {pendingOperations.length > 0 && (
              <div className="text-yellow-400 text-xs">
                Syncing changes...
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            {file && (
              <>
                <span>Version: {fileVersion}</span>
                {isModified && (
                  <span className="text-yellow-400">• Modified</span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={file?.content || ''}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            automaticLayout: true,
            wordWrap: 'on',
            minimap: { enabled: true },
            fontSize: 14,
            lineHeight: 1.5,
            folding: true,
            showFoldingControls: 'mouseover'
          }}
          {...props}
        />
        
        {/* Collaborative Cursors */}
        {file && editorRef.current && monacoRef.current && (
          <CollaborativeCursors
            editor={editorRef.current}
            fileId={file.id}
            monacoRef={monacoRef}
          />
        )}
      </div>
    </div>
  );
};

export default CollaborativeCodeEditor;