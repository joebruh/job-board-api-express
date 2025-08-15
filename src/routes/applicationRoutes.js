const express = require('express');
const router = express.Router();

const { sendApplication } = require('../controllers/applicationController');
const { addApplicationValidation } = require('../validators/applicationValidators');
const validateRequest = require('../middleware/validateRequest');
const { auth, authorizeCompany, authorizeCandidate } = require('../middleware/authMiddleware');

router.post('/job-application/:id', auth, authorizeCandidate, addApplicationValidation, validateRequest, sendApplication);
// router.get('/view-application/:id', auth, authorizeCompany, viewApplication);

module.exports = router;