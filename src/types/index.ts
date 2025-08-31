export type User = {
  id: string;
  phoneNumber: string;
  name: string;
  profileImage: string;
  isOnline: boolean;
  lastSeen?: string;
  sessionId: string; // Browser session identifier
  createdAt: string;
};

export type FriendRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
};

export type Contact = {
  id: string;
  name: string;
  profileImage: string;
  isOnline: boolean;
  lastSeen?: string;
  phoneNumber: string;
  user?: User;
  isFriend?: boolean;
  friendRequestId?: string;
  friendRequestStatus?: 'pending' | 'accepted' | 'declined';
};

export type Message = {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  receiverId: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
};

export type Chat = {
  id: string;
  participants: string[]; // User IDs
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  otherParticipant?: {
    id: string;
    name: string;
    profileImage: string;
    isOnline: boolean;
    lastSeen?: string;
    phoneNumber: string;
  };
};

export type MessageStatus = 'sent' | 'delivered' | 'read';

export type UserSession = {
  userId: string;
  sessionId: string;
  isActive: boolean;
  lastActive: string;
};

export type RegistrationData = {
  phoneNumber: string;
  name: string;
  profileImage: string;
};
