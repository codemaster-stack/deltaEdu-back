const Message = require('../models/Message');
const User    = require('../models/User');

// GET /api/v1/messages/inbox
const getInbox = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role   = req.user.role;

    // Get messages sent to this user individually or broadcast to their role
    const audienceMap = {
      'staff':          ['all', 'teachers', 'principals'],
      'ministry_admin': ['all'],
      'student':        ['all', 'students'],
      'parent':         ['all', 'students'],
    };

    const audiences = audienceMap[role] || ['all'];

    const messages = await Message.find({
      $or: [
        { to: userId },
        { audience: { $in: audiences } },
      ],
    })
    .populate('from', 'name role')
    .sort({ createdAt: -1 })
    .limit(50);

    // Add isRead flag
    const result = messages.map(m => ({
      ...m.toObject(),
      isRead: m.readBy.includes(userId),
    }));

    res.json({ messages: result });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/messages/sent
const getSent = async (req, res, next) => {
  try {
    const messages = await Message.find({ from: req.user.id })
      .populate('to', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ messages });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/messages — send message
const sendMessage = async (req, res, next) => {
  try {
    const { subject, body, audience, toUserId } = req.body;

    if (!subject || !body) {
      return res.status(400).json({ message: 'Subject and body are required.' });
    }

    const message = await Message.create({
      from:     req.user.id,
      to:       toUserId ? [toUserId] : [],
      subject,
      body,
      audience: audience || 'individual',
    });

    await message.populate('from', 'name role');
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/messages/:id/read — mark as read
const markRead = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user.id } },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: 'Message not found.' });
    res.json({ message });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/messages/:id
const deleteMessage = async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/messages/users — get users to send to
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: true, _id: { $ne: req.user.id } })
      .select('name role email')
      .sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getInbox, getSent, sendMessage, markRead, deleteMessage, getUsers };