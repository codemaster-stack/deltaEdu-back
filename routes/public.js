const express = require('express');
const router  = express.Router();
const {
  getSchools, getSchool,
  getNews, getNewsItem,
  contactForm, getStats,
  createNews, deleteNews,
} = require('../controllers/publicController');
const { protect, authorize } = require('../middleware/auth');

router.get('/schools',     getSchools);
router.get('/schools/:id', getSchool);
router.get('/news',        getNews);
router.get('/news/:id',    getNewsItem);
router.get('/stats',       getStats);
router.post('/contact',    contactForm);
router.post('/news',       protect, authorize('ministry_admin', 'staff'), createNews);
router.delete('/news/:id', protect, authorize('ministry_admin'), deleteNews);

module.exports = router;