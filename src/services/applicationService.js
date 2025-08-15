const Application = require("../models/Application");
const CandidateProfile = require("../models/CandidateProfile");
const CompanyProfile = require("../models/CompanyProfile");
const JobPost = require("../models/JobPost");
const User = require("../models/User");
const slugify = require("slugify");

async function sendApplication(req, res) {
  const jobPostId = req.params.id;

  console.log(req.params.id);

  const jobPost = await JobPost.findOneAndUpdate(
    {
      id: jobPostId,
      publishedAt: { $ne: null },
      deletedAt: null,
    },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!jobPost) {
    return jobPost;
  }

  const application = new Application({
    resumeLink: req.resumeLink,
    coverLetter: req.coverLetter,
    createdAt: new Date(),
    candidateProfile: req.user.candidateProfile._id,
    jobPost: jobPost._id,
  });

  await application.save();

  return application;
}

module.exports = { sendApplication };
