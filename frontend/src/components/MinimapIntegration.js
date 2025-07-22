import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize2, Minimize2, Settings, Eye, EyeOff } from 'lucide-react';

const MinimapIntegration = ({ 
  editorRef, 
  content = '', 
  language = 'javascript',
  theme = 'dark',
  isVisible = true,
  onToggle,
  onNavigate,
  className = ''
}) => {
  const [minimapData, setMinimapData] = useState([]);
  const [viewport, setViewport] = useState({ top: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    showScrollbar: true,
    showColors: true,
    autoHide: false,
    renderCharacters: true,
    size: 'medium' // small, medium, large
  });
  
  const minimapRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef({ startY: 0, startScrollTop: 0 });

  // Monaco editor integration
  useEffect(() => {
    if (!editorRef?.current) return;

    const editor = editorRef.current;
    
    const updateViewport = () => {
      const visibleRanges = editor.getVisibleRanges();
      if (visibleRanges.length > 0) {
        const lineHeight = editor.getOption(editor.constructor.EditorOption.lineHeight);
        const totalLines = editor.getModel()?.getLineCount() || 0;
        const containerHeight = minimapRef.current?.offsetHeight || 300;
        
        const top = (visibleRanges[0].startLineNumber / totalLines) * containerHeight;
        const height = ((visibleRanges[0].endLineNumber - visibleRanges[0].startLineNumber) / totalLines) * containerHeight;
        
        setViewport({ top, height: Math.max(height, 20) });
      }
    };

    // Listen to scroll and content changes
    const scrollDisposable = editor.onDidScrollChange(updateViewport);
    const changeDisposable = editor.onDidChangeModelContent(() => {
      updateViewport();
      generateMinimapData();
    });
    
    updateViewport();
    
    return () => {
      scrollDisposable?.dispose();
      changeDisposable?.dispose();
    };
  }, [editorRef]);

  // Generate minimap data from content
  const generateMinimapData = useCallback(() => {
    if (!content) {
      setMinimapData([]);
      return;
    }

    const lines = content.split('\n');
    const data = lines.map((line, index) => {
      // Simple syntax highlighting detection
      const lineData = {
        lineNumber: index + 1,
        content: line,
        tokens: analyzeLineTokens(line, language),
        hasError: false,
        hasWarning: false,
        hasBreakpoint: false,
        isModified: false
      };
      
      return lineData;
    });
    
    setMinimapData(data);
  }, [content, language]);

  // Simple token analysis for syntax highlighting
  const analyzeLineTokens = (line, language) => {
    const tokens = [];
    
    if (language === 'javascript' || language === 'typescript') {
      // Keywords
      const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export'];
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        let match;
        while ((match = regex.exec(line)) !== null) {
          tokens.push({
            type: 'keyword',
            start: match.index,
            end: match.index + keyword.length,
            color: '#569cd6'
          });
        }
      });
      
      // Strings
      const stringMatches = line.match(/(["'`])(.*?)\1/g);
      if (stringMatches) {
        stringMatches.forEach(match => {
          const index = line.indexOf(match);
          tokens.push({
            type: 'string',
            start: index,
            end: index + match.length,
            color: '#ce9178'
          });
        });
      }
      
      // Comments
      const commentMatch = line.match(/\/\/.*/);
      if (commentMatch) {
        tokens.push({
          type: 'comment',
          start: commentMatch.index,
          end: line.length,
          color: '#6a9955'
        });
      }
    }
    
    return tokens;
  };

  // Handle minimap click/drag navigation
  const handleMinimapClick = useCallback((e) => {
    if (!minimapRef.current || !editorRef?.current) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const totalHeight = rect.height;
    const totalLines = minimapData.length;
    const targetLine = Math.max(1, Math.floor((y / totalHeight) * totalLines));
    
    // Navigate editor to target line
    const editor = editorRef.current;
    editor.revealLineInCenter(targetLine);
    editor.setPosition({ lineNumber: targetLine, column: 1 });
    
    if (onNavigate) {
      onNavigate(targetLine);
    }
  }, [minimapData, onNavigate, editorRef]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    dragRef.current = {
      startY: e.clientY,
      startScrollTop: editorRef?.current?.getScrollTop() || 0
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [editorRef]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !minimapRef.current || !editorRef?.current) return;
    
    const deltaY = e.clientY - dragRef.current.startY;
    const rect = minimapRef.current.getBoundingClientRect();
    const scrollRatio = deltaY / rect.height;
    const editor = editorRef.current;
    const maxScrollTop = editor.getScrollHeight() - editor.getLayoutInfo().height;
    const newScrollTop = Math.max(0, Math.min(maxScrollTop, dragRef.current.startScrollTop + (scrollRatio * maxScrollTop)));
    
    editor.setScrollTop(newScrollTop);
  }, [isDragging, editorRef]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    generateMinimapData();
  }, [generateMinimapData]);

  // Render minimap line
  const renderLine = (lineData, index) => {
    const { tokens, content } = lineData;
    const maxChars = settings.size === 'small' ? 80 : settings.size === 'medium' ? 120 : 160;
    const displayContent = content.slice(0, maxChars);
    
    return (
      <div
        key={index}
        className={`minimap-line ${settings.size} ${
          settings.showColors ? 'with-colors' : 'no-colors'
        }`}
        style={{
          height: settings.size === 'small' ? '1px' : settings.size === 'medium' ? '2px' : '3px',
          fontSize: settings.size === 'small' ? '1px' : settings.size === 'medium' ? '2px' : '3px'
        }}
      >
        {settings.renderCharacters ? (
          <div className="minimap-text">
            {tokens.length > 0 && settings.showColors ? (
              <div className="relative">
                {tokens.map((token, tokenIndex) => (
                  <span
                    key={tokenIndex}
                    className="absolute"
                    style={{
                      left: `${(token.start / content.length) * 100}%`,
                      width: `${((token.end - token.start) / content.length) * 100}%`,
                      color: token.color,
                      backgroundColor: token.type === 'keyword' ? token.color + '20' : 'transparent'
                    }}
                  >
                    {content.slice(token.start, token.end)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">{displayContent}</span>
            )}
          </div>
        ) : (
          <div 
            className="minimap-block"
            style={{
              backgroundColor: content.trim() ? (
                settings.showColors ? getLineColor(lineData) : '#404040'
              ) : 'transparent',
              opacity: content.trim() ? 0.8 : 0.1
            }}
          />
        )}
      </div>
    );
  };

  const getLineColor = (lineData) => {
    const { tokens, content } = lineData;
    
    if (tokens.length === 0) return '#404040';
    
    // Determine primary token type
    const keywordTokens = tokens.filter(t => t.type === 'keyword');
    const stringTokens = tokens.filter(t => t.type === 'string');
    const commentTokens = tokens.filter(t => t.type === 'comment');
    
    if (commentTokens.length > 0) return '#6a9955';
    if (keywordTokens.length > 0) return '#569cd6';
    if (stringTokens.length > 0) return '#ce9178';
    
    return '#404040';
  };

  if (!isVisible) return null;

  return (
    <div className={`minimap-container ${className}`}>
      <div className="minimap-header">
        <div className="flex items-center space-x-2">
          <Eye size={12} className="text-gray-400" />
          <span className="text-xs text-gray-400">Minimap</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="minimap-btn"
            title="Minimap settings"
          >
            <Settings size={12} />
          </button>
          
          <button
            onClick={onToggle}
            className="minimap-btn"
            title="Hide minimap"
          >
            <EyeOff size={12} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="minimap-settings">
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.showColors}
                onChange={(e) => setSettings(prev => ({ ...prev, showColors: e.target.checked }))}
              />
              Syntax Colors
            </label>
          </div>
          
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.renderCharacters}
                onChange={(e) => setSettings(prev => ({ ...prev, renderCharacters: e.target.checked }))}
              />
              Render Characters
            </label>
          </div>
          
          <div className="setting-item">
            <label>Size:</label>
            <select
              value={settings.size}
              onChange={(e) => setSettings(prev => ({ ...prev, size: e.target.value }))}
              className="minimap-select"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      )}

      <div 
        ref={minimapRef}
        className="minimap-content"
        onClick={handleMinimapClick}
        onMouseDown={handleMouseDown}
      >
        <div className="minimap-code">
          {minimapData.map((lineData, index) => renderLine(lineData, index))}
        </div>
        
        {/* Viewport indicator */}
        <div
          className="minimap-viewport"
          style={{
            top: `${viewport.top}px`,
            height: `${viewport.height}px`,
          }}
        />
      </div>

      <style jsx>{`
        .minimap-container {
          width: 120px;
          height: 100%;
          background: rgba(15, 23, 42, 0.9);
          border-left: 1px solid rgba(71, 85, 105, 0.3);
          display: flex;
          flex-direction: column;
        }
        
        .minimap-header {
          display: flex;
          items-center;
          justify-content: space-between;
          padding: 8px;
          border-bottom: 1px solid rgba(71, 85, 105, 0.3);
        }
        
        .minimap-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
        }
        
        .minimap-btn:hover {
          color: white;
          background: rgba(71, 85, 105, 0.5);
        }
        
        .minimap-settings {
          padding: 8px;
          border-bottom: 1px solid rgba(71, 85, 105, 0.3);
          font-size: 11px;
        }
        
        .setting-item {
          display: flex;
          items-center;
          justify-content: space-between;
          margin-bottom: 4px;
          color: #94a3b8;
        }
        
        .minimap-select {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(71, 85, 105, 0.3);
          color: white;
          padding: 2px 4px;
          border-radius: 4px;
          font-size: 10px;
        }
        
        .minimap-content {
          flex: 1;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          user-select: none;
        }
        
        .minimap-code {
          height: 100%;
          padding: 4px;
        }
        
        .minimap-line {
          display: block;
          margin-bottom: 1px;
          position: relative;
          overflow: hidden;
        }
        
        .minimap-line.small {
          height: 1px;
        }
        
        .minimap-line.medium {
          height: 2px;
        }
        
        .minimap-line.large {
          height: 3px;
        }
        
        .minimap-text {
          font-family: 'Monaco', 'Menlo', monospace;
          white-space: nowrap;
          overflow: hidden;
          line-height: 1;
        }
        
        .minimap-block {
          width: 100%;
          height: 100%;
        }
        
        .minimap-viewport {
          position: absolute;
          right: 0;
          width: 100%;
          background: rgba(59, 130, 246, 0.3);
          border: 1px solid rgba(59, 130, 246, 0.6);
          pointer-events: none;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default MinimapIntegration;