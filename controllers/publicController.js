const School = require('../models/School');
const News   = require('../models/News');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

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

    const { Resend } = require('resend');
    const resend     = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Delta State MoE Contact <contact@angeluni-salltd.com>',
      to:      process.env.EMAIL_USER || 'admin@deltaedu.gov.ng',
      replyTo: email,
      subject: `Contact Form: ${subject || 'New Message'} — from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
          <h2 style="color:#0C1B2E">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:600;color:#6B8FAF;width:100px">Name</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:600;color:#6B8FAF">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:600;color:#6B8FAF">Subject</td><td style="padding:8px">${subject || '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:600;color:#6B8FAF;vertical-align:top">Message</td><td style="padding:8px">${message.replace(/\n/g, '<br>')}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="color:#999;font-size:12px">Delta State Ministry of Education — Contact Form</p>
        </div>
      `,
    });

    res.json({ message: 'Your message has been received. We will get back to you shortly.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/public/stats
const getStats = async (req, res, next) => {
  try {
    const [schools, teachers, students] = await Promise.all([
      School.countDocuments({ status: 'active' }),
      Teacher.countDocuments({ status: 'active' }),
      Student.countDocuments({ status: 'active' }),
    ]);

    res.json({ schools, teachers, students, lgas: 25 });
  } catch (err) {
    next(err);
  }
};


// POST /api/v1/public/news — admin creates news (protected)
const createNews = async (req, res, next) => {
  try {
    const { title, excerpt, content, category, audience, icon, colour, featured } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required.' });
    }

    const item = await News.create({
      title,
      excerpt:  excerpt  || '',
      content:  content  || '',
      category,
      audience: audience || 'all',
      icon:     icon     || '📢',
      colour:   colour   || 'gold',
      featured: featured || false,
      publishedBy: req.user.id,
    });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/public/news/:id — admin deletes news (protected)
const deleteNews = async (req, res, next) => {
  try {
    const item = await News.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'News item not found.' });
    res.json({ message: 'News item deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSchools, getSchool, getNews, getNewsItem, contactForm, getStats, createNews, deleteNews };