const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.userId).select('-passwordHash');
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

async function authorizeCompany(req, res, next) {
  if (!req.user || req.user.role !== 'Company') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = await req.user.populate('companyProfile');

  next();
}

async function authorizeCandidate(req, res, next) {
  if (!req.user || req.user.role !== 'Candidate') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = await req.user.populate('candidateProfile');

  next();
}

module.exports = { auth, authorizeCompany, authorizeCandidate };
