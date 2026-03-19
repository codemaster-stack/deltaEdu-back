const express = require('express');
const router  = express.Router();
const {
  getSchools,
  getSchool,
  getNews,
  getNewsItem,
  contactForm,
} = require('../controllers/publicController');

router.get('/schools',     getSchools);
router.get('/schools/:id', getSchool);
router.get('/news',        getNews);
router.get('/news/:id',    getNewsItem);
router.post('/contact',    contactForm);

module.exports = router;
