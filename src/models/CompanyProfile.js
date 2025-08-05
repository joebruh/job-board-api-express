const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: String,
  description: String,
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
