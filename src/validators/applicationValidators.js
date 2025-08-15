const { body } = require('express-validator');

exports.addApplicationValidation = [
  body('resumeLink')
    .notEmpty().withMessage('Resume link is required'),
//   body('coverLetter')
//     .notEmpty().withMessage('Cover Letter is required'),
];