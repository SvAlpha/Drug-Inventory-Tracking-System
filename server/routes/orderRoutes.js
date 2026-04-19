const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { orderAssignmentRules, orderStatusRules, handleValidationErrors } = require('../middleware/validators');
const { getOrders, assignVendor, updateOrderStatus } = require('../controllers/orderController');

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders
 *     security:
 *       - bearerAuth: []
 */
router.get('/',                protect, getOrders);

/**
 * @swagger
 * /api/orders/{id}/assign:
 *   put:
 *     summary: Assign vendor to order
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/assign',      protect, authorize('hq_admin'), orderAssignmentRules(), handleValidationErrors, assignVendor);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/status',      protect, authorize('vendor'), orderStatusRules(), handleValidationErrors, updateOrderStatus);

module.exports = router;
