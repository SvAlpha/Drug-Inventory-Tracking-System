const { body, validationResult } = require('express-validator');
const { AppError, asyncHandler } = require('./errorHandler');

// Validation middleware handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validation rules
const authValidationRules = () => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['hq_admin', 'hospital_staff', 'vendor'])
    .withMessage('Invalid role. Must be hq_admin, hospital_staff, or vendor')
];

// Stock validation rules
const stockValidationRules = () => [
  body('drugName')
    .trim()
    .notEmpty()
    .withMessage('Drug name is required')
    .isLength({ max: 100 })
    .withMessage('Drug name must be less than 100 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('currentLevel')
    .isInt({ min: 0 })
    .withMessage('Current level must be a positive number'),
  body('criticalLimit')
    .isInt({ min: 0 })
    .withMessage('Critical limit must be a positive number'),
  body('unit')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Unit must be less than 20 characters')
];

// Consumption validation rules
const consumptionValidationRules = () => [
  body('drugId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid drug ID is required'),
  body('quantityConsumed')
    .isInt({ min: 1 })
    .withMessage('Quantity consumed must be at least 1')
];

// Order assignment validation rules
const orderAssignmentRules = () => [
  body('vendorId')
    .notEmpty()
    .isMongoId()
    .withMessage('Valid vendor ID is required')
];

// Order status validation rules
const orderStatusRules = () => [
  body('status')
    .trim()
    .isIn(['Confirmed', 'In-Transit', 'Out-for-Delivery', 'Delivered'])
    .withMessage('Invalid status'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must be less than 500 characters')
];

module.exports = {
  handleValidationErrors,
  authValidationRules,
  stockValidationRules,
  consumptionValidationRules,
  orderAssignmentRules,
  orderStatusRules,
  asyncHandler
};
