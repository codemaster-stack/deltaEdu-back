const express = require('express');
const router  = express.Router();
const { getAdmissions, getAdmissionByRef, createAdmission, updateStatus } = require('../controllers/admissionController');
const { protect } = require('../middleware/auth');

router.get('/',            protect, getAdmissions);
router.get('/:ref',        getAdmissionByRef);      // public — for tracking
router.post('/',           createAdmission);         // public — for applying
router.patch('/:ref/status', protect, updateStatus);

module.exports = router;