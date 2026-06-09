const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 1. Logic for User Registration (FR1)
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if the user already exists in MongoDB
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create a new user document (the pre-save hook in User.js automatically hashes the password!)
    const user = new User({ username, email, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Logic for User Login & Token Generation (FR2)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Look up the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Validate the submitted password against the hashed string using bcrypt match methods
    // For simplicity at this stage, we'll verify plain text or compare logic. 
    // Let's use standard direct comparison for now:
    const isMatch = await require('bcryptjs').compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate a secure JWT Token packed with the user identity metadata (ID and Role)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token automatically invalidates after 24 hours
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
