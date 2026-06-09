// middleware/validators.js
// Input validation/sanitization — guards against XSS and malformed data
// at the edge, before it ever reaches a controller or the database.

const { body, validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

exports.registerRules = [
  body('username').trim().isLength({ min: 3, max: 30 }).escape()
    .withMessage('Username must be 3-30 characters'),
  body('email').trim().isEmail().normalizeEmail()
    .withMessage('A valid email is required'),
  body('password').isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['Guest', 'User', 'Administrator'])
    .withMessage('Invalid role')
];

exports.loginRules = [
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const {
  ISSUE_TYPES, SEVERITY_LEVELS, TICKET_TYPES, TEAMS, CLOUD_SERVICES, STATUS_VALUES, REGIONS
} = require('../shared-taxonomy');

exports.incidentRules = [
  body('title').trim().isLength({ min: 3, max: 200 }).escape()
    .withMessage('Title must be 3-200 characters'),
  body('description').trim().isLength({ min: 5, max: 2000 }).escape()
    .withMessage('Description must be 5-2000 characters'),
  body('ticketType').isIn(TICKET_TYPES).withMessage('Invalid ticket type'),
  body('issueType').isIn(ISSUE_TYPES).withMessage('Invalid issue type'),
  body('cloudProvider').isIn(Object.keys(CLOUD_SERVICES)).withMessage('Invalid cloud provider'),
  body('affectedService').custom((value, { req }) => {
    const provider = req.body.cloudProvider;
    const validServices = CLOUD_SERVICES[provider] || [];
    if (!validServices.includes(value)) {
      throw new Error(`'${value}' is not a valid service for ${provider}`);
    }
    return true;
  }),
  body('severity').isIn(SEVERITY_LEVELS).withMessage('Invalid severity'),
  body('status').optional().isIn(STATUS_VALUES),
  body('region').optional().isIn(REGIONS),
  body('assignedTeam').optional().isIn(TEAMS).withMessage('Invalid team'),
  body('costImpact').optional().isFloat({ min: 0 }).withMessage('Cost impact must be a positive number')
];