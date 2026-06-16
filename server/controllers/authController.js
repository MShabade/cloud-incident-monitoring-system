const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generates a signed JWT containing the user's id and role
const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

// User Registration
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // role defaults to 'User' in the schema if not provided —
    // never trust a client-supplied 'Administrator' role without separate approval in production
    const user = new User({ username, email, password, role: role === 'Administrator' ? 'User' : role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    next(error);
  }
};

// User Login & Token Generation
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};