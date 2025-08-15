const mongoose = require("mongoose");

const jobPostSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: String,
  slug: { type: String, unique: true },
  description: String,
  publishedAt: { type: Date },
  deletedAt: { type: Date },
  companyProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CompanyProfile",
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("JobPost", jobPostSchema);
