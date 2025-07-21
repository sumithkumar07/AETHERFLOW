import { useState, useEffect, useCallback } from 'react';

const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = console.error
  } = options;

  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      return deserialize(item);
    } catch (error) {
      onError(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(valueToStore));
      }
    } catch (error) {
      onError(error);
    }
  }, [key, serialize, storedValue, onError]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      onError(error);
    }
  }, [key, initialValue, onError]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== serialize(storedValue)) {
        try {
          setStoredValue(e.newValue ? deserialize(e.newValue) : initialValue);
        } catch (error) {
          onError(error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, storedValue, serialize, deserialize, initialValue, onError]);

  return [storedValue, setValue, removeValue];
};

// Specialized hooks for common use cases
export const useLocalStorageState = (key, initialValue) => {
  return useLocalStorage(key, initialValue);
};

export const useSessionPersistence = (sessionId) => {
  const [session, setSession] = useLocalStorage(`vibecode_session_${sessionId}`, {
    id: sessionId,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    projects: [],
    preferences: {}
  });

  const updateSession = useCallback((updates) => {
    setSession(prev => ({
      ...prev,
      ...updates,
      lastActive: new Date().toISOString()
    }));
  }, [setSession]);

  return [session, updateSession];
};

export const useProjectCache = () => {
  const [cache, setCache] = useLocalStorage('vibecode_project_cache', {});
  
  const cacheProject = useCallback((projectId, projectData) => {
    setCache(prev => ({
      ...prev,
      [projectId]: {
        ...projectData,
        cachedAt: new Date().toISOString()
      }
    }));
  }, [setCache]);

  const getCachedProject = useCallback((projectId) => {
    const cached = cache[projectId];
    if (!cached) return null;

    // Check if cache is older than 1 hour
    const cacheAge = new Date() - new Date(cached.cachedAt);
    const maxAge = 60 * 60 * 1000; // 1 hour

    return cacheAge < maxAge ? cached : null;
  }, [cache]);

  const clearProjectCache = useCallback((projectId) => {
    if (projectId) {
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[projectId];
        return newCache;
      });
    } else {
      setCache({});
    }
  }, [setCache]);

  return {
    cacheProject,
    getCachedProject,
    clearProjectCache,
    cache
  };
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('vibecode_preferences', {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    aiAssistance: true,
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    notifications: {
      ai: true,
      errors: true,
      success: true,
      warnings: true
    },
    editor: {
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      lineHeight: 1.5,
      cursorBlinking: 'blink',
      renderWhitespace: 'selection',
      bracketMatching: 'always',
      folding: true,
      formatOnPaste: true,
      formatOnType: true
    }
  });

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => {
      if (typeof key === 'object') {
        // Handle object updates
        return { ...prev, ...key };
      } else if (key.includes('.')) {
        // Handle nested key updates (e.g., 'editor.fontSize')
        const keys = key.split('.');
        const newPrefs = { ...prev };
        let current = newPrefs;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        return newPrefs;
      } else {
        // Handle simple key updates
        return { ...prev, [key]: value };
      }
    });
  }, [setPreferences]);

  return [preferences, updatePreference];
};

export default useLocalStorage;