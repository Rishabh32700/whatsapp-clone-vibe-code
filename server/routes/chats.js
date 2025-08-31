import express from 'express';
import { body, validationResult } from 'express-validator';
import Chat from '../models/Chat.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/chats
// @desc    Get all chats for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    }).populate('participants', 'name profileImage isOnline lastSeen phoneNumber')
    .sort({ lastMessageTime: -1 });

    // Format chats for frontend
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );

      return {
        id: chat._id,
        participants: chat.participants.map(p => p._id),
        messages: chat.messages
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map(message => ({
            id: message._id,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId,
            status: message.status,
            type: message.type,
            timestamp: message.createdAt
          })),
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        unreadCount: chat.unreadCount,
        otherParticipant: {
          id: otherParticipant._id,
          name: otherParticipant.name,
          profileImage: otherParticipant.profileImage,
          isOnline: otherParticipant.isOnline,
          lastSeen: otherParticipant.lastSeen,
          phoneNumber: otherParticipant.phoneNumber
        }
      };
    });

    res.json(formattedChats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chats/:id
// @desc    Get specific chat with messages
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id
    }).populate('participants', 'name profileImage isOnline lastSeen phoneNumber');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const otherParticipant = chat.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );

    const formattedChat = {
      id: chat._id,
      participants: chat.participants.map(p => p._id),
      messages: chat.messages
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map(message => ({
          id: message._id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          status: message.status,
          type: message.type,
          timestamp: message.createdAt
        })),
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.lastMessageTime,
      unreadCount: chat.unreadCount,
      otherParticipant: {
        id: otherParticipant._id,
        name: otherParticipant.name,
        profileImage: otherParticipant.profileImage,
        isOnline: otherParticipant.isOnline,
        lastSeen: otherParticipant.lastSeen,
        phoneNumber: otherParticipant.phoneNumber
      }
    };

    res.json(formattedChat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chats/:id/messages
// @desc    Send a message in a chat
// @access  Private
router.post('/:id/messages', [
  body('content').notEmpty().withMessage('Message content is required'),
  body('type').isIn(['text', 'image', 'file']).withMessage('Invalid message type')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, type = 'text' } = req.body;
    const chatId = req.params.id;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Find the other participant
    const otherParticipant = chat.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    // Create new message
    const newMessage = {
      content,
      senderId: req.user._id,
      receiverId: otherParticipant,
      status: 'sent',
      type
    };

    // Add message to chat
    chat.messages.push(newMessage);
    chat.lastMessage = content;
    chat.lastMessageTime = new Date();

    await chat.save();

    // Populate the new message with sender details
    const populatedChat = await Chat.findById(chatId)
      .populate('participants', 'name profileImage');

    const addedMessage = populatedChat.messages[populatedChat.messages.length - 1];

    res.status(201).json({
      message: addedMessage,
      chat: {
        id: chat._id,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chats/:id/messages/:messageId/status
// @desc    Update message status (delivered, read)
// @access  Private
router.put('/:id/messages/:messageId/status', [
  body('status').isIn(['delivered', 'read']).withMessage('Invalid status')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const { id: chatId, messageId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Find and update the message
    const message = chat.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.status = status;
    await chat.save();

    res.json({ message: 'Message status updated' });
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
