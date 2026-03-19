const express = require('express');
const router  = express.Router();
const { getAdmissions, getAdmissionByRef, createAdmission, updateStatus } = require('../controllers/admissionController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',              protect, authorize('ministry_admin', 'staff'), getAdmissions);
router.get('/:ref',          getAdmissionByRef);
router.post('/',             createAdmission);
router.patch('/:ref/status', protect, authorize('ministry_admin'), updateStatus);

module.exports = router;