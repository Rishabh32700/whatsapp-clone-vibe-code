import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import routes
import userRoutes from './routes/users.js';
import friendRequestRoutes from './routes/friendRequests.js';
import chatRoutes from './routes/chats.js';

// Load environment variables
dotenv.config({ path: './config.env' });

// Connect to MongoDB
connectDB();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting - More permissive for legitimate use
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 100 to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// More permissive rate limiting for chat endpoints
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Higher limit for chat operations
  message: 'Too many chat requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/chats', chatLimiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/friend-requests', friendRequestRoutes);
app.use('/api/chats', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WhatsApp Clone API is running' });
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their user ID
  socket.on('join', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    
    // Update user online status
    socket.emit('user-online', { userId, isOnline: true });
    
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Handle new messages
  socket.on('send-message', (data) => {
    const { chatId, message, receiverId } = data;
    console.log('Received send-message event:', { chatId, message, receiverId, senderId: socket.userId });
    
    // Emit to receiver if online
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      console.log('Emitting new-message to receiver:', receiverSocketId);
      io.to(receiverSocketId).emit('new-message', {
        chatId,
        message
      });
    } else {
      console.log('Receiver not online:', receiverId);
    }
    
    // Emit back to sender for confirmation
    console.log('Emitting message-sent confirmation to sender:', socket.id);
    socket.emit('message-sent', { chatId, message });
    
    // Broadcast to all connected users to update their chat lists
    io.emit('chat-updated', { chatId });
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { chatId, receiverId, isTyping } = data;
    
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user-typing', {
        chatId,
        userId: socket.userId,
        isTyping
      });
    }
  });

  // Handle friend request notifications
  socket.on('friend-request-sent', (data) => {
    const { receiverId, request } = data;
    
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new-friend-request', request);
    }
  });

  // Handle friend request response
  socket.on('friend-request-responded', (data) => {
    const { senderId, response } = data;
    
    const senderSocketId = connectedUsers.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('friend-request-updated', response);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      
      // Update user offline status
      socket.broadcast.emit('user-offline', { 
        userId: socket.userId, 
        isOnline: false 
      });
      
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000 or http://localhost:3001`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.io: ws://localhost:${PORT}`);
});
