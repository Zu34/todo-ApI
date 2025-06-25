const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      const error = new Error('Email already in use');
      error.statusCode = 400;
      return next(error);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();

    res.status(201).json({ msg: 'User created' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 400;
      return next(error);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = new Error('Invalid credentials');
      error.statusCode = 400;
      return next(error);
    }

    const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
