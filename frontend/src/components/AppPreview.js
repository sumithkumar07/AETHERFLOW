import React, { useState, useEffect, useRef } from 'react';
import { Play, Eye, Code, RefreshCw, ExternalLink, Monitor, Smartphone, Tablet, Settings, AlertCircle } from 'lucide-react';

const AppPreview = ({ currentFile, files, project }) => {
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const iframeRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  // Device dimensions for responsive preview
  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  useEffect(() => {
    if (currentFile && autoRefresh) {
      // Debounced refresh on file changes
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        generatePreview();
      }, 1000); // 1 second debounce
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [currentFile, autoRefresh]);

  const generatePreview = async () => {
    if (!currentFile || !files) return;

    setIsLoading(true);
    setPreviewError(null);

    try {
      // Detect project type and generate appropriate preview
      const projectType = detectProjectType();
      let previewContent = '';

      switch (projectType) {
        case 'html':
          previewContent = generateHTMLPreview();
          break;
        case 'react':
          previewContent = await generateReactPreview();
          break;
        case 'javascript':
          previewContent = generateJavaScriptPreview();
          break;
        case 'css':
          previewContent = generateCSSPreview();
          break;
        default:
          previewContent = generateDefaultPreview();
      }

      // Create blob URL for preview
      const blob = new Blob([previewContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

    } catch (error) {
      console.error('Preview generation error:', error);
      setPreviewError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const detectProjectType = () => {
    if (!currentFile) return 'default';
    
    const extension = currentFile.name.split('.').pop()?.toLowerCase();
    const hasReactFiles = files.some(file => 
      file.name.includes('jsx') || 
      file.name.includes('package.json') || 
      file.content?.includes('import React')
    );

    if (extension === 'html') return 'html';
    if (hasReactFiles || extension === 'jsx') return 'react';
    if (extension === 'js') return 'javascript';
    if (extension === 'css') return 'css';
    
    return 'default';
  };

  const generateHTMLPreview = () => {
    let htmlContent = currentFile.content || '';
    
    // Find and inject CSS files
    const cssFiles = files.filter(file => file.name.endsWith('.css'));
    let cssContent = '';
    cssFiles.forEach(cssFile => {
      if (cssFile.content) {
        cssContent += `<style>\n${cssFile.content}\n</style>\n`;
      }
    });

    // Find and inject JS files
    const jsFiles = files.filter(file => file.name.endsWith('.js') && !file.name.includes('node_modules'));
    let jsContent = '';
    jsFiles.forEach(jsFile => {
      if (jsFile.content) {
        jsContent += `<script>\n${jsFile.content}\n</script>\n`;
      }
    });

    // If no complete HTML structure, wrap content
    if (!htmlContent.includes('<html>')) {
      htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeCode Preview - ${project?.name || 'Project'}</title>
  ${cssContent}
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    .preview-info { background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="preview-info">
    🚀 VibeCode Live Preview - ${currentFile.name} - Last updated: ${new Date().toLocaleTimeString()}
  </div>
  ${htmlContent}
  ${jsContent}
  <script>
    // Console logging for preview
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = function(...args) {
      originalLog.apply(console, args);
      parent.postMessage({ type: 'console', level: 'log', args: args.map(String) }, '*');
    };
    
    console.error = function(...args) {
      originalError.apply(console, args);
      parent.postMessage({ type: 'console', level: 'error', args: args.map(String) }, '*');
    };
    
    console.warn = function(...args) {
      originalWarn.apply(console, args);
      parent.postMessage({ type: 'console', level: 'warn', args: args.map(String) }, '*');
    };
    
    // Error handling
    window.addEventListener('error', (e) => {
      parent.postMessage({ type: 'console', level: 'error', args: [e.message] }, '*');
    });
  </script>
</body>
</html>`;
    } else {
      // Inject our preview enhancements into existing HTML
      htmlContent = htmlContent.replace('</head>', `${cssContent}\n</head>`);
      htmlContent = htmlContent.replace('</body>', `${jsContent}\n</body>`);
    }

    return htmlContent;
  };

  const generateReactPreview = async () => {
    // Simple React preview using CDN for quick rendering
    const reactCode = currentFile.content || '';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview - ${project?.name || 'Project'}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', roboto, sans-serif; }
    .preview-info { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; margin-bottom: 20px; border-radius: 8px; font-size: 12px; }
    #root { min-height: 400px; }
    .error-boundary { background: #fee; border: 1px solid #fcc; padding: 15px; border-radius: 5px; margin: 10px 0; color: #c33; }
  </style>
</head>
<body>
  <div class="preview-info">
    ⚛️ React Live Preview - ${currentFile.name} - Powered by VibeCode IDE
  </div>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;
    
    // Error Boundary Component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
      }
      
      render() {
        if (this.state.hasError) {
          return (
            <div className="error-boundary">
              <h3>⚠️ Component Error</h3>
              <p>{this.state.error?.toString()}</p>
            </div>
          );
        }
        return this.props.children;
      }
    }
    
    try {
      // User's React component code
      ${reactCode.replace(/export default/g, 'const PreviewComponent =')}
      
      // Render the component
      const App = () => {
        return (
          <ErrorBoundary>
            <PreviewComponent />
          </ErrorBoundary>
        );
      };
      
      ReactDOM.render(<App />, document.getElementById('root'));
      
    } catch (error) {
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary">
          <h3>⚠️ Preview Error</h3>
          <p>\${error.message}</p>
          <p><small>Check your code syntax and try again</small></p>
        </div>
      \`;
    }
  </script>
  
  <script>
    // Console logging for preview
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = function(...args) {
      originalLog.apply(console, args);
      parent.postMessage({ type: 'console', level: 'log', args: args.map(String) }, '*');
    };
    
    console.error = function(...args) {
      originalError.apply(console, args);
      parent.postMessage({ type: 'console', level: 'error', args: args.map(String) }, '*');
    };
  </script>
</body>
</html>`;
  };

  const generateJavaScriptPreview = () => {
    const jsCode = currentFile.content || '';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JavaScript Preview - ${project?.name || 'Project'}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: monospace; background: #f5f5f5; }
    .preview-info { background: #ffd700; color: #333; padding: 15px; margin-bottom: 20px; border-radius: 8px; font-size: 12px; }
    #output { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="preview-info">
    📜 JavaScript Live Preview - ${currentFile.name} - Output below:
  </div>
  <div id="output">Running JavaScript...</div>
  
  <script>
    const output = document.getElementById('output');
    
    // Capture console output
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = function(...args) {
      const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)).join(' ');
      logs.push({ type: 'log', message });
      updateOutput();
      originalLog.apply(console, arguments);
    };
    
    console.error = function(...args) {
      const message = args.map(arg => String(arg)).join(' ');
      logs.push({ type: 'error', message });
      updateOutput();
      originalError.apply(console, arguments);
    };
    
    function updateOutput() {
      output.innerHTML = logs.map(log => \`<div style="color: \${log.type === 'error' ? 'red' : 'black'};">\${log.message}</div>\`).join('');
    }
    
    // Error handling
    window.addEventListener('error', (e) => {
      logs.push({ type: 'error', message: \`Error: \${e.message}\` });
      updateOutput();
    });
    
    try {
      // User's JavaScript code
      ${jsCode}
    } catch (error) {
      console.error('JavaScript Error:', error.message);
    }
  </script>
</body>
</html>`;
  };

  const generateCSSPreview = () => {
    const cssCode = currentFile.content || '';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Preview - ${project?.name || 'Project'}</title>
  <style>
    ${cssCode}
  </style>
  <style>
    .preview-info { background: #ff6b6b; color: white; padding: 15px; margin-bottom: 20px; border-radius: 8px; font-size: 12px; }
    .demo-content { margin: 20px 0; }
  </style>
</head>
<body>
  <div class="preview-info">
    🎨 CSS Live Preview - ${currentFile.name} - Styles applied to demo content below
  </div>
  
  <div class="demo-content">
    <h1>Sample Heading</h1>
    <p>This is sample paragraph text to demonstrate your CSS styles.</p>
    <button>Sample Button</button>
    <div class="box">Sample Box</div>
    <ul>
      <li>List item 1</li>
      <li>List item 2</li>
      <li>List item 3</li>
    </ul>
  </div>
</body>
</html>`;
  };

  const generateDefaultPreview = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>File Preview - ${currentFile?.name || 'Unknown'}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: monospace; background: #f8f9fa; }
    .preview-info { background: #6c757d; color: white; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
    .file-content { background: white; border: 1px solid #dee2e6; padding: 20px; border-radius: 5px; white-space: pre-wrap; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="preview-info">
    📄 File Preview - ${currentFile?.name} - This file type doesn't support live preview
  </div>
  <div class="file-content">${currentFile?.content || 'No content available'}</div>
</body>
</html>`;
  };

  // Handle console messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'console') {
        const newLog = {
          id: Date.now() + Math.random(),
          level: event.data.level,
          message: event.data.args.join(' '),
          timestamp: new Date().toLocaleTimeString()
        };
        setConsoleLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50 logs
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = () => {
    generatePreview();
  };

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getDeviceIcon = (mode) => {
    switch (mode) {
      case 'tablet': return <Tablet size={16} />;
      case 'mobile': return <Smartphone size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  if (!currentFile) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="text-center">
          <Eye size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium mb-2">No Preview Available</h3>
          <p className="text-sm">Select a file to see live preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Play size={18} className="text-green-400" />
          <span className="text-sm font-medium text-white">Live Preview</span>
          <span className="text-xs text-gray-400">
            {currentFile.name} • {detectProjectType().toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Device Size Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            {['desktop', 'tablet', 'mobile'].map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors ${
                  previewMode === mode ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                {getDeviceIcon(mode)}
                <span className="capitalize">{mode}</span>
              </button>
            ))}
          </div>

          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded text-xs flex items-center space-x-1 ${
              autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            <RefreshCw size={12} />
            <span>Auto</span>
          </button>

          {/* Console Toggle */}
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`px-3 py-1 rounded text-xs flex items-center space-x-1 ${
              showConsole ? 'bg-yellow-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}
          >
            <Code size={12} />
            <span>Console</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-xs flex items-center space-x-1 text-white"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {/* Open in New Tab */}
          <button
            onClick={openInNewTab}
            disabled={!previewUrl}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-xs flex items-center space-x-1 text-white"
          >
            <ExternalLink size={12} />
            <span>Open</span>
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {previewError && (
          <div className="bg-red-900 border-b border-red-700 p-3 text-red-100 text-sm flex items-center">
            <AlertCircle size={16} className="mr-2" />
            Preview Error: {previewError}
          </div>
        )}

        <div className={`flex-1 ${showConsole ? 'flex' : 'block'}`}>
          {/* Preview Iframe */}
          <div className={`${showConsole ? 'flex-1' : 'w-full h-full'} bg-white`}>
            <div className="h-full flex items-center justify-center" style={deviceSizes[previewMode]}>
              {isLoading ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Generating preview...</span>
                </div>
              ) : previewUrl ? (
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  title="App Preview"
                />
              ) : (
                <div className="text-center text-gray-600">
                  <Eye size={24} className="mx-auto mb-2" />
                  <p>Click Refresh to generate preview</p>
                </div>
              )}
            </div>
          </div>

          {/* Console Panel */}
          {showConsole && (
            <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
              <div className="bg-gray-800 px-3 py-2 border-b border-gray-700 flex items-center justify-between">
                <span className="text-sm font-medium text-white">Console</span>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2 space-y-1">
                {consoleLogs.length === 0 ? (
                  <div className="text-gray-500 text-xs text-center mt-4">
                    Console output will appear here
                  </div>
                ) : (
                  consoleLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`text-xs p-1 rounded font-mono ${
                        log.level === 'error' ? 'text-red-400 bg-red-900/20' :
                        log.level === 'warn' ? 'text-yellow-400 bg-yellow-900/20' :
                        'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500">{log.timestamp}</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppPreview;