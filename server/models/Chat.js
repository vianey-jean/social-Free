
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  attachment: {
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file'],
      required: false
    },
    url: {
      type: String,
      required: false
    },
    name: {
      type: String,
      required: false
    },
    mimeType: {
      type: String,
      required: false
    }
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  messages: [messageSchema],
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  typingUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  calls: [{
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['missed', 'answered', 'rejected'],
      required: true
    },
    type: {
      type: String,
      enum: ['audio', 'video'],
      required: true
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number
    }
  }]
}, { timestamps: true });

// Add an index for faster chat lookups by participants
chatSchema.index({ participants: 1 });

// Add method to find chat by participants
chatSchema.statics.findByParticipants = function(userId1, userId2) {
  return this.findOne({
    participants: { 
      $all: [userId1, userId2],
      $size: 2
    }
  }).populate({
    path: 'messages.sender', 
    select: 'firstName lastName avatar'
  });
};

// Add method to find all chats for a user
chatSchema.statics.findByUser = function(userId) {
  return this.find({
    participants: userId
  })
  .populate({
    path: 'participants',
    select: 'firstName lastName avatar isOnline'
  })
  .populate({
    path: 'messages.sender', 
    select: 'firstName lastName avatar'
  })
  .sort({ updatedAt: -1 });
};

// Add method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId) {
      message.read = true;
    }
  });
  
  // Reset unread counter for this user
  if (this.unreadCount) {
    this.unreadCount.set(userId.toString(), 0);
  }
  
  return this.save();
};

// Add method to update typing status
chatSchema.methods.updateTypingStatus = function(userId) {
  // Remove any existing typing status for this user
  this.typingUsers = this.typingUsers.filter(user => user.userId.toString() !== userId.toString());
  
  // Add new typing status
  this.typingUsers.push({
    userId,
    timestamp: new Date()
  });
  
  // Clean up old typing statuses (older than 5 seconds)
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  this.typingUsers = this.typingUsers.filter(
    user => user.timestamp > fiveSecondsAgo
  );
  
  return this.save();
};

// Add method to record a call
chatSchema.methods.addCall = function(callData) {
  this.calls.push(callData);
  return this.save();
};

// Add method to update a call (e.g., when a call ends)
chatSchema.methods.updateCall = function(callId, updateData) {
  const call = this.calls.id(callId);
  if (!call) return null;
  
  Object.assign(call, updateData);
  if (updateData.endTime && !updateData.duration) {
    call.duration = (call.endTime - call.startTime) / 1000; // Duration in seconds
  }
  
  return this.save();
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
