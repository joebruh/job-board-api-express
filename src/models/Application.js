const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  resumeLink: { 
    type: String,
    required: true
  },
  coverLetter: { type: String },
  createdAt: { type: Date },
  status: { type: String, default: null },
  candidateProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CandidateProfile",
    required: true,
  },
  jobPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPost",
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Application", applicationSchema);
