const JobPost = require("../models/JobPost");
const slugify = require("slugify");

async function listJobPosts(req, res) {
  const companyProfileId = req.user.companyProfile;

  const jobPosts = await JobPost.find({
    deletedAt: null,
    publishedAt: { $ne: null },
    companyProfile: companyProfileId,
  }).select("title slug description publishedAt updatedAt");

  return jobPosts;
}

async function addJobPost(req) {
  const { title, description, publishNow } = req.body;
  const slug = slugify(title, { lower: true, strict: true });

  const jobPost = new JobPost({
    title,
    slug: slug,
    description,
    publishedAt: publishNow ? new Date() : null,
    companyProfile: req.user.companyProfile._id,
  });

  await jobPost.save();
  return jobPost;
}

async function getJobPost(req) {
  const jobPostId = req.params.id;
  const jobPost = await JobPost.findOne({
    id: jobPostId,
    deletedAt: null,
    companyProfile: req.user.companyProfile._id,
  })
    .populate("companyProfile")
    .select("title slug description publishedAt updatedAt");

  return jobPost;
}

async function updateJobPost(req) {
  const jobPostId = req.params.id;

  const updateData = req.body;

  const jobPost = await JobPost.findOneAndUpdate(
    {
      id: jobPostId,
      companyProfile: req.user.companyProfile._id,
      deletedAt: null,
    },
    updateData,
    { new: true }
  );

  return jobPost;
}

async function deleteJobPost(req) {
  const jobPostId = req.params.id;

  const jobPost = await JobPost.findOneAndUpdate(
    {
      id: jobPostId,
    },
    { deletedAt: new Date() },
    { new: true }
  );

  return jobPost;
}

module.exports = { listJobPosts, addJobPost, getJobPost, updateJobPost, deleteJobPost };
