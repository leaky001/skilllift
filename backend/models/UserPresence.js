const mongoose = require('mongoose');

const userPresenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['online', 'away', 'busy', 'offline'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  socketId: {
    type: String,
    default: null
  },
  // Additional presence data
  currentActivity: {
    type: String,
    default: null // e.g., 'in_chat', 'viewing_course', 'taking_quiz'
  },
  currentConversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    default: null
  },
  // Device/browser info
  userAgent: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
userPresenceSchema.index({ user: 1 });
userPresenceSchema.index({ isOnline: 1 });
userPresenceSchema.index({ lastSeen: -1 });
userPresenceSchema.index({ status: 1 });

// Static method to update user presence
userPresenceSchema.statics.updatePresence = async function(userId, presenceData) {
  try {
    const presence = await this.findOneAndUpdate(
      { user: userId },
      {
        ...presenceData,
        lastSeen: new Date()
      },
      { 
        upsert: true, 
        new: true 
      }
    );
    
    return presence;
  } catch (error) {
    console.error('Error updating user presence:', error);
    throw error;
  }
};

// Static method to get online users
userPresenceSchema.statics.getOnlineUsers = async function(excludeUserId = null) {
  try {
    const query = { isOnline: true };
    if (excludeUserId) {
      query.user = { $ne: excludeUserId };
    }
    
    const onlineUsers = await this.find(query)
      .populate('user', 'name email role profilePicture')
      .sort({ lastSeen: -1 });
    
    return onlineUsers;
  } catch (error) {
    console.error('Error getting online users:', error);
    throw error;
  }
};

// Static method to set user offline
userPresenceSchema.statics.setOffline = async function(userId) {
  try {
    await this.findOneAndUpdate(
      { user: userId },
      {
        isOnline: false,
        status: 'offline',
        lastSeen: new Date(),
        socketId: null,
        currentActivity: null,
        currentConversation: null
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error setting user offline:', error);
    throw error;
  }
};

// Static method to get user's conversation partners' online status
userPresenceSchema.statics.getConversationPartnersStatus = async function(userId, conversationId) {
  try {
    const Conversation = require('./Conversation');
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return [];
    }
    
    const partnerIds = conversation.participants.filter(p => p.toString() !== userId.toString());
    
    const partnersStatus = await this.find({
      user: { $in: partnerIds }
    }).populate('user', 'name email role profilePicture');
    
    return partnersStatus;
  } catch (error) {
    console.error('Error getting conversation partners status:', error);
    throw error;
  }
};

module.exports = mongoose.model('UserPresence', userPresenceSchema);

