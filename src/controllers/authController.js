const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const CompanyProfile = require('../models/CompanyProfile');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  const { username, password, role, fullName, phone, email, companyName, description } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ error: 'Username already taken' });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({ username, passwordHash, role });

  let candidateProfile = null;
  let companyProfile = null;
  if (role === 'Candidate') {
    candidateProfile = await CandidateProfile.create({
      name: fullName,
      phone,
      email,
      user: user._id,
    });
    user.candidateProfile = candidateProfile._id;
    await user.save();
  } 
  else if (role === 'Company') 
  {
    companyProfile = await CompanyProfile.create({
      name: companyName,
      description,
      user: user._id,
    });
    user.companyProfile = companyProfile._id;
    await user.save();
    
  }
  
  res.status(201).json({
    id: user._id,
    username: user.username,
    passwordHash: user.passwordHash,
    role: user.role,
    candidateProfile: candidateProfile,
    companyProfile: companyProfile,
  });
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
