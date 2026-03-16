const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email and include password
    const user = await User.findOne({ email: identifier }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated. Contact administrator.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        schoolId: user.schoolId,
      },
    });

  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/register (admin only — seed initial users)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, schoolId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role, schoolId });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getMe };