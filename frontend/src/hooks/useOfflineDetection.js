import { useState, useEffect } from 'react';
import { useNotifications } from '../components/NotificationSystem';

const useOfflineDetection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const notifications = useNotifications();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        notifications.success('Connection restored! You\'re back online.', {
          title: 'Connected',
          duration: 3000
        });
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      notifications.warning('You appear to be offline. Some features may not work properly.', {
        title: 'Connection Lost',
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'Retry',
          onClick: () => {
            // Force a connectivity check
            fetch('/api/v1/health', { method: 'HEAD' })
              .then(() => handleOnline())
              .catch(() => {
                notifications.error('Still offline. Please check your internet connection.');
              });
          }
        }
      });
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check (every 30 seconds when offline)
    let connectivityCheck;
    if (!isOnline) {
      connectivityCheck = setInterval(() => {
        fetch('/api/v1/health', { 
          method: 'HEAD',
          timeout: 5000 
        })
          .then(() => {
            if (!navigator.onLine) {
              // Force online state if we can reach the server
              handleOnline();
            }
          })
          .catch(() => {
            // Still offline, do nothing
          });
      }, 30000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connectivityCheck) {
        clearInterval(connectivityCheck);
      }
    };
  }, [isOnline, wasOffline, notifications]);

  // Enhanced connectivity check function
  const checkConnectivity = async () => {
    try {
      const response = await fetch('/api/v1/health', {
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  return {
    isOnline,
    wasOffline,
    checkConnectivity
  };
};

export default useOfflineDetection;