import React, { useState, useEffect, useRef } from 'react';

// Advanced Micro-Interactions Hook
export const useMicroInteractions = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState([]);
  const elementRef = useRef(null);

  const createRipple = (event) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => {
      setIsHovered(false);
      setIsPressed(false);
    },
    onMouseDown: (e) => {
      setIsPressed(true);
      createRipple(e);
    },
    onMouseUp: () => setIsPressed(false),
    ref: elementRef
  };

  return {
    handlers,
    state: { isHovered, isPressed },
    ripples
  };
};

// Enhanced Interactive Button Component
export const InteractiveButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  loading = false,
  className = '',
  ...props 
}) => {
  const { handlers, state, ripples } = useMicroInteractions();

  const baseClasses = `
    btn btn-${variant} btn-${size} 
    relative overflow-hidden
    transform-gpu transition-all duration-200
    ${disabled ? 'pointer-events-none' : 'cursor-pointer'}
    ${state.isHovered ? 'hover-lift' : ''}
    ${state.isPressed ? 'scale-98' : ''}
    ${loading ? 'loading' : ''}
    ${className}
  `;

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      {...handlers}
      {...props}
      className={baseClasses}
      onClick={handleClick}
      disabled={disabled}
    >
      {/* Ripple Effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/20 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animation: 'ripple 0.6s linear',
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Button Content */}
      <span className={`flex items-center gap-2 transition-transform duration-200 ${
        loading ? 'opacity-0' : 'opacity-100'
      }`}>
        {icon && <span className="text-current">{icon}</span>}
        {children}
      </span>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Hover Glow Effect */}
      {state.isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full hover:translate-x-0 transition-transform duration-700" />
      )}
    </button>
  );
};

// Advanced Card Component with Hover Effects
export const InteractiveCard = ({ 
  children, 
  onClick, 
  hoverable = true,
  className = '',
  glowColor = '#3b82f6',
  ...props 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  const cardClasses = `
    glass-surface p-6 rounded-xl
    transition-all duration-300 ease-out
    ${hoverable ? 'cursor-pointer hover-lift' : ''}
    ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
    ${onClick ? 'active:scale-98' : ''}
    ${className}
  `;

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      {...props}
    >
      {/* Gradient Glow Effect */}
      {isHovered && hoverable && (
        <div
          className="absolute inset-0 opacity-20 rounded-xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}40, transparent 70%)`
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Floating Action Button with Advanced Interactions
export const FloatingActionButton = ({ 
  icon, 
  onClick, 
  tooltip, 
  position = 'bottom-right',
  color = 'primary' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  };

  return (
    <div className={positionClasses[position]}>
      <div
        className={`
          relative group
          w-14 h-14 rounded-full
          btn btn-${color}
          shadow-lg hover:shadow-xl
          transform transition-all duration-300
          hover:scale-110
          ${isExpanded ? 'rotate-45' : ''}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => {
          setIsExpanded(!isExpanded);
          onClick && onClick();
        }}
      >
        <span className="text-xl transition-transform duration-300">
          {icon}
        </span>

        {/* Tooltip */}
        {tooltip && showTooltip && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
          </div>
        )}

        {/* Pulsing Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-current opacity-75 scale-100 animate-ping" />
      </div>
    </div>
  );
};

// Advanced Toggle Switch
export const AnimatedToggle = ({ 
  checked, 
  onChange, 
  size = 'md', 
  color = 'primary',
  disabled = false,
  icon,
  label 
}) => {
  const sizes = {
    sm: 'w-8 h-4',
    md: 'w-12 h-6',
    lg: 'w-16 h-8'
  };

  const thumbSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5', 
    lg: 'w-7 h-7'
  };

  return (
    <label className={`flex items-center space-x-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`
            ${sizes[size]} rounded-full p-0.5
            transition-all duration-300 ease-out
            ${checked 
              ? `bg-${color}-500 shadow-lg shadow-${color}-500/50` 
              : 'bg-gray-600'
            }
            ${disabled ? '' : 'hover:shadow-lg'}
          `}
        >
          <div
            className={`
              ${thumbSizes[size]} rounded-full bg-white
              transform transition-all duration-300 ease-out
              flex items-center justify-center
              ${checked ? 'translate-x-full scale-110' : 'translate-x-0'}
              ${disabled ? '' : 'group-hover:scale-105'}
            `}
          >
            {icon && (
              <span className={`text-xs transition-colors duration-300 ${
                checked ? `text-${color}-500` : 'text-gray-400'
              }`}>
                {icon}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {label && (
        <span className="text-gray-300 select-none">{label}</span>
      )}
    </label>
  );
};

// Progress Ring with Animation
export const AnimatedProgressRing = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#374151',
  showPercentage = true,
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color}40)`
          }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <span className="text-2xl font-bold text-white">
            {Math.round(progress)}%
          </span>
        ))}
      </div>
    </div>
  );
};

export default {
  useMicroInteractions,
  InteractiveButton,
  InteractiveCard,
  FloatingActionButton,
  AnimatedToggle,
  AnimatedProgressRing
};