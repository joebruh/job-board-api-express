const { body } = require('express-validator');

exports.addJobPostValidation = [
  body('title')
    .notEmpty().withMessage('Title is required'),
  body('description')
    .notEmpty().withMessage('Description is required'),
  body('publishNow')
    .notEmpty().withMessage('\'Publish Now?\' is required')
];

exports.updateJobPostValidation = [
  body('title')
    .notEmpty().withMessage('Title is required'),
  body('description')
    .notEmpty().withMessage('Description is required'),
]