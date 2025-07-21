import React from 'react';
import { Loader, Sparkles, Code, Bot } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  type = 'default',
  message = '',
  showIcon = true,
  className = '',
  progress = null
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const iconSizes = {
    small: 16,
    medium: 24,
    large: 32,
    xl: 48
  };

  const getIcon = () => {
    switch (type) {
      case 'ai':
        return <Bot size={iconSizes[size]} className="text-purple-400" />;
      case 'code':
        return <Code size={iconSizes[size]} className="text-blue-400" />;
      case 'magic':
        return <Sparkles size={iconSizes[size]} className="text-yellow-400" />;
      default:
        return <Loader size={iconSizes[size]} className="text-gray-400" />;
    }
  };

  const getSpinnerColor = () => {
    switch (type) {
      case 'ai':
        return 'border-purple-400';
      case 'code':
        return 'border-blue-400';
      case 'magic':
        return 'border-yellow-400';
      case 'success':
        return 'border-green-400';
      case 'error':
        return 'border-red-400';
      default:
        return 'border-gray-400';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {/* Progress bar if provided */}
      {progress !== null && (
        <div className="w-full max-w-xs">
          <div className="bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                type === 'ai' ? 'bg-purple-400' :
                type === 'code' ? 'bg-blue-400' :
                type === 'magic' ? 'bg-yellow-400' :
                'bg-gray-400'
              }`}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400 text-center">{progress.toFixed(0)}%</div>
        </div>
      )}

      {/* Main spinner */}
      <div className="relative flex items-center justify-center">
        {/* Spinning border */}
        <div 
          className={`
            ${sizeClasses[size]} 
            border-2 
            border-transparent 
            border-t-current 
            rounded-full 
            animate-spin 
            ${getSpinnerColor()}
          `}
        />
        
        {/* Icon overlay */}
        {showIcon && (
          <div className="absolute inset-0 flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>

      {/* Loading message */}
      {message && (
        <div className="text-center max-w-xs">
          <p className={`
            text-sm 
            ${type === 'ai' ? 'text-purple-300' :
              type === 'code' ? 'text-blue-300' :
              type === 'magic' ? 'text-yellow-300' :
              'text-gray-300'
            }
          `}>
            {message}
          </p>
        </div>
      )}

      {/* Animated dots for enhanced loading effect */}
      {message && (
        <div className="flex space-x-1">
          <div className={`
            w-1 h-1 rounded-full animate-pulse
            ${type === 'ai' ? 'bg-purple-400' :
              type === 'code' ? 'bg-blue-400' :
              type === 'magic' ? 'bg-yellow-400' :
              'bg-gray-400'
            }
          `} style={{ animationDelay: '0ms' }}></div>
          <div className={`
            w-1 h-1 rounded-full animate-pulse
            ${type === 'ai' ? 'bg-purple-400' :
              type === 'code' ? 'bg-blue-400' :
              type === 'magic' ? 'bg-yellow-400' :
              'bg-gray-400'
            }
          `} style={{ animationDelay: '150ms' }}></div>
          <div className={`
            w-1 h-1 rounded-full animate-pulse
            ${type === 'ai' ? 'bg-purple-400' :
              type === 'code' ? 'bg-blue-400' :
              type === 'magic' ? 'bg-yellow-400' :
              'bg-gray-400'
            }
          `} style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
};

// Predefined loading states for common scenarios
export const AILoadingSpinner = ({ message = "AI is thinking...", progress }) => (
  <LoadingSpinner type="ai" size="medium" message={message} progress={progress} />
);

export const CodeLoadingSpinner = ({ message = "Processing code...", progress }) => (
  <LoadingSpinner type="code" size="medium" message={message} progress={progress} />
);

export const MagicLoadingSpinner = ({ message = "Working magic...", progress }) => (
  <LoadingSpinner type="magic" size="medium" message={message} progress={progress} />
);

// Full page loading overlay
export const LoadingOverlay = ({ 
  isVisible, 
  message = "Loading...", 
  type = "default",
  progress = null 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-sm w-full mx-4">
        <LoadingSpinner 
          size="large" 
          type={type} 
          message={message}
          progress={progress}
          className="py-4"
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;