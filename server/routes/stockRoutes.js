const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { stockValidationRules, handleValidationErrors } = require('../middleware/validators');
const {
  getAllStock,
  addStock,
  updateStock,
  deleteStock
} = require('../controllers/stockController');

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Get all drugs in stock
 *     security:
 *       - bearerAuth: []
 */
router.get('/',     protect, getAllStock);

/**
 * @swagger
 * /api/stock:
 *   post:
 *     summary: Add new drug to stock
 *     security:
 *       - bearerAuth: []
 */
router.post('/',    protect, authorize('hq_admin'), stockValidationRules(), handleValidationErrors, addStock);

/**
 * @swagger
 * /api/stock/{id}:
 *   put:
 *     summary: Update drug stock
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id',  protect, authorize('hq_admin'), stockValidationRules(), handleValidationErrors, updateStock);

/**
 * @swagger
 * /api/stock/{id}:
 *   delete:
 *     summary: Delete drug from stock
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', protect, authorize('hq_admin'), deleteStock);

module.exports = router;