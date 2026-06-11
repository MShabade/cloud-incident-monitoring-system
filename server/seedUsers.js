const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Points to the blueprint we just made

// Load environment variables (.env)
dotenv.config();

const seedData = async () => {
  try {
    // 1. Establish connection to your live cloud database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📡 Connected to MongoDB Atlas cluster for data injection...');

    // 2. Wipe out any broken test users to ensure a clean slate
    await User.deleteMany();
    console.log('🧹 Cleared old user documents.');

    // 3. Inject the 3 specific permission profiles
    // (Note: The passwords will be automatically encrypted by your User model hook!)
    await User.create([
      {
        username: 'incident_commander',
        email: 'ops@platform.com',
        password: 'SecurePassword123',
        role: 'Administrator'
      },
      {
        username: 'cloud_engineer',
        email: 'engineer@platform.com',
        password: 'SecurePassword123',
        role: 'User'
      },
      {
        username: 'guest_viewer',
        email: 'guest@platform.com',
        password: 'SecurePassword123',
        role: 'Guest'
      }
    ]);

    console.log('✅ Success! Admin, User, and Guest profiles have been created.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding execution failed:', error.message);
    process.exit(1);
  }
};

seedData();