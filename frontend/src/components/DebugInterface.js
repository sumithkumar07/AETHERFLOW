import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Bug, Play, Pause, Square, RotateCcw,
  Circle, X, Plus, Minus, Eye, EyeOff, Code, Terminal, Clock,
  AlertTriangle, CheckCircle, Info, Activity, Cpu, MemoryStick
} from 'lucide-react';

const DebugInterface = ({ 
  isVisible, 
  onClose, 
  currentFile, 
  currentProject, 
  onSetBreakpoint,
  onRemoveBreakpoint,
  onStartDebugging,
  onStepDebug 
}) => {
  const [debugState, setDebugState] = useState('idle'); // idle, running, paused, error
  const [breakpoints, setBreakpoints] = useState([]);
  const [watchExpressions, setWatchExpressions] = useState([]);
  const [callStack, setCallStack] = useState([]);
  const [variables, setVariables] = useState([]);
  const [debugOutput, setDebugOutput] = useState([]);
  const [newWatchExpression, setNewWatchExpression] = useState('');
  const [activeTab, setActiveTab] = useState('variables');
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  // Mock debug session data
  const mockBreakpoints = [
    { id: 1, file: 'main.js', line: 15, condition: '', enabled: true, hitCount: 0 },
    { id: 2, file: 'utils.js', line: 42, condition: 'x > 10', enabled: true, hitCount: 3 },
    { id: 3, file: 'main.js', line: 28, condition: '', enabled: false, hitCount: 0 }
  ];

  const mockVariables = [
    { name: 'user', value: '{ id: 1, name: "John Doe", email: "john@example.com" }', type: 'Object', expandable: true },
    { name: 'count', value: '42', type: 'number', expandable: false },
    { name: 'isActive', value: 'true', type: 'boolean', expandable: false },
    { name: 'items', value: 'Array(5)', type: 'Array', expandable: true },
    { name: 'config', value: '{ debug: true, apiUrl: "localhost:3000" }', type: 'Object', expandable: true }
  ];

  const mockCallStack = [
    { id: 1, function: 'processData', file: 'main.js', line: 15, isActive: true },
    { id: 2, function: 'handleSubmit', file: 'form.js', line: 78, isActive: false },
    { id: 3, function: 'onClick', file: 'Button.jsx', line: 12, isActive: false },
    { id: 4, function: '(anonymous)', file: 'app.js', line: 145, isActive: false }
  ];

  useEffect(() => {
    if (isVisible) {
      setBreakpoints(mockBreakpoints);
      setVariables(mockVariables);
      setCallStack(mockCallStack);
      setWatchExpressions([
        { id: 1, expression: 'user.name', value: '"John Doe"', error: null },
        { id: 2, expression: 'items.length', value: '5', error: null },
        { id: 3, expression: 'invalidVar', value: null, error: 'ReferenceError: invalidVar is not defined' }
      ]);
    }
  }, [isVisible]);

  const handleStartDebugging = useCallback(() => {
    setDebugState('running');
    setDebugOutput(prev => [...prev, {
      id: Date.now(),
      type: 'info',
      message: 'Debug session started',
      timestamp: new Date()
    }]);
    
    // Simulate hitting a breakpoint
    setTimeout(() => {
      setDebugState('paused');
      setDebugOutput(prev => [...prev, {
        id: Date.now(),
        type: 'breakpoint',
        message: 'Breakpoint hit at main.js:15',
        timestamp: new Date()
      }]);
      
      setPerformanceMetrics({
        memoryUsage: '24.5 MB',
        cpuUsage: '12%',
        executionTime: '1.24s',
        callsPerSecond: 1250
      });
    }, 2000);
  }, []);

  const handleStopDebugging = useCallback(() => {
    setDebugState('idle');
    setPerformanceMetrics(null);
    setDebugOutput(prev => [...prev, {
      id: Date.now(),
      type: 'info',
      message: 'Debug session ended',
      timestamp: new Date()
    }]);
  }, []);

  const handleStep = useCallback((type) => {
    setDebugOutput(prev => [...prev, {
      id: Date.now(),
      type: 'debug',
      message: `Step ${type}`,
      timestamp: new Date()
    }]);
    
    // Update variables and call stack after stepping
    if (type === 'into' || type === 'over') {
      setVariables(prev => prev.map(v => 
        v.name === 'count' ? { ...v, value: String(parseInt(v.value) + 1) } : v
      ));
    }
  }, []);

  const handleAddBreakpoint = useCallback((file, line, condition = '') => {
    const newBreakpoint = {
      id: Date.now(),
      file,
      line,
      condition,
      enabled: true,
      hitCount: 0
    };
    setBreakpoints(prev => [...prev, newBreakpoint]);
    onSetBreakpoint?.(file, line, condition);
  }, [onSetBreakpoint]);

  const handleToggleBreakpoint = useCallback((id) => {
    setBreakpoints(prev => prev.map(bp => 
      bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
    ));
  }, []);

  const handleRemoveBreakpoint = useCallback((id) => {
    const breakpoint = breakpoints.find(bp => bp.id === id);
    setBreakpoints(prev => prev.filter(bp => bp.id !== id));
    if (breakpoint) {
      onRemoveBreakpoint?.(breakpoint.file, breakpoint.line);
    }
  }, [breakpoints, onRemoveBreakpoint]);

  const handleAddWatchExpression = useCallback(() => {
    if (!newWatchExpression.trim()) return;
    
    const newWatch = {
      id: Date.now(),
      expression: newWatchExpression.trim(),
      value: null,
      error: null
    };
    
    // Simulate expression evaluation
    try {
      // Mock evaluation
      newWatch.value = '"evaluated result"';
    } catch (error) {
      newWatch.error = error.message;
    }
    
    setWatchExpressions(prev => [...prev, newWatch]);
    setNewWatchExpression('');
  }, [newWatchExpression]);

  const handleRemoveWatchExpression = useCallback((id) => {
    setWatchExpressions(prev => prev.filter(w => w.id !== id));
  }, []);

  if (!isVisible) return null;

  const debugTabs = [
    { id: 'variables', label: 'Variables', icon: Code },
    { id: 'watch', label: 'Watch', icon: Eye },
    { id: 'callstack', label: 'Call Stack', icon: Activity },
    { id: 'breakpoints', label: 'Breakpoints', icon: Circle },
    { id: 'output', label: 'Output', icon: Terminal }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'variables':
        return (
          <div className="space-y-2">
            {variables.map((variable, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-700/50 rounded">
                <div className="flex items-center space-x-2">
                  {variable.expandable && (
                    <button className="text-gray-400 hover:text-white">
                      <Plus size={12} />
                    </button>
                  )}
                  <span className="text-blue-300 font-mono text-sm">{variable.name}</span>
                  <span className="text-gray-500 text-xs">({variable.type})</span>
                </div>
                <div className="text-green-300 font-mono text-sm max-w-xs truncate">
                  {variable.value}
                </div>
              </div>
            ))}
          </div>
        );

      case 'watch':
        return (
          <div className="space-y-2">
            <div className="flex space-x-2 p-2 border-b border-slate-600">
              <input
                type="text"
                value={newWatchExpression}
                onChange={(e) => setNewWatchExpression(e.target.value)}
                placeholder="Add expression to watch..."
                className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAddWatchExpression()}
              />
              <button
                onClick={handleAddWatchExpression}
                className="btn btn-primary btn-xs"
                disabled={!newWatchExpression.trim()}
              >
                <Plus size={12} />
              </button>
            </div>
            
            {watchExpressions.map((watch) => (
              <div key={watch.id} className="flex items-center justify-between p-2 hover:bg-slate-700/50 rounded">
                <div className="flex-1 min-w-0">
                  <div className="text-blue-300 font-mono text-sm">{watch.expression}</div>
                  {watch.error ? (
                    <div className="text-red-400 text-xs mt-1">{watch.error}</div>
                  ) : (
                    <div className="text-green-300 font-mono text-xs">{watch.value}</div>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveWatchExpression(watch.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        );

      case 'callstack':
        return (
          <div className="space-y-1">
            {callStack.map((frame) => (
              <div
                key={frame.id}
                className={`p-2 rounded cursor-pointer ${
                  frame.isActive 
                    ? 'bg-blue-600/20 border border-blue-500/30' 
                    : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="text-white font-medium text-sm">{frame.function}</div>
                <div className="text-gray-400 text-xs">
                  {frame.file}:{frame.line}
                </div>
              </div>
            ))}
          </div>
        );

      case 'breakpoints':
        return (
          <div className="space-y-2">
            {breakpoints.map((breakpoint) => (
              <div key={breakpoint.id} className="flex items-center space-x-2 p-2 hover:bg-slate-700/50 rounded">
                <button
                  onClick={() => handleToggleBreakpoint(breakpoint.id)}
                  className={`${breakpoint.enabled ? 'text-red-400' : 'text-gray-500'}`}
                >
                  <Circle size={12} fill="currentColor" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm">
                    {breakpoint.file}:{breakpoint.line}
                  </div>
                  {breakpoint.condition && (
                    <div className="text-blue-300 text-xs font-mono">
                      {breakpoint.condition}
                    </div>
                  )}
                  <div className="text-gray-500 text-xs">
                    Hits: {breakpoint.hitCount}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveBreakpoint(breakpoint.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        );

      case 'output':
        return (
          <div className="space-y-1 max-h-80 overflow-y-auto font-mono text-sm">
            {debugOutput.map((output) => (
              <div
                key={output.id}
                className={`p-2 rounded ${
                  output.type === 'error' ? 'bg-red-900/20 text-red-300' :
                  output.type === 'warning' ? 'bg-yellow-900/20 text-yellow-300' :
                  output.type === 'breakpoint' ? 'bg-blue-900/20 text-blue-300' :
                  'text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {output.type === 'error' && <AlertTriangle size={12} />}
                  {output.type === 'warning' && <AlertTriangle size={12} />}
                  {output.type === 'breakpoint' && <Circle size={12} />}
                  {output.type === 'info' && <Info size={12} />}
                  <span>{output.message}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {output.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="p-4 text-gray-500">Select a tab to view debug information</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl h-[85vh] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Bug size={20} className="text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Debug Console</h2>
            {currentFile && (
              <span className="text-sm text-gray-400">- {currentFile.name}</span>
            )}
            <div className={`px-2 py-1 rounded text-xs ${
              debugState === 'running' ? 'bg-green-600' :
              debugState === 'paused' ? 'bg-yellow-600' :
              debugState === 'error' ? 'bg-red-600' :
              'bg-gray-600'
            }`}>
              {debugState.toUpperCase()}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={16} />
          </button>
        </div>

        {/* Debug Controls */}
        <div className="flex items-center space-x-2 p-4 border-b border-slate-700 bg-slate-700/20">
          <div className="flex items-center space-x-1">
            {debugState === 'idle' ? (
              <button onClick={handleStartDebugging} className="btn btn-primary btn-sm">
                <Play size={14} />
                Start
              </button>
            ) : (
              <button onClick={handleStopDebugging} className="btn btn-secondary btn-sm">
                <Square size={14} />
                Stop
              </button>
            )}
            
            <button
              onClick={() => handleStep('over')}
              disabled={debugState !== 'paused'}
              className="btn btn-ghost btn-sm"
              title="Step Over"
            >
              <ArrowRight size={14} />
            </button>
            
            <button
              onClick={() => handleStep('into')}
              disabled={debugState !== 'paused'}
              className="btn btn-ghost btn-sm"
              title="Step Into"
            >
              <ChevronDown size={14} />
            </button>
            
            <button
              onClick={() => handleStep('out')}
              disabled={debugState !== 'paused'}
              className="btn btn-ghost btn-sm"
              title="Step Out"
            >
              <ChevronRight size={14} />
            </button>
            
            <button
              onClick={() => setDebugState(debugState === 'paused' ? 'running' : 'paused')}
              disabled={debugState === 'idle'}
              className="btn btn-ghost btn-sm"
              title={debugState === 'paused' ? 'Continue' : 'Pause'}
            >
              {debugState === 'paused' ? <Play size={14} /> : <Pause size={14} />}
            </button>
            
            <button className="btn btn-ghost btn-sm" title="Restart">
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Performance Metrics */}
          {performanceMetrics && (
            <div className="flex items-center space-x-4 ml-8 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <MemoryStick size={12} />
                <span>{performanceMetrics.memoryUsage}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Cpu size={12} />
                <span>{performanceMetrics.cpuUsage}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>{performanceMetrics.executionTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity size={12} />
                <span>{performanceMetrics.callsPerSecond}/s</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex h-full">
          {/* Debug Panels */}
          <div className="w-1/3 border-r border-slate-700 flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-700 bg-slate-700/30 overflow-x-auto">
              {debugTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-1 px-3 py-2 text-xs font-medium whitespace-nowrap ${
                    activeTab === id
                      ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-3">
              {renderTabContent()}
            </div>
          </div>

          {/* Debug Output/Console */}
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-slate-700 bg-slate-700/20">
              <h3 className="text-sm font-medium text-white">Debug Console</h3>
            </div>
            
            <div className="flex-1 overflow-auto p-3 bg-black/20 font-mono text-sm">
              <div className="space-y-1">
                <div className="text-gray-400">Debug console ready. Start debugging to see output.</div>
                {debugState !== 'idle' && (
                  <>
                    <div className="text-blue-300">&gt; Debugging {currentFile?.name || 'application'}</div>
                    {debugOutput.map((output) => (
                      <div key={output.id} className={`${
                        output.type === 'error' ? 'text-red-400' :
                        output.type === 'warning' ? 'text-yellow-400' :
                        output.type === 'breakpoint' ? 'text-orange-400' :
                        'text-green-400'
                      }`}>
                        [{output.timestamp.toLocaleTimeString()}] {output.message}
                      </div>
                    ))}
                    <div className="text-gray-500">_</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInterface;