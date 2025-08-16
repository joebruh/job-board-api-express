const { sendApplication, getApplicationById } = require("../services/applicationService");

exports.sendApplication = async (req, res) => {
  try {
    const application = await sendApplication(req);

    if (!application) {
      return res.status(404).json({ error: "Job post not found" });
    }
    
    res.status(200).json({ message: "Application sent successfully" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await getApplicationById(req);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    res.status(200).json(application);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }

}
