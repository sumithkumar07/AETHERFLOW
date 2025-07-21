/**
 * Real-time collaboration service for VibeCode
 * Handles WebSocket connections, operational transforms, and user presence
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

class CollaborationService {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.currentRoom = null;
    this.currentUser = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    // Event handlers
    this.eventHandlers = {
      connected: [],
      disconnected: [],
      user_joined: [],
      user_left: [],
      presence_update: [],
      chat_message: [],
      file_edit: [],
      room_state: [],
      error: []
    };
    
    // Operational transform state
    this.fileVersions = new Map(); // fileId -> version
    this.pendingOperations = new Map(); // fileId -> operations[]
    this.acknowledgmentCallbacks = new Map(); // operationId -> callback
    
    // User presence tracking
    this.userPresences = new Map(); // userId -> presence
    this.collaborativeCursors = new Map(); // userId -> cursor info
    
    // Chat state
    this.chatMessages = [];
    this.typingUsers = new Set();
    
    this.bindWebSocketEvents = this.bindWebSocketEvents.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  // Connection Management
  async createRoom(projectId, roomName, description = null, isPublic = true, maxUsers = 10) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/collaboration/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          name: roomName,
          description,
          is_public: isPublic,
          max_users: maxUsers
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.status}`);
      }
      
      const room = await response.json();
      return room;
    } catch (error) {
      console.error('Error creating collaboration room:', error);
      throw error;
    }
  }

  async getProjectRooms(projectId) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/collaboration/projects/${projectId}/rooms`);
      
      if (!response.ok) {
        throw new Error(`Failed to get rooms: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting project rooms:', error);
      throw error;
    }
  }

  async connectToRoom(roomId, userName = 'Anonymous', avatarColor = '#3B82F6') {
    if (this.websocket && this.isConnected) {
      await this.disconnect();
    }

    return new Promise((resolve, reject) => {
      const wsUrl = `${BACKEND_URL.replace('http', 'ws')}/api/v1/collaboration/rooms/${roomId}/ws?user_name=${encodeURIComponent(userName)}&avatar_color=${encodeURIComponent(avatarColor)}`;
      
      this.websocket = new WebSocket(wsUrl);
      this.currentRoom = roomId;
      this.currentUser = { name: userName, avatarColor };
      
      this.websocket.onopen = () => {
        console.log(`Connected to collaboration room: ${roomId}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        this.isConnected = false;
        reject(error);
      };
      
      this.websocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.handleDisconnection();
      };
      
      this.bindWebSocketEvents();
    });
  }

  async disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.isConnected = false;
    this.currentRoom = null;
    this.currentUser = null;
    this.userPresences.clear();
    this.collaborativeCursors.clear();
    this.chatMessages = [];
    this.typingUsers.clear();
    
    this.emit('disconnected');
  }

  bindWebSocketEvents() {
    if (!this.websocket) return;
    
    this.websocket.onmessage = this.handleMessage;
  }

  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      const type = message.type;
      
      switch (type) {
        case 'connected':
          this.currentUser = { ...this.currentUser, id: message.user_id };
          this.emit('connected', message);
          break;
          
        case 'user_joined':
          this.emit('user_joined', message.user);
          break;
          
        case 'user_left':
          this.userPresences.delete(message.user_id);
          this.collaborativeCursors.delete(message.user_id);
          this.typingUsers.delete(message.user_id);
          this.emit('user_left', message);
          break;
          
        case 'presence_update':
          this.userPresences.set(message.user_id, message.presence);
          this.updateCollaborativeCursor(message.user_id, message.presence);
          this.emit('presence_update', message);
          break;
          
        case 'chat_message':
          this.chatMessages.push(message.message);
          this.emit('chat_message', message.message);
          break;
          
        case 'file_edit':
          this.handleRemoteFileEdit(message);
          break;
          
        case 'room_state':
          this.handleRoomState(message);
          break;
          
        case 'edit_applied':
          this.handleEditAcknowledgment(message);
          break;
          
        case 'pong':
          // Handle pong response
          break;
          
        case 'keepalive':
          // Connection is alive
          break;
          
        case 'error':
          console.error('Collaboration error:', message);
          this.emit('error', message);
          break;
          
        default:
          console.warn('Unknown message type:', type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error, event.data);
    }
  }

  handleRoomState(message) {
    // Update local state with room information
    this.userPresences.clear();
    this.collaborativeCursors.clear();
    this.chatMessages = message.chat_messages || [];
    
    // Update presences
    if (message.presences) {
      message.presences.forEach(presence => {
        this.userPresences.set(presence.user_id, presence);
        this.updateCollaborativeCursor(presence.user_id, presence);
      });
    }
    
    this.emit('room_state', message);
  }

  handleRemoteFileEdit(message) {
    const { file_id, operations, new_version, user_id } = message;
    
    // Update file version
    this.fileVersions.set(file_id, new_version);
    
    // Apply operations to local state (this would be handled by Monaco Editor)
    this.emit('file_edit', {
      fileId: file_id,
      operations,
      newVersion: new_version,
      userId: user_id,
      timestamp: message.timestamp
    });
  }

  handleEditAcknowledgment(message) {
    const { file_id, new_version } = message;
    
    // Update file version
    this.fileVersions.set(file_id, new_version);
    
    // Clear pending operations for this file
    this.pendingOperations.delete(file_id);
    
    // Emit acknowledgment
    this.emit('edit_acknowledged', message);
  }

  handleDisconnection() {
    this.emit('disconnected');
    
    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        if (this.currentRoom && this.currentUser) {
          this.connectToRoom(this.currentRoom, this.currentUser.name, this.currentUser.avatarColor)
            .catch(error => {
              console.error('Reconnection failed:', error);
            });
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('error', { message: 'Connection lost and unable to reconnect' });
    }
  }

  // Real-time Editing
  applyEditOperations(fileId, operations) {
    if (!this.isConnected || !this.websocket) {
      console.warn('Cannot apply edit operations: not connected');
      return false;
    }
    
    const baseVersion = this.fileVersions.get(fileId) || 0;
    
    const message = {
      type: 'edit_operations',
      file_id: fileId,
      operations: operations,
      base_version: baseVersion,
      timestamp: new Date().toISOString()
    };
    
    this.websocket.send(JSON.stringify(message));
    
    // Store pending operations
    if (!this.pendingOperations.has(fileId)) {
      this.pendingOperations.set(fileId, []);
    }
    this.pendingOperations.get(fileId).push(...operations);
    
    return true;
  }

  // User Presence
  updatePresence(fileId, cursorPosition, selection = null, isTyping = false) {
    if (!this.isConnected || !this.websocket) return;
    
    const message = {
      type: 'presence_update',
      file_id: fileId,
      cursor_position: cursorPosition,
      selection: selection,
      is_typing: isTyping,
      timestamp: new Date().toISOString()
    };
    
    this.websocket.send(JSON.stringify(message));
  }

  updateCollaborativeCursor(userId, presence) {
    if (presence.cursor_position && presence.file_id) {
      this.collaborativeCursors.set(userId, {
        userId,
        fileId: presence.file_id,
        position: presence.cursor_position,
        selection: presence.selection,
        isTyping: presence.is_typing,
        timestamp: presence.last_seen
      });
    } else {
      this.collaborativeCursors.delete(userId);
    }
  }

  getCollaborativeCursors(fileId) {
    const cursors = [];
    for (const [userId, cursor] of this.collaborativeCursors) {
      if (cursor.fileId === fileId && userId !== this.currentUser?.id) {
        cursors.push(cursor);
      }
    }
    return cursors;
  }

  // Chat
  sendChatMessage(message, messageType = 'text', replyTo = null, metadata = null) {
    if (!this.isConnected || !this.websocket) return false;
    
    const chatMessage = {
      type: 'chat_message',
      message: message,
      message_type: messageType,
      reply_to: replyTo,
      metadata: metadata,
      timestamp: new Date().toISOString()
    };
    
    this.websocket.send(JSON.stringify(chatMessage));
    return true;
  }

  async getChatHistory(limit = 50, before = null) {
    if (!this.currentRoom) return [];
    
    try {
      let url = `${BACKEND_URL}/api/v1/collaboration/rooms/${this.currentRoom}/chat?limit=${limit}`;
      if (before) {
        url += `&before=${encodeURIComponent(before)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to get chat history: ${response.status}`);
      }
      
      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Event Management
  on(eventType, handler) {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(handler);
  }

  off(eventType, handler) {
    if (this.eventHandlers[eventType]) {
      const index = this.eventHandlers[eventType].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[eventType].splice(index, 1);
      }
    }
  }

  emit(eventType, data = null) {
    if (this.eventHandlers[eventType]) {
      this.eventHandlers[eventType].forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  // Utility Methods
  ping() {
    if (this.isConnected && this.websocket) {
      this.websocket.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }));
    }
  }

  requestRoomState() {
    if (this.isConnected && this.websocket) {
      this.websocket.send(JSON.stringify({
        type: 'request_room_state',
        timestamp: new Date().toISOString()
      }));
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentRoom: this.currentRoom,
      currentUser: this.currentUser,
      reconnectAttempts: this.reconnectAttempts,
      userCount: this.userPresences.size,
      chatMessageCount: this.chatMessages.length
    };
  }

  // File version management
  getFileVersion(fileId) {
    return this.fileVersions.get(fileId) || 0;
  }

  setFileVersion(fileId, version) {
    this.fileVersions.set(fileId, version);
  }

  // User management
  getActiveUsers() {
    return Array.from(this.userPresences.values());
  }

  getUserPresence(userId) {
    return this.userPresences.get(userId);
  }

  isUserTyping(userId) {
    return this.typingUsers.has(userId);
  }
}

// Create singleton instance
const collaborationService = new CollaborationService();

export default collaborationService;