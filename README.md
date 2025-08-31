# Multi-User WhatsApp Clone with Backend API

A complete WhatsApp-like application with **real backend API**, **MongoDB database**, and **real-time messaging** using Socket.io. This solves the cross-browser localStorage issue by providing a centralized data store.

## 🚀 **Complete Solution Features**

### **Backend API (Express.js + MongoDB)**
- ✅ **User Management**: Registration, authentication, profile management
- ✅ **Friend System**: Send, accept, decline friend requests
- ✅ **Real-time Chat**: Live messaging with Socket.io
- ✅ **Message Status**: Sent, delivered, read indicators
- ✅ **Online Status**: Real-time online/offline tracking
- ✅ **Cross-Browser**: All browsers connect to same backend

### **Frontend (React + TypeScript)**
- ✅ **Modern UI**: WhatsApp-inspired design with TailwindCSS
- ✅ **Real-time Updates**: Live message delivery and status updates
- ✅ **User Discovery**: Find and connect with other users
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Type Safety**: Full TypeScript implementation

## 🛠️ **Tech Stack**

### **Backend**
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Express Validator** - Input validation
- **Helmet** + **CORS** - Security

### **Frontend**
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Socket.io Client** - Real-time features
- **Vite** - Build tool

## 📦 **Installation & Setup**

### **1. Prerequisites**
```bash
# Install MongoDB (if not already installed)
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com
# Linux: sudo apt install mongodb
```

### **2. Clone & Setup**
```bash
# Clone the repository
git clone <repository-url>
cd whatsapp-clone

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### **3. Database Setup**
```bash
# Start MongoDB
mongod

# Or if using MongoDB Atlas, update the connection string in server/config.env
```

### **4. Environment Configuration**
```bash
# Backend environment (server/config.env)
PORT=5001
MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### **5. Start the Application**
```bash
# Terminal 1: Start Backend API
cd server
npm run dev

# Terminal 2: Start Frontend
npm run dev
```

## 🌐 **Access Points**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Socket.io**: ws://localhost:5001
- **Health Check**: http://localhost:5001/api/health

## 🔌 **API Endpoints**

### **Users**
- `POST /api/users/register` - Register new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/online` - Update online status

### **Friend Requests**
- `POST /api/friend-requests` - Send friend request
- `GET /api/friend-requests` - Get all requests
- `GET /api/friend-requests/pending` - Get pending requests
- `PUT /api/friend-requests/:id` - Accept/decline request

### **Chats**
- `GET /api/chats` - Get user's chats
- `GET /api/chats/:id` - Get specific chat
- `POST /api/chats/:id/messages` - Send message
- `PUT /api/chats/:id/messages/:messageId/status` - Update message status

## 🎯 **How to Use**

### **1. Register Users**
1. Open http://localhost:3000 in Browser 1
2. Register with phone number, name, and profile image
3. Open http://localhost:3000 in Browser 2 (different browser/incognito)
4. Register another user with different details

### **2. Discover & Connect**
1. In either browser, click "Discover People"
2. You'll see all registered users (including from other browsers)
3. Send friend requests to other users
4. Accept friend requests in the other browser

### **3. Start Chatting**
1. Once connected, users can start chatting
2. Messages appear in real-time across browsers
3. See online/offline status updates
4. Message status indicators (sent, delivered, read)

## 🔧 **Real-time Features**

### **Socket.io Events**
- **User Connection**: Automatic online status updates
- **Message Delivery**: Real-time message sending/receiving
- **Typing Indicators**: Show when users are typing
- **Friend Requests**: Instant notifications
- **Online Status**: Live online/offline updates

### **Message Flow**
1. User A sends message → API saves to database
2. Socket.io emits to User B (if online)
3. User B receives message instantly
4. Message status updates automatically

## 📱 **Cross-Browser Testing**

### **Before (localStorage Issue)**
- ❌ Users in different browsers couldn't see each other
- ❌ No real-time communication
- ❌ Data isolated per browser

### **After (API Solution)**
- ✅ All users visible across all browsers
- ✅ Real-time messaging between browsers
- ✅ Centralized data storage
- ✅ Persistent user sessions

## 🚀 **Deployment Ready**

### **Backend Deployment**
- **Heroku**: Add MongoDB Atlas connection
- **Vercel**: Serverless deployment
- **Railway**: Easy deployment with MongoDB
- **DigitalOcean**: VPS deployment

### **Frontend Deployment**
- **Vercel**: Automatic deployment
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting

## 🔒 **Security Features**

- **JWT Authentication**: Secure user sessions
- **Input Validation**: Prevent malicious data
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Secure cross-origin requests
- **Helmet Security**: HTTP headers protection

## 📊 **Database Schema**

### **Users Collection**
```javascript
{
  _id: ObjectId,
  phoneNumber: String (unique),
  name: String,
  profileImage: String,
  isOnline: Boolean,
  lastSeen: Date,
  sessionId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Friend Requests Collection**
```javascript
{
  _id: ObjectId,
  fromUserId: ObjectId (ref: User),
  toUserId: ObjectId (ref: User),
  status: String (pending/accepted/declined),
  createdAt: Date,
  updatedAt: Date
}
```

### **Chats Collection**
```javascript
{
  _id: ObjectId,
  participants: [ObjectId (ref: User)],
  messages: [{
    content: String,
    senderId: ObjectId (ref: User),
    receiverId: ObjectId (ref: User),
    status: String (sent/delivered/read),
    type: String (text/image/file),
    createdAt: Date
  }],
  lastMessage: String,
  lastMessageTime: Date,
  unreadCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎉 **Success!**

You now have a **complete, production-ready WhatsApp clone** with:
- ✅ **Real backend API** solving cross-browser issues
- ✅ **MongoDB database** for persistent data
- ✅ **Socket.io** for real-time features
- ✅ **JWT authentication** for security
- ✅ **Cross-browser compatibility**
- ✅ **Real-time messaging**

**The localStorage problem is completely solved!** 🚀
