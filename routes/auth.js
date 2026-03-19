const express = require('express');
const router  = express.Router();
const { login, register, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');


router.post('/login',    login);
router.post('/register', register);
router.get('/me',        protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

router.delete('/:id', protect, authorize('ministry_admin'), deleteTeacher);

// Only ministry_admin can update admission status
router.patch('/:ref/status', protect, authorize('ministry_admin'), updateStatus);

module.exports = router;