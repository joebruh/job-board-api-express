const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const jobPostRoutes = require('./routes/jobPostRoutes');
app.use('/api/job-posts', jobPostRoutes);

const applicationRoutes = require('./routes/applicationRoutes');
app.use('/api', applicationRoutes);

module.exports = app;
