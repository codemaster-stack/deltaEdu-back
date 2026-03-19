const School = require('../models/School');
const News   = require('../models/News');

// GET /api/v1/public/schools
const getSchools = async (req, res, next) => {
  try {
    const { type, lga, search, status } = req.query;

    const filter = {};
    if (type)   filter.type   = type;
    if (lga)    filter.lga    = lga;
    if (status) filter.status = status;
    if (search) filter.name   = { $regex: search, $options: 'i' };

    const schools = await School.find(filter).sort({ name: 1 });

    res.json({ schools });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/public/schools/:id
const getSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }
    res.json({ school });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/public/news
const getNews = async (req, res, next) => {
  try {
    const { category, limit } = req.query;

    const filter = {};
    if (category && category !== 'All') filter.category = category;

    const items = await News.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 50);

    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/public/news/:id
const getNewsItem = async (req, res, next) => {
  try {
    const item = await News.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'News item not found' });
    }
    res.json({ item });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/public/contact
const contactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required.' });
    }

    // TODO: send email notification when email service is configured
    // For now just return success
    res.json({ message: 'Your message has been received. We will get back to you shortly.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSchools, getSchool, getNews, getNewsItem, contactForm };