import React, { useEffect, useState, useRef } from 'react';
import collaborationService from '../services/collaborationService';

const CollaborativeCursors = ({ editor, fileId, monacoRef }) => {
  const [cursors, setCursors] = useState([]);
  const cursorWidgetsRef = useRef(new Map()); // userId -> widget
  const cursorDecorations = useRef({}); // userId -> decorations

  useEffect(() => {
    if (!editor || !fileId || !monacoRef?.current) return;

    const handlePresenceUpdate = (data) => {
      if (data.presence.file_id === fileId) {
        updateCursors();
      }
    };

    const handleUserLeft = (data) => {
      removeCursor(data.user_id);
    };

    const handleRoomState = () => {
      updateCursors();
    };

    const updateCursors = () => {
      const collaborativeCursors = collaborationService.getCollaborativeCursors(fileId);
      setCursors(collaborativeCursors);
      renderCursors(collaborativeCursors);
    };

    // Register event listeners
    collaborationService.on('presence_update', handlePresenceUpdate);
    collaborationService.on('user_left', handleUserLeft);
    collaborationService.on('room_state', handleRoomState);

    // Initial update
    updateCursors();

    return () => {
      // Cleanup event listeners
      collaborationService.off('presence_update', handlePresenceUpdate);
      collaborationService.off('user_left', handleUserLeft);
      collaborationService.off('room_state', handleRoomState);
      
      // Cleanup cursor widgets
      cleanup();
    };
  }, [editor, fileId, monacoRef]);

  const renderCursors = (collaborativeCursors) => {
    if (!editor || !monacoRef?.current) return;

    const monaco = monacoRef.current;

    // Get current users to get avatar colors
    const users = collaborationService.getActiveUsers();
    const userMap = new Map(users.map(user => [user.id, user]));

    // Clear existing decorations
    Object.keys(cursorDecorations.current).forEach(userId => {
      if (cursorDecorations.current[userId]) {
        editor.removeDecorations(cursorDecorations.current[userId]);
      }
    });
    cursorDecorations.current = {};

    // Remove widgets for users no longer present
    cursorWidgetsRef.current.forEach((widget, userId) => {
      if (!collaborativeCursors.find(cursor => cursor.userId === userId)) {
        editor.removeContentWidget(widget);
        cursorWidgetsRef.current.delete(userId);
      }
    });

    // Add cursors for active users
    collaborativeCursors.forEach(cursor => {
      const user = userMap.get(cursor.userId);
      if (!user) return;

      const { line, column } = cursor.position;
      const position = new monaco.Position(line, column);

      // Create selection decoration if user has selection
      if (cursor.selection) {
        const startPos = new monaco.Position(cursor.selection.start.line, cursor.selection.start.column);
        const endPos = new monaco.Position(cursor.selection.end.line, cursor.selection.end.column);
        
        const range = new monaco.Range(
          startPos.lineNumber, startPos.column,
          endPos.lineNumber, endPos.column
        );

        const decorations = editor.createDecorationsCollection([
          {
            range: range,
            options: {
              className: `collaborative-selection-${cursor.userId}`,
              inlineClassName: `collaborative-selection-inline-${cursor.userId}`,
              stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
            }
          }
        ]);

        cursorDecorations.current[cursor.userId] = decorations;

        // Add CSS for this user's selection
        addSelectionStyles(cursor.userId, user.avatar_color);
      }

      // Create or update cursor widget
      const cursorWidget = createCursorWidget(cursor.userId, user, position, cursor.isTyping);
      
      // Remove old widget if exists
      if (cursorWidgetsRef.current.has(cursor.userId)) {
        editor.removeContentWidget(cursorWidgetsRef.current.get(cursor.userId));
      }

      // Add new widget
      editor.addContentWidget(cursorWidget);
      cursorWidgetsRef.current.set(cursor.userId, cursorWidget);
    });
  };

  const createCursorWidget = (userId, user, position, isTyping) => {
    const cursorId = `collaborative-cursor-${userId}`;
    
    return {
      getId: () => cursorId,
      getDomNode: () => {
        const node = document.createElement('div');
        node.className = 'collaborative-cursor';
        node.style.position = 'absolute';
        node.style.pointerEvents = 'none';
        node.style.zIndex = '1000';
        
        // Cursor line
        const cursorLine = document.createElement('div');
        cursorLine.className = 'cursor-line';
        cursorLine.style.width = '2px';
        cursorLine.style.height = '18px';
        cursorLine.style.backgroundColor = user.avatar_color || '#3B82F6';
        cursorLine.style.position = 'relative';
        cursorLine.style.animation = isTyping ? 'cursorBlink 1s infinite' : 'none';
        
        // User label
        const label = document.createElement('div');
        label.className = 'cursor-label';
        label.textContent = user.name;
        label.style.position = 'absolute';
        label.style.top = '-20px';
        label.style.left = '0px';
        label.style.backgroundColor = user.avatar_color || '#3B82F6';
        label.style.color = 'white';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '10px';
        label.style.fontWeight = '500';
        label.style.whiteSpace = 'nowrap';
        label.style.transform = 'translateX(-50%)';
        label.style.opacity = '0.9';
        
        // Typing indicator
        if (isTyping) {
          const typingDot = document.createElement('div');
          typingDot.style.position = 'absolute';
          typingDot.style.top = '18px';
          typingDot.style.left = '0px';
          typingDot.style.width = '4px';
          typingDot.style.height = '4px';
          typingDot.style.backgroundColor = user.avatar_color || '#3B82F6';
          typingDot.style.borderRadius = '50%';
          typingDot.style.animation = 'typingPulse 1.5s infinite';
          cursorLine.appendChild(typingDot);
        }
        
        cursorLine.appendChild(label);
        node.appendChild(cursorLine);
        
        return node;
      },
      getPosition: () => ({
        position: position,
        preference: [1, 2] // ABOVE, BELOW
      })
    };
  };

  const addSelectionStyles = (userId, color) => {
    // Check if styles already exist
    if (document.getElementById(`collaborative-selection-styles-${userId}`)) {
      return;
    }

    const style = document.createElement('style');
    style.id = `collaborative-selection-styles-${userId}`;
    
    // Convert hex color to rgba for transparency
    const hexToRgba = (hex, alpha = 0.3) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    style.textContent = `
      .collaborative-selection-${userId} {
        background-color: ${hexToRgba(color, 0.2)} !important;
      }
      .collaborative-selection-inline-${userId} {
        background-color: ${hexToRgba(color, 0.3)} !important;
      }
    `;
    
    document.head.appendChild(style);
  };

  const removeCursor = (userId) => {
    // Remove widget
    if (cursorWidgetsRef.current.has(userId)) {
      editor.removeContentWidget(cursorWidgetsRef.current.get(userId));
      cursorWidgetsRef.current.delete(userId);
    }

    // Remove decorations
    if (cursorDecorations.current[userId]) {
      cursorDecorations.current[userId].clear();
      delete cursorDecorations.current[userId];
    }

    // Remove styles
    const styleElement = document.getElementById(`collaborative-selection-styles-${userId}`);
    if (styleElement) {
      styleElement.remove();
    }
  };

  const cleanup = () => {
    // Remove all widgets
    cursorWidgetsRef.current.forEach((widget) => {
      editor.removeContentWidget(widget);
    });
    cursorWidgetsRef.current.clear();

    // Remove all decorations
    Object.keys(cursorDecorations.current).forEach(userId => {
      if (cursorDecorations.current[userId]) {
        cursorDecorations.current[userId].clear();
      }
    });
    cursorDecorations.current = {};

    // Remove all styles
    const existingStyles = document.querySelectorAll('[id^="collaborative-selection-styles-"]');
    existingStyles.forEach(style => style.remove());
  };

  // Add global cursor animation styles
  useEffect(() => {
    if (document.getElementById('collaborative-cursor-styles')) return;

    const style = document.createElement('style');
    style.id = 'collaborative-cursor-styles';
    style.textContent = `
      @keyframes cursorBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
      
      @keyframes typingPulse {
        0%, 100% { 
          opacity: 0.3;
          transform: scale(1);
        }
        50% { 
          opacity: 1;
          transform: scale(1.2);
        }
      }
      
      .collaborative-cursor {
        pointer-events: none;
      }
      
      .cursor-label {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
      
      .collaborative-cursor:hover .cursor-label {
        opacity: 1 !important;
      }
    `;
    
    document.head.appendChild(style);

    return () => {
      const styles = document.getElementById('collaborative-cursor-styles');
      if (styles) {
        styles.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything directly
};

export default CollaborativeCursors;