const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');
const { registerValidation } = require('../validators/authValidators');
const validateRequest = require('../middleware/validateRequest');

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', login);

module.exports = router;
