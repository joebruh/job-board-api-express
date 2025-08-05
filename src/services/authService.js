const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const CompanyProfile = require('../models/CompanyProfile');

async function registerUser({ username, password, role, fullName, phone, email, companyName, description }) {
  const existingUser = await User.findOne({ username });
  if (existingUser) throw new Error('Username already taken');

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
  } else if (role === 'Company') {
    companyProfile = await CompanyProfile.create({
      name: companyName,
      description,
      user: user._id,
    });
    user.companyProfile = companyProfile._id;
    await user.save();
  }

  return { user, candidateProfile, companyProfile };
}

module.exports = { registerUser };