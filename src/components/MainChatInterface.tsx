import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import UserDiscovery from './UserDiscovery';
import UserRegistration from './UserRegistration';
import WelcomeScreen from './WelcomeScreen';
import apiService from '../services/api';
import socketService from '../services/socket';
import { User, Chat } from '../types';
import { Plus, Menu, RefreshCw, Users, LogOut, X } from 'lucide-react';
import RateLimitAlert from './RateLimitAlert';

type MainChatInterfaceProps = {};

const MainChatInterface = ({}: MainChatInterfaceProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showUserDiscovery, setShowUserDiscovery] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showRateLimitAlert, setShowRateLimitAlert] = useState(false);
  const [rateLimitRetryAfter, setRateLimitRetryAfter] = useState<number>(0);

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Periodic refresh to ensure synchronization
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Refresh every 30 seconds instead of 5 seconds to reduce API calls
      if (!lastRefreshTime || now - lastRefreshTime > 30000) {
        console.log('Periodic refresh triggered');
        loadChats();
      }
    }, 30000); // Changed from 5000 to 30000

    return () => clearInterval(interval);
  }, [currentUser, lastRefreshTime]);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        apiService.setToken(token);
        socketService.connect(user.id);
        loadChats();
      } catch (error) {
        console.error('Error loading user data:', error);
        handleLogout();
      }
    }
  }, []);

  // Socket.io event listeners
  useEffect(() => {
    if (!currentUser) return;

    let refreshTimeout: NodeJS.Timeout | null = null;

    // Debounced refresh function to prevent multiple rapid API calls
    const debouncedRefresh = () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      refreshTimeout = setTimeout(() => {
        loadChats();
      }, 1000); // Wait 1 second before refreshing
    };

    // Define callback functions
    const handleNewMessage = (data: any) => {
      console.log('New message received, scheduling refresh');
      debouncedRefresh();
    };

    const handleMessageSent = (data: any) => {
      console.log('Message sent confirmation, scheduling refresh');
      debouncedRefresh();
    };

    const handleUserOnline = (data: any) => {
      console.log('User online status changed, scheduling refresh');
      debouncedRefresh();
    };

    const handleUserOffline = (data: any) => {
      console.log('User offline:', data);
      debouncedRefresh();
    };

    const handleChatUpdated = (data: any) => {
      console.log('Chat updated:', data);
      debouncedRefresh();
    };

    // Listen for new messages
    socketService.onNewMessage(handleNewMessage);

    // Listen for message sent confirmation
    socketService.onMessageSent(handleMessageSent);

    // Listen for chat updates
    socketService.onChatUpdated(handleChatUpdated);

    // Listen for user online/offline status
    socketService.onUserOnline(handleUserOnline);

    socketService.onUserOffline(handleUserOffline);

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      socketService.removeListener('new-message', handleNewMessage);
      socketService.removeListener('message-sent', handleMessageSent);
      socketService.removeListener('chat-updated', handleChatUpdated);
      socketService.removeListener('user-online', handleUserOnline);
      socketService.removeListener('user-offline', handleUserOffline);
    };
  }, [currentUser]);

  const loadChats = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const response = await apiService.getChats();
      setChats(response);
      setLastRefreshTime(Date.now()); // Update last refresh time
    } catch (error: any) {
      console.error('Error loading chats:', error);
      
      // Handle rate limit errors
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        setShowRateLimitAlert(true);
        setRateLimitRetryAfter(30); // Show 30 second countdown
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationComplete = async (user: User) => {
    setCurrentUser(user);
    
    // Connect to socket
    socketService.connect(user.id);
    
    // Update online status
    try {
      await apiService.updateOnlineStatus(true);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
    
    loadChats();
  };

  const handleLogout = () => {
    // Update offline status
    if (currentUser) {
      apiService.updateOnlineStatus(false).catch(console.error);
    }
    
    // Disconnect socket
    socketService.disconnect();
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    
    // Reset state
    setCurrentUser(null);
    setChats([]);
    setSelectedChatId(null);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setIsMobileView(true);
  };

  const handleBackToChats = () => {
    setIsMobileView(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedChatId || !currentUser) return;

    try {
      // Send message via API
      const response = await apiService.sendMessage(selectedChatId, content);
      
      // Send via socket for real-time delivery
      const otherParticipant = chats.find(chat => chat.id === selectedChatId)?.otherParticipant;
      if (otherParticipant) {
        socketService.sendMessage(selectedChatId, response.message, otherParticipant.id);
      }
      
      // Refresh chats to show new message
      loadChats();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  // If no user is registered, show registration
  if (!currentUser) {
    return <UserRegistration onRegistrationComplete={handleRegistrationComplete} />;
  }

  // If showing user discovery
  if (showUserDiscovery) {
    return (
      <div className="h-screen">
        <UserDiscovery onBackToChats={() => {
          setShowUserDiscovery(false);
          loadChats(); // Refresh chats when returning
        }} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-whatsapp-gray-100">
      <RateLimitAlert 
        isVisible={showRateLimitAlert}
        onClose={() => setShowRateLimitAlert(false)}
        retryAfter={rateLimitRetryAfter}
      />
      <div className="flex h-full">
        {/* Sidebar - Collapsible and hidden on mobile when chat is selected */}
        <div className={`${isMobileView ? 'hidden' : 'block'} md:block transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'md:w-16' : 'md:w-80'
        }`}>
          <div className="w-full md:w-80 bg-white border-r border-whatsapp-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-whatsapp-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <img
                    src={currentUser.profileImage}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {!isSidebarCollapsed && (
                    <div>
                      <h1 className="font-semibold text-whatsapp-gray-900">{currentUser.name}</h1>
                      <p className="text-sm text-whatsapp-gray-500">{currentUser.phoneNumber}</p>
                    </div>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        console.log('Manual refresh triggered');
                        loadChats();
                      }}
                      className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors"
                      title="Refresh Chats"
                    >
                      <RefreshCw className="w-5 h-5 text-whatsapp-gray-600" />
                    </button>
                    <button
                      onClick={() => setShowUserDiscovery(true)}
                      className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors"
                      title="Discover People"
                    >
                      <Users className="w-5 h-5 text-whatsapp-gray-600" />
                    </button>
                    <button
                      onClick={handleLogout}
                      className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5 text-whatsapp-gray-600" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Toggle button - only show on desktop */}
              <div className="hidden md:flex justify-center">
                <button
                  onClick={toggleSidebar}
                  className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors"
                  title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {isSidebarCollapsed ? (
                    <Menu className="w-5 h-5 text-whatsapp-gray-600" />
                  ) : (
                    <X className="w-5 h-5 text-whatsapp-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className={`text-center ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                  <p className="text-whatsapp-gray-500 text-xs">Loading...</p>
                </div>
              ) : chats.length === 0 ? (
                <div className={`text-center ${isSidebarCollapsed ? 'p-2' : 'p-4'}`}>
                  {!isSidebarCollapsed && (
                    <>
                      <p className="text-whatsapp-gray-500 mb-4">No conversations yet</p>
                      <button
                        onClick={() => setShowUserDiscovery(true)}
                        className="bg-whatsapp-green-500 text-white px-4 py-2 rounded-lg hover:bg-whatsapp-green-600 transition-colors"
                      >
                        Discover People
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => {
                    const otherParticipant = chat.otherParticipant;
                    
                    if (!otherParticipant) return null;

                    return (
                      <div
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        className={`sidebar-item ${selectedChatId === chat.id ? 'sidebar-item-active' : ''} ${
                          isSidebarCollapsed ? 'sidebar-item-collapsed' : ''
                        }`}
                      >
                        <img
                          src={otherParticipant.profileImage}
                          alt={otherParticipant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {!isSidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-whatsapp-gray-900 truncate">
                                {otherParticipant.name}
                              </h3>
                              <span className="text-xs text-whatsapp-gray-500">
                                {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-whatsapp-gray-600 truncate">
                                {chat.lastMessage || 'No messages yet'}
                              </p>
                              {chat.unreadCount > 0 && (
                                <span className="bg-whatsapp-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-2">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {/* Show unread count badge when collapsed */}
                        {isSidebarCollapsed && chat.unreadCount > 0 && (
                          <span className="unread-badge">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Window or Welcome Screen */}
        <div className="flex-1">
          {selectedChat ? (
            <ChatWindow
              contact={{
                id: selectedChat.otherParticipant?.id || '',
                name: selectedChat.otherParticipant?.name || '',
                profileImage: selectedChat.otherParticipant?.profileImage || '',
                isOnline: selectedChat.otherParticipant?.isOnline || false,
                lastSeen: selectedChat.otherParticipant?.lastSeen,
                phoneNumber: selectedChat.otherParticipant?.phoneNumber || ''
              }}
              messages={selectedChat.messages}
              onSendMessage={handleSendMessage}
              onBack={handleBackToChats}
              showBackButton={isMobileView}
              showSidebarToggle={isMobileView && isSidebarCollapsed}
              onToggleSidebar={toggleSidebar}
              currentUserId={currentUser.id}
            />
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </div>
    </div>
  );
};

export default MainChatInterface;
