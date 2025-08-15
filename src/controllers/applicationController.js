const { sendApplication } = require("../services/applicationService");

exports.sendApplication = async (req, res) => {
  try {
    const application = await sendApplication(req);

    console.log(application);

    if (!application) {
      return res.status(404).json({ error: "Job post not found" });
    }
    
    res.status(200).json({ message: "Application sent successfully" });

  } catch (err) {
    console.error("Error sending application:", err);
    res.status(400).json({ error: err.message });
  }
};

// exports.login = async (req, res) => {
//   const { username, password } = req.body;

//   const user = await User.findOne({ username });
//   if (!user) return res.status(400).json({ error: 'Invalid username or password' });

//   const valid = await bcrypt.compare(password, user.passwordHash);
//   if (!valid) return res.status(400).json({ error: 'Invalid username or password' });

//   const token = generateToken(user._id);

//   res.json({ accessToken: token });
// };
