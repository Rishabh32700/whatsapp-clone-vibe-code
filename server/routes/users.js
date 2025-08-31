import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

// Custom validation for Indian phone numbers
const validateIndianPhoneNumber = (value) => {
  // Remove all non-digit characters
  let cleanNumber = value.replace(/\D/g, '');
  
  // Handle +91 country code (remove if present)
  if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
    cleanNumber = cleanNumber.substring(2);
  }
  
  // Indian mobile numbers are 10 digits starting with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;
  
  if (!indianMobileRegex.test(cleanNumber)) {
    throw new Error('Please enter a valid Indian mobile number (10 digits starting with 6, 7, 8, or 9)');
  }
  
  return cleanNumber; // Return cleaned number
};

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('phoneNumber')
    .custom(validateIndianPhoneNumber)
    .withMessage('Please enter a valid Indian mobile number'),
  body('name').isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('profileImage').isURL().withMessage('Please enter a valid image URL'),
  body('sessionId').notEmpty().withMessage('Session ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNumber: rawPhoneNumber, name, profileImage, sessionId } = req.body;
    
    // Clean the phone number (remove non-digits)
    let phoneNumber = rawPhoneNumber.replace(/\D/g, '');
    
    // Handle +91 country code (remove if present)
    if (phoneNumber.startsWith('91') && phoneNumber.length === 12) {
      phoneNumber = phoneNumber.substring(2);
    }

    // Check if user already exists
    let user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }

    // Create new user
    user = new User({
      phoneNumber,
      name,
      profileImage,
      sessionId,
      isOnline: true
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        profileImage: user.profileImage,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (excluding current user)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('phoneNumber name profileImage isOnline lastSeen')
      .sort({ isOnline: -1, name: 1 });

    // Transform users to include id field
    const transformedUsers = users.map(user => ({
      id: user._id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      profileImage: user.profileImage,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('phoneNumber name profileImage isOnline lastSeen');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform user to include id field
    const transformedUser = {
      id: user._id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      profileImage: user.profileImage,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen
    };

    res.json(transformedUser);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/online
// @desc    Update user online status
// @access  Private
router.put('/online', auth, async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        isOnline,
        lastSeen: isOnline ? undefined : new Date()
      },
      { new: true }
    ).select('isOnline lastSeen');

    res.json(user);
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
