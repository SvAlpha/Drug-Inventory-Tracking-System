const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { consumptionValidationRules, handleValidationErrors } = require('../middleware/validators');
const { logConsumption, getAllLogs, getMyLogs } = require('../controllers/consumeController');

/**
 * @swagger
 * /api/consume:
 *   post:
 *     summary: Log drug consumption
 *     security:
 *       - bearerAuth: []
 */
router.post('/',    protect, authorize('hospital_staff'), consumptionValidationRules(), handleValidationErrors, logConsumption);

/**
 * @swagger
 * /api/consume:
 *   get:
 *     summary: Get all consumption logs (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.get('/',     protect, authorize('hq_admin'), getAllLogs);

/**
 * @swagger
 * /api/consume/my:
 *   get:
 *     summary: Get my consumption logs (hospital staff)
 *     security:
 *       - bearerAuth: []
 */
router.get('/my',   protect, authorize('hospital_staff'), getMyLogs);

module.exports = router;
