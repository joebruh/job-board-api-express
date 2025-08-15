const {
  listJobPosts,
  addJobPost,
  getJobPost,
  updateJobPost,
  deleteJobPost
} = require("../services/jobPostService");

exports.listJobPosts = async (req, res) => {
  try {
    const jobPosts = await listJobPosts(req, res);

    res.status(200).json(jobPosts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job posts" });
  }
};

exports.addJobPost = async (req, res) => {
  try {
    const jobPost = await addJobPost(req);

    res.status(201).json({
      id: jobPost._id,
      slug: jobPost.slug,
      title: jobPost.title,
      description: jobPost.description,
      publishedAt: jobPost.publishedAt,
      companyProfile: jobPost.companyProfile,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add a job post" });
  }
};

exports.getJobPost = async (req, res) => {
  try {
    const jobPost = await getJobPost(req);

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    res.status(200).json(jobPost);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job post" });
  }
};

exports.updateJobPost = async (req, res) => {
  try {
    console.log("sweep");
    const jobPost = await updateJobPost(req);

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    res.status(200).json(jobPost);
  } catch (error) {
    res.status(500).json({ error: "Failed to update job post" });
  }
};

exports.deleteJobPost = async (req, res) => {
  try {
    const jobPost = await deleteJobPost(req);

    if (!jobPost) {
      return res.status(404).json({ error: "Job post not found" });
    }

    res.status(200).json({ message: "Job post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete job post" });
  }
};