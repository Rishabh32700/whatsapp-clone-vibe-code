import express from 'express';
import { body, validationResult } from 'express-validator';
import FriendRequest from '../models/FriendRequest.js';
import Chat from '../models/Chat.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/friend-requests
// @desc    Send a friend request
// @access  Private
router.post('/', [
  body('toUserId').isMongoId().withMessage('Invalid user ID'),
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { toUserId } = req.body;
    const fromUserId = req.user._id;

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    // Create new friend request
    const friendRequest = new FriendRequest({
      fromUserId,
      toUserId,
      status: 'pending'
    });

    await friendRequest.save();

    // Populate user details
    await friendRequest.populate([
      { path: 'fromUserId', select: 'name profileImage' },
      { path: 'toUserId', select: 'name profileImage' }
    ]);

    // Transform response to include id field
    const transformedRequest = {
      id: friendRequest._id,
      fromUserId: friendRequest.fromUserId._id,
      toUserId: friendRequest.toUserId._id,
      status: friendRequest.status,
      createdAt: friendRequest.createdAt,
      fromUser: {
        id: friendRequest.fromUserId._id,
        name: friendRequest.fromUserId.name,
        profileImage: friendRequest.fromUserId.profileImage
      },
      toUser: {
        id: friendRequest.toUserId._id,
        name: friendRequest.toUserId.name,
        profileImage: friendRequest.toUserId.profileImage
      }
    };

    res.status(201).json(transformedRequest);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friend-requests
// @desc    Get all friend requests for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const friendRequests = await FriendRequest.find({
      $or: [
        { fromUserId: req.user._id },
        { toUserId: req.user._id }
      ]
    }).populate([
      { path: 'fromUserId', select: 'name profileImage phoneNumber' },
      { path: 'toUserId', select: 'name profileImage phoneNumber' }
    ]).sort({ createdAt: -1 });

    // Transform friend requests to include id fields
    const transformedRequests = friendRequests.map(request => ({
      id: request._id,
      fromUserId: request.fromUserId._id,
      toUserId: request.toUserId._id,
      status: request.status,
      createdAt: request.createdAt,
      fromUser: {
        id: request.fromUserId._id,
        name: request.fromUserId.name,
        profileImage: request.fromUserId.profileImage,
        phoneNumber: request.fromUserId.phoneNumber
      },
      toUser: {
        id: request.toUserId._id,
        name: request.toUserId.name,
        profileImage: request.toUserId.profileImage,
        phoneNumber: request.toUserId.phoneNumber
      }
    }));

    res.json(transformedRequests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/friend-requests/:id
// @desc    Accept or decline a friend request
// @access  Private
router.put('/:id', [
  body('status').isIn(['accepted', 'declined']).withMessage('Status must be accepted or declined')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const friendRequest = await FriendRequest.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Check if user is the recipient of the request
    if (friendRequest.toUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this request' });
    }

    friendRequest.status = status;
    await friendRequest.save();

    // If accepted, create a chat between the users
    if (status === 'accepted') {
      // Check if chat already exists
      const existingChat = await Chat.findOne({
        participants: {
          $all: [friendRequest.fromUserId, friendRequest.toUserId],
          $size: 2
        }
      });

      if (!existingChat) {
        const chat = new Chat({
          participants: [friendRequest.fromUserId, friendRequest.toUserId],
          messages: [],
          lastMessage: '',
          lastMessageTime: new Date(),
          unreadCount: 0
        });

        await chat.save();
      }
    }

    // Populate user details
    await friendRequest.populate([
      { path: 'fromUserId', select: 'name profileImage phoneNumber' },
      { path: 'toUserId', select: 'name profileImage phoneNumber' }
    ]);

    // Transform response to include id field
    const transformedRequest = {
      id: friendRequest._id,
      fromUserId: friendRequest.fromUserId._id,
      toUserId: friendRequest.toUserId._id,
      status: friendRequest.status,
      createdAt: friendRequest.createdAt,
      fromUser: {
        id: friendRequest.fromUserId._id,
        name: friendRequest.fromUserId.name,
        profileImage: friendRequest.fromUserId.profileImage,
        phoneNumber: friendRequest.fromUserId.phoneNumber
      },
      toUser: {
        id: friendRequest.toUserId._id,
        name: friendRequest.toUserId.name,
        profileImage: friendRequest.toUserId.profileImage,
        phoneNumber: friendRequest.toUserId.phoneNumber
      }
    };

    res.json(transformedRequest);
  } catch (error) {
    console.error('Update friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/friend-requests/pending
// @desc    Get pending friend requests for current user
// @access  Private
router.get('/pending', auth, async (req, res) => {
  try {
    const pendingRequests = await FriendRequest.find({
      toUserId: req.user._id,
      status: 'pending'
    }).populate('fromUserId', 'name profileImage phoneNumber')
    .sort({ createdAt: -1 });

    // Transform pending requests to include id fields
    const transformedRequests = pendingRequests.map(request => ({
      id: request._id,
      fromUserId: request.fromUserId._id,
      toUserId: request.toUserId,
      status: request.status,
      createdAt: request.createdAt,
      fromUser: {
        id: request.fromUserId._id,
        name: request.fromUserId.name,
        profileImage: request.fromUserId.profileImage,
        phoneNumber: request.fromUserId.phoneNumber
      }
    }));

    res.json(transformedRequests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
