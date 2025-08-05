const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Candidate', 'Company'], required: true },
  candidateProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateProfile' },
  companyProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile' },
});

module.exports = mongoose.model('User', userSchema);
