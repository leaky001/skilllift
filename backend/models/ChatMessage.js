const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function() {
      return this.type === 'text';
    }
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'voice', 'system'],
    default: 'text'
  },
  // For file messages
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  // For reply messages
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  replyContent: {
    type: String
  },
  // Message status
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read'],
    default: 'sent'
  },
  // Read status for each participant
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Message metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  // For system messages
  systemMessage: {
    type: String,
    enum: ['user_joined', 'user_left', 'conversation_created', 'message_deleted']
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatMessageSchema.index({ conversation: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ receiver: 1 });
chatMessageSchema.index({ status: 1 });

// Virtual for formatted timestamp
chatMessageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Method to mark message as read by a user
chatMessageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    this.status = 'read';
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to check if message is read by a user
chatMessageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Static method to get messages for a conversation
chatMessageSchema.statics.getConversationMessages = async function(conversationId, page = 1, limit = 50) {
  try {
    const skip = (page - 1) * limit;
    
    const messages = await this.find({ conversation: conversationId })
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role')
      .populate('replyTo', 'content sender')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return messages.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

// Static method to create a text message
chatMessageSchema.statics.createTextMessage = async function(data) {
  try {
    const message = new this({
      conversation: data.conversationId,
      sender: data.senderId,
      receiver: data.receiverId,
      content: data.content,
      type: 'text',
      replyTo: data.replyTo || null,
      replyContent: data.replyContent || null
    });

    const savedMessage = await message.save();
    
    // Populate the message
    await savedMessage.populate([
      { path: 'sender', select: 'name email role' },
      { path: 'receiver', select: 'name email role' },
      { path: 'replyTo', select: 'content sender' }
    ]);

    return savedMessage;
  } catch (error) {
    console.error('Error creating text message:', error);
    throw error;
  }
};

// Static method to create a file message
chatMessageSchema.statics.createFileMessage = async function(data) {
  try {
    const message = new this({
      conversation: data.conversationId,
      sender: data.senderId,
      receiver: data.receiverId,
      type: data.fileType || 'file',
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType
    });

    const savedMessage = await message.save();
    
    // Populate the message
    await savedMessage.populate([
      { path: 'sender', select: 'name email role' },
      { path: 'receiver', select: 'name email role' }
    ]);

    return savedMessage;
  } catch (error) {
    console.error('Error creating file message:', error);
    throw error;
  }
};

// Pre-save middleware to update conversation's last message
chatMessageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Conversation = mongoose.model('Conversation');
      await Conversation.findByIdAndUpdate(this.conversation, {
        lastMessage: this._id,
        lastMessageAt: this.createdAt
      });
      
      // Increment unread count for receiver
      const conversation = await Conversation.findById(this.conversation);
      if (conversation) {
        await conversation.incrementUnreadCount(this.receiver);
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }
  next();
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
