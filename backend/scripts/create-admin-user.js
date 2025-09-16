const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/skilllift');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Status: ${existingAdmin.accountStatus}`);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@skilllift.com',
      password: hashedPassword,
      phone: '+234-800-000-0000',
      role: 'admin',
      accountStatus: 'approved',
      isEmailVerified: true,
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    });

    await adminUser.save();
    
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@skilllift.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Name: System Administrator');
    console.log('📱 Phone: +234-800-000-0000');
    console.log('✅ Status: Approved');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

const main = async () => {
  await connectDB();
  await createAdminUser();
  mongoose.connection.close();
};

main();
