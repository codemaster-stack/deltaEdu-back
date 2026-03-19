const express = require('express');
const router  = express.Router();
const { getOverview } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, getOverview);

module.exports = router;