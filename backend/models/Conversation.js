const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For tutor-student conversations
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  // Conversation metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ course: 1 });

// Virtual for getting the other participant
conversationSchema.virtual('otherParticipant').get(function() {
  // This will be populated based on the current user context
  return this.participants.find(p => p._id.toString() !== this.currentUserId);
});

// Method to get unread count for a specific user
conversationSchema.methods.getUnreadCount = function(userId) {
  return this.unreadCount.get(userId.toString()) || 0;
};

// Method to mark messages as read for a user
conversationSchema.methods.markAsRead = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  return this.save();
};

// Static method to find or create conversation between two users
conversationSchema.statics.findOrCreateConversation = async function(user1Id, user2Id, courseId = null) {
  try {
    // Try to find existing conversation
    let conversation = await this.findOne({
      participants: { $all: [user1Id, user2Id] },
      isActive: true
    }).populate('participants', 'name email role');

    if (!conversation) {
      // Create new conversation
      conversation = await this.create({
        participants: [user1Id, user2Id],
        course: courseId,
        unreadCount: new Map([
          [user1Id.toString(), 0],
          [user2Id.toString(), 0]
        ])
      });

      // Populate participants
      await conversation.populate('participants', 'name email role');
    }

    return conversation;
  } catch (error) {
    console.error('Error finding or creating conversation:', error);
    throw error;
  }
};

// Static method to get conversations for a user
conversationSchema.statics.getUserConversations = async function(userId, page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    
    const conversations = await this.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'name email role')
    .populate('lastMessage')
    .populate('course', 'title')
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit);

    return conversations;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);
