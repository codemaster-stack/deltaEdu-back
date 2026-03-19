const express = require('express');
const router  = express.Router();
const { login, register, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');


router.post('/login',    login);
router.post('/register', register);
router.get('/me',        protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

module.exports = router;