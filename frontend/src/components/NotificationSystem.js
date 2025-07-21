import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Zap } from 'lucide-react';

// Notification Context
const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  AI: 'ai'
};

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
};

// Notification Provider
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: []
  });

  const addNotification = useCallback((notification) => {
    const id = `notification_${Date.now()}_${Math.random()}`;
    const newNotification = {
      id,
      timestamp: new Date(),
      duration: 5000, // 5 seconds default
      dismissible: true,
      ...notification
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-dismiss if duration is set
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Convenience methods for different notification types
  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      duration: 8000, // Errors stay longer
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    });
  }, [addNotification]);

  const ai = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.AI,
      message,
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    ai
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Individual notification component
const NotificationItem = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle size={20} className="text-green-400" />;
      case NOTIFICATION_TYPES.ERROR:
        return <AlertCircle size={20} className="text-red-400" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertTriangle size={20} className="text-yellow-400" />;
      case NOTIFICATION_TYPES.AI:
        return <Zap size={20} className="text-purple-400" />;
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-800 border-green-600';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-800 border-red-600';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-800 border-yellow-600';
      case NOTIFICATION_TYPES.AI:
        return 'bg-gradient-to-r from-purple-800 to-indigo-800 border-purple-600';
      default:
        return 'bg-blue-800 border-blue-600';
    }
  };

  const getProgressColor = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-400';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-400';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-400';
      case NOTIFICATION_TYPES.AI:
        return 'bg-purple-400';
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <div
      className={`
        max-w-sm w-full shadow-lg rounded-lg pointer-events-auto
        border-l-4 ${getBackgroundColor()}
        transform transition-all duration-300 ease-in-out
        hover:scale-105 mb-2
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-white">
              {notification.title && (
                <>
                  {notification.title}
                  <br />
                </>
              )}
              <span className="text-gray-200">{notification.message}</span>
            </p>
            {notification.action && (
              <div className="mt-2">
                <button
                  onClick={notification.action.onClick}
                  className={`
                    text-xs font-medium px-2 py-1 rounded
                    ${notification.type === NOTIFICATION_TYPES.AI 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }
                  `}
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          {notification.dismissible && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => onRemove(notification.id)}
                className="inline-flex text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {notification.duration && notification.duration > 0 && (
        <div className="w-full bg-gray-700 h-1">
          <div 
            className={`h-1 ${getProgressColor()} animate-shrink`}
            style={{
              animation: `shrink ${notification.duration}ms linear`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Container for all notifications
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="max-w-sm w-full space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

// Add CSS animation for progress bar
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);

export default NotificationProvider;