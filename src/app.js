const express = require('express');
const app = express();

app.use(express.json());

// const jobPostRoutes = require('./routes/jobPostRoutes');
// app.use('/api/job-posts', jobPostRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

module.exports = app;
