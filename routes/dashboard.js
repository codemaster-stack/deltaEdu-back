const express = require('express');
const router  = express.Router();
const { getOverview } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/overview', protect, authorize('ministry_admin', 'staff'), getOverview);

module.exports = router;