import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  profileImage: {
    type: String,
    required: true,
    default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ phoneNumber: 1 });
userSchema.index({ isOnline: 1 });

const User = mongoose.model('User', userSchema);

export default User;
