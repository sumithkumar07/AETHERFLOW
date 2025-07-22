import React from 'react';

// Enhanced Loading Components with 2025 UX Standards
export const LoadingSpinner = ({ size = 24, className = '', color = '#3b82f6' }) => (
  <div 
    className={`loading-spinner ${className}`}
    style={{
      width: size,
      height: size,
      border: `2px solid transparent`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}
  />
);

export const LoadingDots = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2', 
    lg: 'w-3 h-3'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
};

export const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  className = '',
  variant = 'text',
  lines = 1 
}) => {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              width: i === lines - 1 ? '75%' : width,
              height
            }}
          />
        ))}
      </div>
    );
  }

  const variants = {
    text: 'skeleton',
    avatar: 'skeleton rounded-full',
    card: 'skeleton rounded-lg',
    button: 'skeleton rounded-md'
  };

  return (
    <div
      className={`${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

export const CardSkeleton = ({ className = '' }) => (
  <div className={`glass-surface p-6 ${className}`}>
    <div className="animate-pulse">
      <div className="flex items-center space-x-4">
        <SkeletonLoader variant="avatar" width="48px" height="48px" />
        <div className="flex-1">
          <SkeletonLoader width="75%" height="20px" className="mb-2" />
          <SkeletonLoader width="50%" height="16px" />
        </div>
      </div>
      <div className="mt-4">
        <SkeletonLoader lines={3} height="16px" />
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <SkeletonLoader
            key={colIndex}
            width={colIndex === 0 ? '25%' : colIndex === 1 ? '35%' : '20%'}
            height="16px"
          />
        ))}
      </div>
    ))}
  </div>
);

export const LoadingOverlay = ({ isVisible, message = 'Loading...', children }) => {
  if (!isVisible) return children;

  return (
    <div className="relative">
      {children && <div className="opacity-50 pointer-events-none">{children}</div>}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-lg">
        <div className="flex flex-col items-center space-y-4 p-8">
          <div className="relative">
            <LoadingSpinner size={32} />
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
          </div>
          <div className="text-white text-center">
            <div className="font-medium">{message}</div>
            <LoadingDots size="sm" className="mt-2 justify-center" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProgressiveImage = ({ src, alt, className = '', placeholder }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
          {placeholder || <LoadingSpinner size={24} />}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {imageError && (
        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
          Failed to load image
        </div>
      )}
    </div>
  );
};

// Sophisticated loading states for different contexts
export const IDELoadingScreen = ({ progress = 0, stage = 'Initializing' }) => (
  <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
    <div className="text-center space-y-6 max-w-md">
      {/* AETHERFLOW Logo Animation */}
      <div className="relative">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-blue-400/50 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
          <div className="absolute inset-4 border-4 border-blue-300/70 rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 typewriter">AETHERFLOW</h2>
        <p className="text-gray-400 text-sm">Professional Development Environment</p>
      </div>

      {/* Progress Indicator */}
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Loading Stage */}
      <div className="text-gray-300">
        <p className="mb-2">{stage}...</p>
        <LoadingDots />
      </div>
    </div>
  </div>
);

export const SmartLoadingBoundary = ({ 
  isLoading, 
  error, 
  skeleton, 
  children,
  errorMessage = 'Something went wrong',
  retryAction 
}) => {
  if (error) {
    return (
      <div className="glass-surface p-8 text-center">
        <div className="text-red-400 mb-4">⚠️</div>
        <h3 className="text-white font-medium mb-2">Error</h3>
        <p className="text-gray-400 mb-4">{errorMessage}</p>
        {retryAction && (
          <button
            onClick={retryAction}
            className="btn btn-primary btn-sm"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (isLoading && skeleton) {
    return skeleton;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return children;
};

export default LoadingSpinner;