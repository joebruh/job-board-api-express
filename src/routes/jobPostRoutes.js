const express = require('express');
const router = express.Router();

const { listJobPosts, addJobPost, getJobPost, updateJobPost, deleteJobPost } = require('../controllers/jobPostController');
const { addJobPostValidation, updateJobPostValidation } = require('../validators/jobPostValidators');
const validateRequest = require('../middleware/validateRequest');
const { auth, authorizeCompany } = require('../middleware/authMiddleware');

router.get('/', auth, authorizeCompany, listJobPosts);
router.post('/', auth, authorizeCompany, addJobPostValidation, validateRequest, addJobPost);
router.get('/:id', auth, authorizeCompany, getJobPost);
router.put('/:id', auth, authorizeCompany, updateJobPostValidation, validateRequest, updateJobPost);
router.delete('/:id', auth, authorizeCompany, deleteJobPost);

module.exports = router;