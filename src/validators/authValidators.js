const { body } = require('express-validator');

exports.registerValidation = [
  body('username')
    .notEmpty().withMessage('Username is required'),
    // .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password')
    .notEmpty().withMessage('Password is required'),
    // .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['Candidate', 'Company']).withMessage('Role must be Candidate or Company'),
  body('email')
    .if(body('role').equals('Candidate'))
    .notEmpty().withMessage('Email is required for Candidates')
    .isEmail().withMessage('Email must be valid'),
  body('phone')
    .if(body('role').equals('Candidate'))
    .notEmpty().withMessage('Phone is required for Candidates'),
  body('fullName')
    .if(body('role').equals('Candidate'))
    .notEmpty().withMessage('Full Name is required for Candidates'),
  body('companyName')
    .if(body('role').equals('Company'))
    .notEmpty().withMessage('Company Name is required for Companies'),
  body('description')
    .if(body('role').equals('Company'))
    .notEmpty().withMessage('Description is required for Companies'),
];