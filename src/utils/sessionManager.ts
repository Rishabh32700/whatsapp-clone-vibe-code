import { User, Chat, FriendRequest } from '../types';

class SessionManager {
  private static instance: SessionManager;
  private sessionId: string;
  private currentUser: User | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.loadCurrentUser();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    this.saveCurrentUser();
  }

  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  private saveCurrentUser(): void {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  private loadCurrentUser(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  // User management
  public getAllUsers(): User[] {
    const users = localStorage.getItem('users');
    const savedUsers = users ? JSON.parse(users) : [];
    
    // Add demo users that will be available across all browsers for testing
    const demoUsers: User[] = [
      {
        id: 'demo_user_1',
        phoneNumber: '(555) 123-4567',
        name: 'John Demo',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isOnline: true,
        sessionId: 'demo_session_1',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_user_2',
        phoneNumber: '(555) 987-6543',
        name: 'Sarah Demo',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        isOnline: false,
        lastSeen: '2 hours ago',
        sessionId: 'demo_session_2',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_user_3',
        phoneNumber: '(555) 456-7890',
        name: 'Mike Demo',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isOnline: true,
        sessionId: 'demo_session_3',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Combine saved users with demo users, avoiding duplicates
    const allUsers = [...savedUsers];
    demoUsers.forEach(demoUser => {
      if (!allUsers.find(user => user.id === demoUser.id)) {
        allUsers.push(demoUser);
      }
    });
    
    return allUsers;
  }

  public saveUser(user: User): void {
    const users = this.getAllUsers();
    const existingUserIndex = users.findIndex(u => u.id === user.id);
    
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
  }

  public getUserById(userId: string): User | undefined {
    const users = this.getAllUsers();
    return users.find(user => user.id === userId);
  }

  public getOtherUsers(): User[] {
    const users = this.getAllUsers();
    return users.filter(user => user.id !== this.currentUser?.id);
  }

  // Friend requests
  public getFriendRequests(): FriendRequest[] {
    const requests = localStorage.getItem('friendRequests');
    const savedRequests = requests ? JSON.parse(requests) : [];
    
    // Add some demo friend requests for testing
    const demoRequests: FriendRequest[] = [
      {
        id: 'demo_request_1',
        fromUserId: 'demo_user_1',
        toUserId: 'demo_user_2',
        status: 'accepted',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_request_2',
        fromUserId: 'demo_user_2',
        toUserId: 'demo_user_3',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Combine saved requests with demo requests, avoiding duplicates
    const allRequests = [...savedRequests];
    demoRequests.forEach(demoRequest => {
      if (!allRequests.find(req => req.id === demoRequest.id)) {
        allRequests.push(demoRequest);
      }
    });
    
    return allRequests;
  }

  public saveFriendRequest(request: FriendRequest): void {
    const requests = this.getFriendRequests();
    const existingRequestIndex = requests.findIndex(r => r.id === request.id);
    
    if (existingRequestIndex >= 0) {
      requests[existingRequestIndex] = request;
    } else {
      requests.push(request);
    }
    
    localStorage.setItem('friendRequests', JSON.stringify(requests));
  }

  public getPendingFriendRequests(userId: string): FriendRequest[] {
    const requests = this.getFriendRequests();
    return requests.filter(req => 
      req.toUserId === userId && req.status === 'pending'
    );
  }

  // Chats
  public getChats(): Chat[] {
    const chats = localStorage.getItem('chats');
    return chats ? JSON.parse(chats) : [];
  }

  public saveChat(chat: Chat): void {
    const chats = this.getChats();
    const existingChatIndex = chats.findIndex(c => c.id === chat.id);
    
    if (existingChatIndex >= 0) {
      chats[existingChatIndex] = chat;
    } else {
      chats.push(chat);
    }
    
    localStorage.setItem('chats', JSON.stringify(chats));
  }

  public getChatBetweenUsers(userId1: string, userId2: string): Chat | undefined {
    const chats = this.getChats();
    return chats.find(chat => 
      (chat.participants[0] === userId1 && chat.participants[1] === userId2) ||
      (chat.participants[0] === userId2 && chat.participants[1] === userId1)
    );
  }

  public createChat(userId1: string, userId2: string): Chat {
    const chat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: [userId1, userId2],
      messages: [],
      unreadCount: 0,
    };
    
    this.saveChat(chat);
    return chat;
  }

  public addMessageToChat(chatId: string, message: any): void {
    const chats = this.getChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);
    
    if (chatIndex >= 0) {
      // Set the receiver ID based on chat participants
      const otherParticipant = chats[chatIndex].participants.find(id => id !== message.senderId);
      if (otherParticipant) {
        message.receiverId = otherParticipant;
      }
      
      chats[chatIndex].messages.push(message);
      chats[chatIndex].lastMessage = message.content;
      chats[chatIndex].lastMessageTime = message.timestamp;
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }

  // Utility functions
  public generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  public generateRequestId(): string {
    return 'request_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export default SessionManager;
