import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Terminal, Bug, AlertTriangle, Info, CheckCircle, 
  X, Maximize2, Minimize2, RotateCcw, Download, 
  Filter, Search, Settings, Play, Square
} from 'lucide-react';

const IntegratedOutputPanel = ({ isVisible, onToggle, currentProject, height = 300 }) => {
  const [activeTab, setActiveTab] = useState('output');
  const [outputs, setOutputs] = useState({
    output: [],
    problems: [],
    debug: [],
    terminal: []
  });
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  
  const outputRef = useRef(null);
  const problemsRef = useRef(null);
  const debugRef = useRef(null);
  const terminalRef = useRef(null);

  const tabs = [
    { id: 'output', label: 'Output', icon: Terminal, count: outputs.output.length },
    { id: 'problems', label: 'Problems', icon: AlertTriangle, count: outputs.problems.length },
    { id: 'debug', label: 'Debug Console', icon: Bug, count: outputs.debug.length },
    { id: 'terminal', label: 'Terminal', icon: Terminal, count: 0 }
  ];

  // Mock data generation
  useEffect(() => {
    const generateMockOutput = () => {
      const mockOutputs = [
        { id: 1, type: 'info', timestamp: new Date(), message: 'Server started on port 3000', source: 'webpack' },
        { id: 2, type: 'success', timestamp: new Date(), message: 'Compiled successfully!', source: 'webpack' },
        { id: 3, type: 'warning', timestamp: new Date(), message: 'Warning: unused import detected', source: 'eslint' },
        { id: 4, type: 'info', timestamp: new Date(), message: 'Hot reload enabled', source: 'webpack' }
      ];

      const mockProblems = [
        { 
          id: 1, 
          type: 'error', 
          file: 'src/App.js', 
          line: 42, 
          column: 15, 
          message: 'Unexpected token', 
          source: 'TypeScript',
          severity: 'error'
        },
        { 
          id: 2, 
          type: 'warning', 
          file: 'src/components/Header.js', 
          line: 28, 
          column: 8, 
          message: 'Unused variable "data"', 
          source: 'ESLint',
          severity: 'warning'
        },
        { 
          id: 3, 
          type: 'info', 
          file: 'src/utils/helpers.js', 
          line: 15, 
          column: 22, 
          message: 'Consider using async/await', 
          source: 'ESLint',
          severity: 'info'
        }
      ];

      const mockDebug = [
        { id: 1, type: 'log', timestamp: new Date(), message: 'Debug: API call started', source: 'console' },
        { id: 2, type: 'error', timestamp: new Date(), message: 'Error: Network request failed', source: 'console' },
        { id: 3, type: 'info', timestamp: new Date(), message: 'Debug: State updated', source: 'console' }
      ];

      setOutputs({
        output: mockOutputs,
        problems: mockProblems,
        debug: mockDebug,
        terminal: []
      });
    };

    if (isVisible) {
      generateMockOutput();
    }
  }, [isVisible, currentProject]);

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScroll) {
      const refs = { output: outputRef, problems: problemsRef, debug: debugRef, terminal: terminalRef };
      const ref = refs[activeTab];
      if (ref?.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }
  }, [outputs, activeTab, autoScroll]);

  const clearOutput = useCallback(() => {
    setOutputs(prev => ({
      ...prev,
      [activeTab]: []
    }));
  }, [activeTab]);

  const exportOutput = useCallback(() => {
    const content = outputs[activeTab].map(item => 
      `[${item.timestamp?.toLocaleTimeString() || 'N/A'}] ${item.message || item.file + ':' + item.line + ' - ' + item.message}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [outputs, activeTab]);

  const getIconForType = (type) => {
    switch (type) {
      case 'error': return <AlertTriangle size={14} className="text-red-400" />;
      case 'warning': return <AlertTriangle size={14} className="text-yellow-400" />;
      case 'info': return <Info size={14} className="text-blue-400" />;
      case 'success': return <CheckCircle size={14} className="text-green-400" />;
      default: return <Info size={14} className="text-gray-400" />;
    }
  };

  const filteredOutput = outputs[activeTab].filter(item => {
    const matchesSearch = searchQuery === '' || 
      (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.file && item.file.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filter === 'all' || item.type === filter || item.severity === filter;
    
    return matchesSearch && matchesFilter;
  });

  if (!isVisible) return null;

  return (
    <div 
      className={`bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 ${
        isMaximized ? 'fixed inset-x-0 bottom-0 top-16 z-40' : 'relative'
      }`}
      style={{ height: isMaximized ? 'auto' : `${height}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
        <div className="flex items-center space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-slate-600 text-xs px-1.5 py-0.5 rounded">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-800/50 border border-slate-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-32"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
          </select>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`btn btn-ghost btn-xs ${autoScroll ? 'text-blue-400' : 'text-gray-400'}`}
            title="Auto-scroll"
          >
            <Play size={12} />
          </button>

          {/* Clear */}
          <button
            onClick={clearOutput}
            className="btn btn-ghost btn-xs"
            title="Clear output"
          >
            <RotateCcw size={12} />
          </button>

          {/* Export */}
          <button
            onClick={exportOutput}
            className="btn btn-ghost btn-xs"
            title="Export output"
          >
            <Download size={12} />
          </button>

          {/* Maximize/Minimize */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="btn btn-ghost btn-xs"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>

          {/* Close */}
          <button
            onClick={onToggle}
            className="btn btn-ghost btn-xs text-gray-400 hover:text-white"
            title="Close panel"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={activeTab === 'output' ? outputRef : activeTab === 'problems' ? problemsRef : activeTab === 'debug' ? debugRef : terminalRef}
        className="h-full overflow-y-auto p-4 font-mono text-sm"
      >
        {activeTab === 'problems' ? (
          <div className="space-y-2">
            {filteredOutput.map(problem => (
              <div
                key={problem.id}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-800/30 cursor-pointer"
                onClick={() => {
                  // Open file at line/column
                  console.log(`Navigate to ${problem.file}:${problem.line}:${problem.column}`);
                }}
              >
                {getIconForType(problem.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-blue-400 font-medium">{problem.file}</span>
                    <span className="text-gray-500">Line {problem.line}, Col {problem.column}</span>
                    <span className="text-gray-400 text-xs">{problem.source}</span>
                  </div>
                  <p className="text-gray-200 mt-1">{problem.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredOutput.map(item => (
              <div
                key={item.id}
                className="flex items-start space-x-3 py-1 hover:bg-slate-800/20 rounded px-2"
              >
                <span className="text-gray-500 text-xs shrink-0 w-20">
                  {item.timestamp?.toLocaleTimeString() || ''}
                </span>
                {item.type && (
                  <div className="shrink-0 mt-0.5">
                    {getIconForType(item.type)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-gray-200">{item.message}</span>
                  {item.source && (
                    <span className="text-gray-500 text-xs ml-2">({item.source})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredOutput.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Terminal size={32} className="mx-auto mb-2 opacity-50" />
              <p>No {activeTab} messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegratedOutputPanel;