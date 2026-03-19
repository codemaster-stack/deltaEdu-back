const express = require('express');
const router  = express.Router();
const { getResults, checkResult, createResult, uploadResults } = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

router.get('/',           protect, getResults);
router.post('/check',     checkResult);          // public — students check results
router.post('/',          protect, createResult);
router.post('/upload',    protect, uploadResults);

module.exports = router;