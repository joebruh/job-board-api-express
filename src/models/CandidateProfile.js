const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: String,
  email: String,
  phone: String,
});

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
