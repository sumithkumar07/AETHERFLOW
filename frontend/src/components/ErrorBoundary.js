import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    this.logErrorToService(error, errorInfo, errorId);
  }

  logErrorToService = (error, errorInfo, errorId) => {
    // This is where you'd integrate with error tracking services like Sentry
    const errorReport = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // For now, just log to localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('vibecode_errors') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.shift();
      }
      localStorage.setItem('vibecode_errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.error('Failed to store error report:', e);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  }

  handleReload = () => {
    window.location.reload();
  }

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const subject = `VibeCode IDE Error Report - ${errorId}`;
    const body = `
Error ID: ${errorId}
Time: ${new Date().toISOString()}

Error Message: ${error?.message || 'Unknown error'}

Stack Trace:
${error?.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}

User Agent: ${navigator.userAgent}
URL: ${window.location.href}

Please provide additional details about what you were doing when this error occurred:
[Your description here]
    `.trim();

    const mailto = `mailto:support@vibecode.dev?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto);
  }

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-xl font-bold text-white mb-2">
                Something went wrong
              </h1>
              
              <p className="text-gray-400 mb-4 text-sm">
                VibeCode IDE encountered an unexpected error. Don't worry, your work is likely saved.
              </p>

              {errorId && (
                <div className="bg-gray-700 rounded p-3 mb-4">
                  <p className="text-xs text-gray-300">Error ID:</p>
                  <p className="text-xs text-yellow-400 font-mono">{errorId}</p>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && error && (
                <details className="mb-4 text-left">
                  <summary className="text-sm text-red-400 cursor-pointer hover:text-red-300 mb-2">
                    Show error details (Development)
                  </summary>
                  <div className="bg-gray-900 rounded p-3 text-xs text-gray-300 overflow-auto max-h-32">
                    <strong className="text-red-400">Error:</strong> {error.message}<br/>
                    <strong className="text-red-400">Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">{error.stack}</pre>
                  </div>
                </details>
              )}

              <div className="space-y-2">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw size={16} />
                  <span>Try Again</span>
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  <Home size={16} />
                  <span>Reload Page</span>
                </button>
                
                <button
                  onClick={this.handleReportError}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  <Bug size={16} />
                  <span>Report Error</span>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  If this problem persists, try clearing your browser cache or contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;