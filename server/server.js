const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); // 🛠️ ADDED: Import your new authentication router tier

// 1. Load configurations from the .env file
dotenv.config();

const app = express();

// 2. Enable network rules and incoming JSON handling
app.use(cors());
app.use(express.json());

// 🛠️ ADDED: Mount your API Routing layer onto Express
app.use('/api/auth', authRoutes); // This activates: /api/auth/register and /api/auth/login

// 3. Connect to MongoDB Atlas Cloud Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🚀 Database Pipeline Status: CONNECTED TO MONGO-ATLAS'))
  .catch((err) => console.error('❌ Database Pipeline Status: CONNECTION FAILED\n', err));

// 4. Base Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Server engine and environment configuration verified!'
  });
});

// 5. Fire up the network application port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`📡 Server Engine running on network port: ${PORT}`);
});
