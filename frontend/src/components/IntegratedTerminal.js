import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Terminal, X, Plus, Minimize2, Maximize2, Copy, 
  Play, Square, RotateCcw, Settings, ChevronDown,
  Folder, GitBranch, Zap, AlertTriangle
} from 'lucide-react';

const IntegratedTerminal = ({ 
  isVisible, 
  onToggle, 
  currentProject = null,
  height = 300 
}) => {
  const [terminals, setTerminals] = useState([
    { id: 1, name: 'bash', type: 'bash', output: [], input: '', isActive: true, status: 'ready' }
  ]);
  const [activeTerminal, setActiveTerminal] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(height);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Sample terminal commands and responses
  const commandHistory = useRef([]);
  const historyIndex = useRef(-1);

  const addOutput = useCallback((terminalId, content, type = 'output') => {
    setTerminals(prev => prev.map(term => 
      term.id === terminalId 
        ? { ...term, output: [...term.output, { content, type, timestamp: Date.now() }] }
        : term
    ));
  }, []);

  const executeCommand = useCallback(async (terminalId, command) => {
    const terminal = terminals.find(t => t.id === terminalId);
    if (!terminal) return;

    // Add command to history
    commandHistory.current.unshift(command);
    if (commandHistory.current.length > 50) {
      commandHistory.current.pop();
    }

    // Add command to output
    addOutput(terminalId, `$ ${command}`, 'command');

    // Update terminal status
    setTerminals(prev => prev.map(term => 
      term.id === terminalId ? { ...term, status: 'running', input: '' } : term
    ));

    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock command responses
    let response = '';
    switch (command.toLowerCase().trim()) {
      case 'ls':
      case 'dir':
        response = currentProject 
          ? 'src/\npackage.json\nREADME.md\nnode_modules/\n.git/'
          : 'No project open';
        break;
      case 'pwd':
        response = currentProject ? `/workspace/${currentProject.name}` : '/workspace';
        break;
      case 'git status':
        response = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/App.js

no changes added to commit (use "git add ." or "git commit -a")`;
        break;
      case 'npm install':
      case 'yarn install':
        response = `Installing dependencies...
✅ All dependencies installed successfully!`;
        break;
      case 'npm start':
      case 'yarn start':
        response = `Starting development server...
🚀 Server running on http://localhost:3000`;
        break;
      case 'npm run build':
      case 'yarn build':
        response = `Building for production...
✅ Build completed successfully!
📦 Output: dist/`;
        break;
      case 'clear':
        setTerminals(prev => prev.map(term => 
          term.id === terminalId ? { ...term, output: [] } : term
        ));
        setTerminals(prev => prev.map(term => 
          term.id === terminalId ? { ...term, status: 'ready' } : term
        ));
        return;
      case 'help':
        response = `Available commands:
  ls, dir     - List files
  pwd         - Show current directory  
  git status  - Show git status
  npm/yarn    - Package manager commands
  clear       - Clear terminal
  help        - Show this help`;
        break;
      default:
        if (command.startsWith('cd ')) {
          response = `Changed directory to: ${command.slice(3)}`;
        } else if (command.startsWith('echo ')) {
          response = command.slice(5);
        } else {
          response = `Command not found: ${command}
Type 'help' for available commands`;
        }
    }

    addOutput(terminalId, response, 'output');
    setTerminals(prev => prev.map(term => 
      term.id === terminalId ? { ...term, status: 'ready' } : term
    ));
  }, [terminals, currentProject, addOutput]);

  const handleKeyDown = useCallback((e, terminalId) => {
    const terminal = terminals.find(t => t.id === terminalId);
    if (!terminal) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const command = terminal.input.trim();
      if (command) {
        executeCommand(terminalId, command);
        historyIndex.current = -1;
      } else {
        addOutput(terminalId, '$ ', 'command');
        setTerminals(prev => prev.map(term => 
          term.id === terminalId ? { ...term, input: '' } : term
        ));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex.current < commandHistory.current.length - 1) {
        historyIndex.current++;
        const historyCommand = commandHistory.current[historyIndex.current];
        setTerminals(prev => prev.map(term => 
          term.id === terminalId ? { ...term, input: historyCommand } : term
        ));
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex.current > 0) {
        historyIndex.current--;
        const historyCommand = commandHistory.current[historyIndex.current];
        setTerminals(prev => prev.map(term => 
          term.id === terminalId ? { ...term, input: historyCommand } : term
        ));
      } else if (historyIndex.current === 0) {
        historyIndex.current = -1;
        setTerminals(prev => prev.map(term => 
          term.id === terminalId ? { ...term, input: '' } : term
        ));
      }
    }
  }, [terminals, executeCommand, addOutput]);

  const handleInputChange = useCallback((e, terminalId) => {
    const value = e.target.value;
    setTerminals(prev => prev.map(term => 
      term.id === terminalId ? { ...term, input: value } : term
    ));
  }, []);

  const createNewTerminal = useCallback(() => {
    const newId = Math.max(...terminals.map(t => t.id)) + 1;
    const newTerminal = {
      id: newId,
      name: `Terminal ${newId}`,
      type: 'bash',
      output: [{ content: 'Welcome to AETHERFLOW Terminal', type: 'system', timestamp: Date.now() }],
      input: '',
      status: 'ready'
    };
    
    setTerminals(prev => [...prev, newTerminal]);
    setActiveTerminal(newId);
  }, [terminals]);

  const closeTerminal = useCallback((terminalId) => {
    if (terminals.length === 1) return; // Keep at least one terminal
    
    setTerminals(prev => prev.filter(t => t.id !== terminalId));
    
    if (activeTerminal === terminalId) {
      const remainingTerminals = terminals.filter(t => t.id !== terminalId);
      setActiveTerminal(remainingTerminals[0]?.id || 1);
    }
  }, [terminals, activeTerminal]);

  const copyOutput = useCallback(() => {
    const terminal = terminals.find(t => t.id === activeTerminal);
    if (terminal) {
      const output = terminal.output.map(item => item.content).join('\n');
      navigator.clipboard.writeText(output);
    }
  }, [terminals, activeTerminal]);

  // Auto-focus input when terminal becomes visible
  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible, activeTerminal]);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminals]);

  const currentTerminalData = terminals.find(t => t.id === activeTerminal);

  if (!isVisible) return null;

  return (
    <div 
      className={`bg-gray-900 border-t border-gray-700 flex flex-col transition-all duration-200 ${
        isMaximized ? 'fixed inset-0 z-40' : ''
      }`}
      style={{ height: isMaximized ? '100vh' : `${terminalHeight}px` }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Terminal size={16} className="text-green-400" />
          
          {/* Terminal Tabs */}
          <div className="flex space-x-1">
            {terminals.map((terminal) => (
              <button
                key={terminal.id}
                onClick={() => setActiveTerminal(terminal.id)}
                className={`px-3 py-1 text-xs rounded transition-colors flex items-center space-x-1 ${
                  terminal.id === activeTerminal
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <span>{terminal.name}</span>
                {terminal.status === 'running' && (
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                )}
                {terminals.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTerminal(terminal.id);
                    }}
                    className="ml-1 p-0.5 hover:bg-red-500/20 rounded"
                  >
                    <X size={10} />
                  </button>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={createNewTerminal}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="New Terminal"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={copyOutput}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Copy Output"
          >
            <Copy size={14} />
          </button>
          
          <button
            onClick={() => {
              if (currentTerminalData) {
                setTerminals(prev => prev.map(term => 
                  term.id === activeTerminal ? { ...term, output: [] } : term
                ));
              }
            }}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Clear Terminal"
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Close Terminal"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div 
          ref={terminalRef}
          className="flex-1 p-2 overflow-y-auto font-mono text-sm text-gray-100 bg-gray-900"
          style={{ scrollbarWidth: 'thin' }}
        >
          {currentTerminalData?.output.map((item, index) => (
            <div key={index} className="leading-relaxed">
              <span 
                className={`${
                  item.type === 'command' ? 'text-green-400' :
                  item.type === 'error' ? 'text-red-400' :
                  item.type === 'system' ? 'text-blue-400' :
                  'text-gray-100'
                }`}
              >
                {item.content}
              </span>
            </div>
          ))}
          
          {/* Current Input Line */}
          <div className="flex items-center mt-1">
            <span className="text-green-400 mr-1">$</span>
            <input
              ref={inputRef}
              type="text"
              value={currentTerminalData?.input || ''}
              onChange={(e) => handleInputChange(e, activeTerminal)}
              onKeyDown={(e) => handleKeyDown(e, activeTerminal)}
              className="flex-1 bg-transparent text-gray-100 outline-none"
              style={{ caretColor: '#10b981' }}
              placeholder="Type a command..."
            />
            {currentTerminalData?.status === 'running' && (
              <div className="ml-2 flex items-center text-xs text-yellow-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-1"></div>
                Running...
              </div>
            )}
          </div>
        </div>

        {/* Terminal Info Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-gray-800 border-t border-gray-700 text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Folder size={12} />
              <span>{currentProject ? currentProject.name : 'No project'}</span>
            </div>
            {currentProject && (
              <div className="flex items-center space-x-1">
                <GitBranch size={12} />
                <span>main</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <span>Commands: {commandHistory.current.length}</span>
            <span>Status: {currentTerminalData?.status || 'ready'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedTerminal;