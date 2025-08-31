import { useState, useEffect } from 'react';
import { User, FriendRequest } from '../types';
import apiService from '../services/api';
import socketService from '../services/socket';
import { Search, UserPlus, Check, X } from 'lucide-react';

type UserDiscoveryProps = {
  onBackToChats: () => void;
};

const UserDiscovery = ({ onBackToChats }: UserDiscoveryProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadFriendRequests();
    
    let refreshTimeout: NodeJS.Timeout | null = null;

    // Debounced refresh function to prevent multiple rapid API calls
    const debouncedRefresh = () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      refreshTimeout = setTimeout(() => {
        loadFriendRequests();
      }, 1000); // Wait 1 second before refreshing
    };
    
    // Define callback functions
    const handleNewFriendRequest = (request: any) => {
      console.log('New friend request received, scheduling refresh');
      debouncedRefresh();
    };

    const handleFriendRequestUpdated = (response: any) => {
      console.log('Friend request updated, scheduling refresh');
      debouncedRefresh();
    };

    // Listen for new friend requests
    socketService.onNewFriendRequest(handleNewFriendRequest);

    // Listen for friend request updates
    socketService.onFriendRequestUpdated(handleFriendRequestUpdated);

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      socketService.removeListener('new-friend-request', handleNewFriendRequest);
      socketService.removeListener('friend-request-updated', handleFriendRequestUpdated);
    };
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAllUsers();
      setUsers(response);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await apiService.getFriendRequests();
      setFriendRequests(response);
      
      // Track pending requests sent by current user
      const pending = new Set<string>();
      response.forEach(req => {
        if (req.fromUserId === getCurrentUserId() && req.status === 'pending') {
          pending.add(req.toUserId);
        }
      });
      setPendingRequests(pending);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  const getCurrentUserId = (): string => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user._id; // Handle both formats for compatibility
    }
    return '';
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phoneNumber.includes(searchQuery)
  );

  const handleSendFriendRequest = async (toUserId: string) => {
    try {
      const response = await apiService.sendFriendRequest(toUserId);
      
      // Send via socket for real-time notification
      const currentUserId = getCurrentUserId();
      socketService.sendFriendRequest(toUserId, response);
      
      setPendingRequests(prev => new Set(prev).add(toUserId));
      loadFriendRequests();
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already exists')) {
        alert('Friend request already sent to this user');
      } else if (error.message?.includes('not found')) {
        alert('User not found');
      } else {
        alert('Failed to send friend request. Please try again.');
      }
    }
  };

  const handleAcceptFriendRequest = async (request: FriendRequest) => {
    try {
      await apiService.respondToFriendRequest(request.id, 'accepted');
      
      // Send via socket for real-time notification
      socketService.respondToFriendRequest(request.fromUserId, { 
        requestId: request.id, 
        status: 'accepted' 
      });
      
      loadFriendRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineFriendRequest = async (request: FriendRequest) => {
    try {
      await apiService.respondToFriendRequest(request.id, 'declined');
      
      // Send via socket for real-time notification
      socketService.respondToFriendRequest(request.fromUserId, { 
        requestId: request.id, 
        status: 'declined' 
      });
      
      loadFriendRequests();
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const getFriendRequestStatus = (userId: string) => {
    const currentUserId = getCurrentUserId();
    const request = friendRequests.find(req => 
      (req.fromUserId === currentUserId && req.toUserId === userId) ||
      (req.fromUserId === userId && req.toUserId === currentUserId)
    );
    return request?.status;
  };

  const getIncomingRequests = () => {
    const currentUserId = getCurrentUserId();
    return friendRequests.filter(req => 
      req.toUserId === currentUserId && req.status === 'pending'
    );
  };

  const incomingRequests = getIncomingRequests();

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-whatsapp-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBackToChats}
            className="p-2 hover:bg-whatsapp-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-whatsapp-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-whatsapp-gray-900">Discover People</h1>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-whatsapp-gray-400" />
          <input
            type="text"
            placeholder="Search by name or phone number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-whatsapp-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green-500"
          />
        </div>
      </div>

      {/* Friend Requests */}
      {incomingRequests.length > 0 && (
        <div className="p-4 border-b border-whatsapp-gray-200">
          <h2 className="text-sm font-medium text-whatsapp-gray-900 mb-3">Friend Requests</h2>
          <div className="space-y-3">
            {incomingRequests.map((request) => {
              const fromUser = users.find(user => user.id === request.fromUserId);
              if (!fromUser) return null;

              return (
                <div key={request.id} className="flex items-center justify-between p-3 bg-whatsapp-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={fromUser.profileImage}
                      alt={fromUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-whatsapp-gray-900">{fromUser.name}</h3>
                      <p className="text-sm text-whatsapp-gray-600">{fromUser.phoneNumber}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptFriendRequest(request)}
                      className="px-3 py-1 bg-whatsapp-green-500 text-white text-sm rounded-lg hover:bg-whatsapp-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineFriendRequest(request)}
                      className="px-3 py-1 bg-whatsapp-gray-300 text-whatsapp-gray-700 text-sm rounded-lg hover:bg-whatsapp-gray-400 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-medium text-whatsapp-gray-900 mb-3">
            {searchQuery ? 'Search Results' : 'All Users'}
          </h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-whatsapp-gray-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-whatsapp-gray-500">
                {searchQuery ? 'No users found matching your search.' : 'No other users registered yet.'}
              </p>
              <p className="text-xs text-whatsapp-gray-400 mt-2">
                Register in different browsers to see other users
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const requestStatus = getFriendRequestStatus(user.id);
                const isPending = pendingRequests.has(user.id);

                return (
                  <div key={user.id} className="flex items-center justify-between p-3 hover:bg-whatsapp-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {user.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-whatsapp-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-whatsapp-gray-900">{user.name}</h3>
                        <p className="text-sm text-whatsapp-gray-600">{user.phoneNumber}</p>
                        <p className="text-xs text-whatsapp-gray-500">
                          {user.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {requestStatus === 'accepted' && (
                        <span className="text-sm text-whatsapp-green-600 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Friends
                        </span>
                      )}
                      {requestStatus === 'pending' && isPending && (
                        <span className="text-sm text-whatsapp-gray-500">Request Sent</span>
                      )}
                      {requestStatus === 'pending' && !isPending && (
                        <span className="text-sm text-whatsapp-gray-500">Request Received</span>
                      )}
                      {!requestStatus && (
                        <button
                          onClick={() => handleSendFriendRequest(user.id)}
                          className="px-3 py-1 bg-whatsapp-green-500 text-white text-sm rounded-lg hover:bg-whatsapp-green-600 transition-colors flex items-center gap-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDiscovery;
