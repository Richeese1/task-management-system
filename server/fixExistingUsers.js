const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function fixExistingUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management');
    console.log('Connected to MongoDB');

    // Find users without passwords (excluding OAuth users)
    const usersWithoutPassword = await User.find({
      $or: [
        { password: { $exists: false } },
        { password: null },
        { password: '' }
      ],
      googleId: { $exists: false },
      facebookId: { $exists: false }
    });

    console.log(`Found ${usersWithoutPassword.length} users without passwords`);

    for (const user of usersWithoutPassword) {
      // Create a temporary password
      const tempPassword = 'temp_password_' + Math.random().toString(36).substring(2);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      console.log(`Fixed user: ${user.email} - Temp password: ${tempPassword}`);
    }

    console.log('Fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing users:', error);
    process.exit(1);
  }
}

fixExistingUsers();
