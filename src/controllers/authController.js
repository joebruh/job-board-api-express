const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { registerUser } = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const { user, candidateProfile, companyProfile } = await registerUser(req.body);
    res.status(201).json({
      id: user._id,
      username: user.username,
      passwordHash: user.passwordHash,
      role: user.role,
      candidateProfile,
      companyProfile,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: 'Invalid username or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: 'Invalid username or password' });

  const token = generateToken(user._id);

  res.json({ accessToken: token });
};
