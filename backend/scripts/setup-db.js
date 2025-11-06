const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { User } = require('../src/models');

async function setupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('🍃 Connected to MongoDB');

    // Create Super Admin user if it doesn't exist
    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await User.create({
        name: 'Super Admin',
        email: 'admin@ncbbilling.com',
        password: hashedPassword,
        mobileNo: '9999999999',
        role: 'SUPER_ADMIN',
        isVerified: true,
        isActive: true,
      });

      console.log('✅ Super Admin created successfully');
      console.log('📧 Email: admin@ncbbilling.com');
      console.log('🔑 Password: admin123');
      console.log('📱 Mobile: 9999999999');
    } else {
      console.log('ℹ️  Super Admin already exists');
    }

    console.log('🎉 Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();