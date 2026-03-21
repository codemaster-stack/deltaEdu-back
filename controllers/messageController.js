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

    // Send email notification in background
    sendMessageEmail({ message, toUserId, audience: audience || 'individual', subject, body })
      .catch(err => console.error('Message email error:', err));

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


async function sendMessageEmail({ message, toUserId, audience, subject, body }) {
  const { Resend } = require('resend');
  const resend     = new Resend(process.env.RESEND_API_KEY);

  let recipients = [];

  if (audience === 'individual' && toUserId) {
    const user = await User.findById(toUserId).select('email name');
    if (user?.email) recipients.push({ email: user.email, name: user.name });

  } else if (audience === 'all') {
    const users = await User.find({ isActive: true }).select('email name');
    recipients  = users.map(u => ({ email: u.email, name: u.name }));

  } else if (audience === 'teachers' || audience === 'principals') {
    const users = await User.find({ role: 'staff', isActive: true }).select('email name');
    recipients  = users.map(u => ({ email: u.email, name: u.name }));
  }

  if (recipients.length === 0) return;

  const senderName = message.from?.name || 'Ministry Admin';

  await Promise.allSettled(recipients.map(r =>
    resend.emails.send({
      from:    'Delta State MoE <noreply@angeluni-salltd.com>',
      to:      r.email,
      subject: `[Portal Message] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0C1B2E;padding:20px;text-align:center">
            <h2 style="color:#C9922A;margin:0">Delta State Ministry of Education</h2>
            <p style="color:rgba(255,255,255,0.6);margin:4px 0 0">Internal Message</p>
          </div>
          <div style="padding:24px;background:#F4F1EB">
            <p style="color:#6B8FAF;font-size:13px;margin:0 0 8px">From: <strong style="color:#0C1B2E">${senderName}</strong></p>
            <h2 style="color:#0C1B2E;margin:0 0 16px">${subject}</h2>
            <div style="background:#fff;padding:16px;border-radius:8px;color:#2E4F72;line-height:1.8;white-space:pre-wrap">${body}</div>
            <a href="${process.env.CLIENT_URL}pages/ministry-dashboard/dashboard.html#messages"
              style="display:inline-block;margin-top:20px;padding:12px 24px;background:#C9922A;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
              View in Portal →
            </a>
          </div>
          <div style="padding:16px;text-align:center;background:#0C1B2E">
            <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0">
              Delta State Ministry of Education · Digital Education Portal
            </p>
          </div>
        </div>
      `,
    })
  ));
}

// POST /api/v1/messages/inbound — Resend webhook for incoming emails
const receiveInbound = async (req, res, next) => {
  try {
    const payload = req.body;

    // Resend sends email data in this format
    const from    = payload.from || '';
    const subject = payload.subject || '(No Subject)';
    const body    = payload.text || payload.html?.replace(/<[^>]*>/g, '') || '';
    const to      = payload.to || '';

    // Find admin user to receive the message
    const admin = await User.findOne({ role: 'ministry_admin' });
    if (!admin) return res.status(200).json({ received: true });

    // Save as inbound message
    await Message.create({
      from:     admin._id, // use admin as placeholder for external sender
      to:       [admin._id],
      subject:  `[External] ${subject}`,
      body:     `From: ${from}\n\n${body}`,
      audience: 'individual',
      externalFrom: from,
    });

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
};


module.exports = { getInbox, getSent, sendMessage, markRead, deleteMessage, getUsers, receiveInbound };