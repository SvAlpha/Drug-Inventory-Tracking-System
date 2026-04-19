
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAuditLogs } = require('../controllers/auditController');

router.get('/', protect, authorize('hq_admin'), getAuditLogs);

module.exports = router;