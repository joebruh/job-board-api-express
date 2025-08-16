const Application = require("../models/Application");
const JobPost = require("../models/JobPost");

async function sendApplication(req, res) {
  const jobPostId = req.params.id;

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

async function getApplicationById(req, res) {
  const applicationId = req.params.id;
  const candidateProfileId = req.user.candidateProfile?._id || null;
  const companyProfileId = req.user.companyProfile?._id || null;

  let match = { id: applicationId };

  if (candidateProfileId) {
    match.candidateProfile = candidateProfileId;
  }

  let query = Application.findOne(match)
    .populate("candidateProfile")
    .populate({
      path: "jobPost",
      match: companyProfileId ? { companyProfile: companyProfileId } : {},
    })
    .select("resumeLink coverLetter status createdAt");

  const application = await query;

  if (!application) {
    return null;
  }

  if (companyProfileId && !application.status) {
    application.status = 'Viewed';

    await application.save();
  }

  return application;
}

module.exports = { sendApplication, getApplicationById };
