const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { authValidationRules, handleValidationErrors } = require('../middleware/validators');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [hq_admin, hospital_staff, vendor]
 */
router.post('/register', authValidationRules(), handleValidationErrors, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 */
router.post('/login', authValidationRules(), handleValidationErrors, login);

module.exports = router;
