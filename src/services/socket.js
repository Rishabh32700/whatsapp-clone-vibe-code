import { io } from 'socket.io-client';

// Socket URL - will use environment variable in production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      return;
    }

    this.userId = userId;
    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Connected to Socket.io server');
      this.isConnected = true;
      
      // Join with user ID
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  // Message events
  sendMessage(chatId, message, receiverId) {
    if (this.socket && this.isConnected) {
      console.log('Sending message via socket:', { chatId, message, receiverId });
      this.socket.emit('send-message', {
        chatId,
        message,
        receiverId
      });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', (data) => {
        console.log('Received new message via socket:', data);
        callback(data);
      });
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message-sent', (data) => {
        console.log('Message sent confirmation via socket:', data);
        callback(data);
      });
    }
  }

  onChatUpdated(callback) {
    if (this.socket) {
      this.socket.on('chat-updated', (data) => {
        console.log('Chat updated via socket:', data);
        callback(data);
      });
    }
  }

  // Typing events
  sendTyping(chatId, receiverId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', {
        chatId,
        receiverId,
        isTyping
      });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // Friend request events
  sendFriendRequest(receiverId, request) {
    if (this.socket && this.isConnected) {
      this.socket.emit('friend-request-sent', {
        receiverId,
        request
      });
    }
  }

  onNewFriendRequest(callback) {
    if (this.socket) {
      this.socket.on('new-friend-request', callback);
    }
  }

  respondToFriendRequest(senderId, response) {
    if (this.socket && this.isConnected) {
      this.socket.emit('friend-request-responded', {
        senderId,
        response
      });
    }
  }

  onFriendRequestUpdated(callback) {
    if (this.socket) {
      this.socket.on('friend-request-updated', callback);
    }
  }

  // Online/offline events
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user-online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user-offline', callback);
    }
  }

  // Remove event listeners
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId
    };
  }
}

export default new SocketService();
