import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Split, RotateCw, Copy, Maximize2, Minimize2, 
  FileText, Code, Eye, Settings, X, Plus,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowLeftRight
} from 'lucide-react';
import CollaborativeCodeEditor from './CollaborativeCodeEditor';
import AppPreview from './AppPreview';

const SplitEditorView = ({ 
  files = [], 
  currentFile, 
  onFileChange, 
  onSave, 
  project,
  preferences,
  isOnline,
  autoSaveEnabled,
  professionalMode 
}) => {
  const [layout, setLayout] = useState('horizontal'); // 'horizontal' | 'vertical'
  const [panes, setPanes] = useState([
    { id: 'main', file: currentFile, type: 'editor', width: '50%' }
  ]);
  const [activePane, setActivePane] = useState('main');
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  
  const splitContainerRef = useRef(null);
  const resizeRef = useRef({ isDragging: false, startX: 0, startY: 0, startWidth: 0 });

  const paneTypes = [
    { id: 'editor', label: 'Code Editor', icon: Code },
    { id: 'preview', label: 'Live Preview', icon: Eye },
    { id: 'diff', label: 'Diff View', icon: Copy },
    { id: 'terminal', label: 'Terminal', icon: FileText }
  ];

  // Update main pane when current file changes
  useEffect(() => {
    setPanes(prev => prev.map(pane => 
      pane.id === 'main' ? { ...pane, file: currentFile } : pane
    ));
  }, [currentFile]);

  const addPane = useCallback((type = 'editor', file = null) => {
    const newPane = {
      id: `pane-${Date.now()}`,
      file: file || currentFile,
      type,
      width: layout === 'horizontal' ? `${100 / (panes.length + 1)}%` : '100%',
      height: layout === 'vertical' ? `${100 / (panes.length + 1)}%` : '100%'
    };

    // Adjust existing panes
    const adjustedPanes = panes.map(pane => ({
      ...pane,
      width: layout === 'horizontal' ? `${100 / (panes.length + 1)}%` : pane.width,
      height: layout === 'vertical' ? `${100 / (panes.length + 1)}%` : pane.height
    }));

    setPanes([...adjustedPanes, newPane]);
    setActivePane(newPane.id);
  }, [panes, layout, currentFile]);

  const removePane = useCallback((paneId) => {
    if (panes.length <= 1) return;
    
    const updatedPanes = panes.filter(pane => pane.id !== paneId);
    
    // Redistribute space
    const redistributedPanes = updatedPanes.map(pane => ({
      ...pane,
      width: layout === 'horizontal' ? `${100 / updatedPanes.length}%` : pane.width,
      height: layout === 'vertical' ? `${100 / updatedPanes.length}%` : pane.height
    }));

    setPanes(redistributedPanes);
    
    if (activePane === paneId && redistributedPanes.length > 0) {
      setActivePane(redistributedPanes[0].id);
    }
  }, [panes, layout, activePane]);

  const updatePaneFile = useCallback((paneId, file) => {
    setPanes(prev => prev.map(pane => 
      pane.id === paneId ? { ...pane, file } : pane
    ));
  }, []);

  const updatePaneType = useCallback((paneId, type) => {
    setPanes(prev => prev.map(pane => 
      pane.id === paneId ? { ...pane, type } : pane
    ));
  }, []);

  const toggleLayout = useCallback(() => {
    setLayout(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  }, []);

  const handleMouseDown = useCallback((e, paneIndex) => {
    e.preventDefault();
    resizeRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      paneIndex,
      startWidth: parseInt(panes[paneIndex].width),
      startHeight: parseInt(panes[paneIndex].height)
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panes]);

  const handleMouseMove = useCallback((e) => {
    if (!resizeRef.current.isDragging) return;
    
    const { startX, startY, paneIndex, startWidth, startHeight } = resizeRef.current;
    
    if (layout === 'horizontal') {
      const deltaX = e.clientX - startX;
      const containerWidth = splitContainerRef.current?.offsetWidth || 800;
      const newWidth = Math.max(20, Math.min(80, startWidth + (deltaX / containerWidth) * 100));
      
      setPanes(prev => prev.map((pane, index) => {
        if (index === paneIndex) {
          return { ...pane, width: `${newWidth}%` };
        } else if (index === paneIndex + 1) {
          return { ...pane, width: `${100 - newWidth}%` };
        }
        return pane;
      }));
    } else {
      const deltaY = e.clientY - startY;
      const containerHeight = splitContainerRef.current?.offsetHeight || 600;
      const newHeight = Math.max(20, Math.min(80, startHeight + (deltaY / containerHeight) * 100));
      
      setPanes(prev => prev.map((pane, index) => {
        if (index === paneIndex) {
          return { ...pane, height: `${newHeight}%` };
        } else if (index === paneIndex + 1) {
          return { ...pane, height: `${100 - newHeight}%` };
        }
        return pane;
      }));
    }
  }, [layout]);

  const handleMouseUp = useCallback(() => {
    resizeRef.current.isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const renderPaneContent = (pane) => {
    switch (pane.type) {
      case 'editor':
        return (
          <CollaborativeCodeEditor
            file={pane.file}
            onSave={onSave}
            onContentChange={onFileChange}
            preferences={preferences}
            isOnline={isOnline}
            autoSaveEnabled={autoSaveEnabled}
            professionalMode={professionalMode}
          />
        );
      
      case 'preview':
        return (
          <AppPreview
            currentFile={pane.file}
            files={files}
            project={project}
            professionalMode={professionalMode}
          />
        );
      
      case 'diff':
        return (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Copy size={32} className="mx-auto mb-2 opacity-50" />
              <p>Diff View</p>
              <p className="text-sm">Compare file versions</p>
            </div>
          </div>
        );
      
      case 'terminal':
        return (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FileText size={32} className="mx-auto mb-2 opacity-50" />
              <p>Terminal View</p>
              <p className="text-sm">Integrated terminal</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center space-x-2">
          <Split className="text-blue-400" size={16} />
          <span className="text-sm font-medium text-gray-300">Split Editor</span>
          <span className="text-xs text-gray-500">({panes.length} panes)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Layout toggle */}
          <button
            onClick={toggleLayout}
            className="btn btn-ghost btn-sm"
            title={`Switch to ${layout === 'horizontal' ? 'vertical' : 'horizontal'} layout`}
          >
            {layout === 'horizontal' ? <ArrowUpDown size={14} /> : <ArrowLeftRight size={14} />}
          </button>
          
          {/* Add pane */}
          <div className="relative">
            <button
              onClick={() => setShowLayoutSelector(!showLayoutSelector)}
              className="btn btn-ghost btn-sm"
              title="Add pane"
            >
              <Plus size={14} />
            </button>
            
            {showLayoutSelector && (
              <div className="absolute top-full right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg p-2 z-10 min-w-48">
                {paneTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      addPane(type.id);
                      setShowLayoutSelector(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-slate-700/50"
                  >
                    <type.icon size={14} />
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Split Container */}
      <div 
        ref={splitContainerRef}
        className={`flex-1 flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} overflow-hidden`}
      >
        {panes.map((pane, index) => (
          <React.Fragment key={pane.id}>
            {/* Pane */}
            <div
              className={`relative ${layout === 'horizontal' ? 'h-full' : 'w-full'} ${
                activePane === pane.id ? 'ring-1 ring-blue-500/50' : ''
              }`}
              style={{
                width: layout === 'horizontal' ? pane.width : '100%',
                height: layout === 'vertical' ? pane.height : '100%'
              }}
              onClick={() => setActivePane(pane.id)}
            >
              {/* Pane Header */}
              <div className="flex items-center justify-between px-3 py-1 bg-slate-800/50 border-b border-slate-700/50">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {paneTypes.find(type => type.id === pane.type)?.icon && (
                      React.createElement(paneTypes.find(type => type.id === pane.type).icon, { size: 12 })
                    )}
                    <span className="text-xs text-gray-400">
                      {paneTypes.find(type => type.id === pane.type)?.label}
                    </span>
                  </div>
                  
                  {pane.file && (
                    <>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-300">{pane.file.name}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {/* File selector */}
                  {(pane.type === 'editor' || pane.type === 'diff') && (
                    <select
                      value={pane.file?.id || ''}
                      onChange={(e) => {
                        const selectedFile = files.find(f => f.id === e.target.value);
                        if (selectedFile) updatePaneFile(pane.id, selectedFile);
                      }}
                      className="bg-transparent text-xs border-none text-gray-400 focus:outline-none"
                    >
                      <option value="">Select file...</option>
                      {files.filter(f => f.type === 'file').map(file => (
                        <option key={file.id} value={file.id}>{file.name}</option>
                      ))}
                    </select>
                  )}
                  
                  {/* Type selector */}
                  <select
                    value={pane.type}
                    onChange={(e) => updatePaneType(pane.id, e.target.value)}
                    className="bg-transparent text-xs border-none text-gray-400 focus:outline-none"
                  >
                    {paneTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                  
                  {/* Remove pane */}
                  {panes.length > 1 && (
                    <button
                      onClick={() => removePane(pane.id)}
                      className="text-gray-500 hover:text-white p-1 rounded"
                      title="Close pane"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Pane Content */}
              <div className="h-full">
                {renderPaneContent(pane)}
              </div>
            </div>

            {/* Resize Handle */}
            {index < panes.length - 1 && (
              <div
                className={`${layout === 'horizontal' ? 'w-1 h-full cursor-col-resize hover:bg-blue-500/50' : 'h-1 w-full cursor-row-resize hover:bg-blue-500/50'} bg-slate-700/50 transition-colors`}
                onMouseDown={(e) => handleMouseDown(e, index)}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SplitEditorView;