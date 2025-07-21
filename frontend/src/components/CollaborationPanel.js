import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, MessageCircle, Settings, UserPlus, Wifi, WifiOff, 
  Send, Smile, PlusCircle, Hash, Bell, BellOff, Crown,
  Eye, Code, MessageSquare
} from 'lucide-react';
import collaborationService from '../services/collaborationService';

// User Avatar Component
const UserAvatar = ({ user, size = 'md', showStatus = true, isOwner = false }) => {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  return (
    <div className="relative">
      <div 
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white relative`}
        style={{ backgroundColor: user.avatar_color || '#3B82F6' }}
        title={`${user.name}${isOwner ? ' (Owner)' : ''}`}
      >
        {user.name?.charAt(0)?.toUpperCase() || 'U'}
        {isOwner && (
          <Crown size={12} className="absolute -top-1 -right-1 text-yellow-400" />
        )}
      </div>
      {showStatus && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></div>
      )}
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-400 px-3 py-2">
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>
        {typingUsers.length === 1 
          ? `${typingUsers[0]} is typing...`
          : `${typingUsers.length} people are typing...`
        }
      </span>
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, currentUserId, users }) => {
  const isOwn = message.user_id === currentUserId;
  const user = users.find(u => u.id === message.user_id) || { name: 'Unknown', avatar_color: '#6B7280' };
  const timestamp = new Date(message.timestamp);

  return (
    <div className={`flex items-start space-x-2 px-3 py-2 group hover:bg-gray-800/50 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <UserAvatar user={user} size="sm" showStatus={false} />
      
      <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-xs font-medium text-gray-300">{user.name}</span>
          <span className="text-xs text-gray-500">{timestamp.toLocaleTimeString()}</span>
        </div>
        
        <div className={`inline-block px-3 py-2 rounded-lg max-w-xs break-words ${
          isOwn 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-700 text-gray-100'
        }`}>
          {message.message_type === 'code' ? (
            <pre className="text-xs font-mono whitespace-pre-wrap">{message.message}</pre>
          ) : (
            <span className="text-sm">{message.message}</span>
          )}
        </div>
        
        {message.reply_to && (
          <div className="text-xs text-gray-500 mt-1">
            Replying to message
          </div>
        )}
      </div>
    </div>
  );
};

// Main Collaboration Panel Component
const CollaborationPanel = ({ 
  project, 
  currentFile,
  isVisible = true,
  onToggle,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'chat', 'settings'
  const [roomState, setRoomState] = useState(null);
  const [users, setUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notifications, setNotifications] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollChatToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // Initialize collaboration when project changes
  useEffect(() => {
    if (!project) return;

    const initializeCollaboration = async () => {
      try {
        setConnectionStatus('connecting');
        
        // Get or create a default room for the project
        let rooms = await collaborationService.getProjectRooms(project.id);
        let room;
        
        if (rooms.length === 0) {
          // Create default room
          room = await collaborationService.createRoom(
            project.id,
            `${project.name} - Main`,
            'Main collaboration room for this project'
          );
        } else {
          room = rooms[0]; // Use first available room
        }
        
        setRoomInfo(room);
        
        // Connect to room
        const userName = localStorage.getItem('vibecode_user_name') || `Developer_${Math.random().toString(36).substr(2, 5)}`;
        const avatarColor = localStorage.getItem('vibecode_avatar_color') || '#3B82F6';
        
        await collaborationService.connectToRoom(room.id, userName, avatarColor);
        setIsConnected(true);
        setConnectionStatus('connected');
        
      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
        setConnectionStatus('error');
      }
    };

    initializeCollaboration();

    return () => {
      collaborationService.disconnect();
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [project]);

  // Set up event listeners
  useEffect(() => {
    const handleConnected = (data) => {
      setIsConnected(true);
      setConnectionStatus('connected');
      collaborationService.requestRoomState();
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      setUsers([]);
      setChatMessages([]);
    };

    const handleUserJoined = (user) => {
      setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    };

    const handleUserLeft = (data) => {
      setUsers(prev => prev.filter(u => u.id !== data.user_id));
    };

    const handleChatMessage = (message) => {
      setChatMessages(prev => [...prev, message]);
      scrollChatToBottom();
      
      // Show notification for messages from others
      if (notifications && message.user_id !== collaborationService.currentUser?.id) {
        // Could integrate with notification system here
      }
    };

    const handleRoomState = (state) => {
      setRoomState(state);
      setUsers(state.users || []);
      setChatMessages(state.chat_messages || []);
      scrollChatToBottom();
    };

    const handleError = (error) => {
      console.error('Collaboration error:', error);
      setConnectionStatus('error');
    };

    // Register event listeners
    collaborationService.on('connected', handleConnected);
    collaborationService.on('disconnected', handleDisconnected);
    collaborationService.on('user_joined', handleUserJoined);
    collaborationService.on('user_left', handleUserLeft);
    collaborationService.on('chat_message', handleChatMessage);
    collaborationService.on('room_state', handleRoomState);
    collaborationService.on('error', handleError);

    // Cleanup event listeners
    return () => {
      collaborationService.off('connected', handleConnected);
      collaborationService.off('disconnected', handleDisconnected);
      collaborationService.off('user_joined', handleUserJoined);
      collaborationService.off('user_left', handleUserLeft);
      collaborationService.off('chat_message', handleChatMessage);
      collaborationService.off('room_state', handleRoomState);
      collaborationService.off('error', handleError);
    };
  }, [notifications, scrollChatToBottom]);

  // Update presence when file changes
  useEffect(() => {
    if (currentFile && isConnected) {
      collaborationService.updatePresence(currentFile.id, { line: 1, column: 1 });
    }
  }, [currentFile, isConnected]);

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;
    
    collaborationService.sendChatMessage(newMessage.trim());
    setNewMessage('');
    messageInputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-4 top-20 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition-colors z-50"
        title="Show Collaboration Panel"
      >
        <Users size={20} />
      </button>
    );
  }

  return (
    <div className={`bg-gray-800 border-l border-gray-700 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' && <Wifi size={16} className="text-green-400" />}
            {connectionStatus === 'connecting' && <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
            {connectionStatus === 'disconnected' && <WifiOff size={16} className="text-red-400" />}
            {connectionStatus === 'error' && <WifiOff size={16} className="text-red-400" />}
          </div>
          <h2 className="text-lg font-semibold text-white">Collaboration</h2>
        </div>
        
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-700 rounded"
          title="Hide Collaboration Panel"
        >
          <Users size={16} />
        </button>
      </div>

      {/* Connection Status */}
      {connectionStatus !== 'connected' && (
        <div className="px-4 py-2 bg-gray-700 text-center">
          <span className="text-sm text-gray-300">
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'disconnected' && 'Disconnected'}
            {connectionStatus === 'error' && 'Connection Error'}
          </span>
        </div>
      )}

      {/* Room Info */}
      {roomInfo && isConnected && (
        <div className="px-4 py-2 bg-gray-900 border-b border-gray-700">
          <div className="text-sm text-gray-300">{roomInfo.name}</div>
          <div className="text-xs text-gray-500">{users.length} user{users.length !== 1 ? 's' : ''} online</div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'chat', label: 'Chat', icon: MessageCircle },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center space-x-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-3">
              {users.map(user => {
                const presence = collaborationService.getUserPresence(user.id);
                const isCurrentUser = user.id === collaborationService.currentUser?.id;
                
                return (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                    <UserAvatar 
                      user={user} 
                      size="md" 
                      showStatus={true}
                      isOwner={roomState?.room?.owner_id === user.id}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-200 flex items-center space-x-1">
                        <span className="truncate">{user.name}</span>
                        {isCurrentUser && <span className="text-xs text-gray-500">(you)</span>}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {presence?.file_id ? (
                          <div className="flex items-center space-x-1">
                            {presence.is_typing ? (
                              <>
                                <Code size={10} />
                                <span>Typing...</span>
                              </>
                            ) : (
                              <>
                                <Eye size={10} />
                                <span>Viewing file</span>
                              </>
                            )}
                          </div>
                        ) : (
                          'Online'
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users size={32} className="mx-auto mb-2" />
                  <p>No users connected</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto"
            >
              {chatMessages.length > 0 ? (
                chatMessages.map(message => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    currentUserId={collaborationService.currentUser?.id}
                    users={users}
                  />
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare size={32} className="mx-auto mb-2" />
                    <p>No messages yet</p>
                    <p className="text-xs">Start a conversation!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Typing Indicator */}
            <TypingIndicator typingUsers={Array.from(collaborationService.typingUsers)} />

            {/* Message Input */}
            <div className="border-t border-gray-700 p-3">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                    rows={1}
                    className="w-full bg-gray-700 text-white text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-3">Notifications</h3>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-300">Chat notifications</span>
              </label>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-3">Room Information</h3>
              {roomInfo && (
                <div className="space-y-2 text-sm text-gray-300">
                  <div>
                    <span className="text-gray-500">Name:</span> {roomInfo.name}
                  </div>
                  {roomInfo.description && (
                    <div>
                      <span className="text-gray-500">Description:</span> {roomInfo.description}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Max Users:</span> {roomInfo.max_users}
                  </div>
                  <div>
                    <span className="text-gray-500">Room ID:</span> 
                    <code className="ml-1 text-xs bg-gray-700 px-1 py-0.5 rounded">{roomInfo.id}</code>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-200 mb-3">Connection</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-gray-300">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                {collaborationService.reconnectAttempts > 0 && (
                  <div className="text-gray-500">
                    Reconnect attempts: {collaborationService.reconnectAttempts}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationPanel;