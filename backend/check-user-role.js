// Check and update user role
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://lakybass19:abass200@cluster0.7qtal7v.mongodb.net/skilllift';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkAndUpdateUser = async () => {
  try {
    await connectDB();
    
    // Find the user by ID from the token
    const userId = '68c43ef8de60ec7155428df9';
    const user = await User.findById(userId);
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 Current user:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      kycStatus: user.kycStatus
    });
    
    if (user.role !== 'tutor') {
      console.log('🔄 Updating user role from', user.role, 'to tutor');
      user.role = 'tutor';
      await user.save();
      console.log('✅ User role updated successfully');
    } else {
      console.log('✅ User role is already tutor');
    }
    
    // Verify the update
    const updatedUser = await User.findById(userId);
    console.log('✅ Final user role:', updatedUser.role);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

checkAndUpdateUser();
