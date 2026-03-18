const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const qs = require('qs');

const User = require('../models/User');     // adjust paths
const Teacher = require('../models/Teacher');
const Admission = require('../models/Admission');
const School = require('../models/School');
const News = require('../models/News');



const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email and include password
    const user = await User.findOne({ email: identifier }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated. Contact administrator.' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id:       user._id,
        name:     user.name,
        email:    user.email,
        role:     user.role,
        schoolId: user.schoolId,
      },
    });

  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/register (admin only — seed initial users)
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, schoolId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role, schoolId });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
};


// POST /api/v1/auth/forgot-password
// const forgotPassword = async (req, res, next) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: 'Please provide your email address.' });
//     }

//     const user = await User.findOne({ email });

    // Always return success even if email not found — security best practice
    // if (!user) {
    //   return res.json({ message: 'If this email exists, a reset link has been sent.' });
    // }

    // Generate reset token
    // const resetToken = crypto.randomBytes(32).toString('hex');
    // user.resetPasswordToken   = crypto.createHash('sha256').update(resetToken).digest('hex');
    // user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    // await user.save({ validateBeforeSave: false });

    // Reset URL
    // const resetUrl = `${process.env.CLIENT_URL}pages/reset-password/reset-password.html?token=${resetToken}`;

    // Send email
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });
    
//     await transporter.sendMail({
//       from: `"Delta State MoE" <${process.env.EMAIL_USER}>`,
//       to:   user.email,
//       subject: 'Password Reset — Delta State Education Portal',
//       html: `
//         <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
//           <h2 style="color:#0C1B2E">Reset Your Password</h2>
//           <p>Hello ${user.name},</p>
//           <p>You requested a password reset for your Delta State Education Portal account.</p>
//           <p>Click the button below to reset your password. This link expires in <strong>30 minutes</strong>.</p>
//           <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#C9922A;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
//             Reset Password
//           </a>
//           <p style="color:#999;font-size:13px">If you did not request this, please ignore this email. Your password will not change.</p>
//           <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
//           <p style="color:#999;font-size:12px">Delta State Ministry of Education &mdash; Digital Education Portal</p>
//         </div>
//       `,
//     });

//     res.json({ message: 'If this email exists, a reset link has been sent.' });

//   } catch (err) {
//     next(err);
//   }
// };


// ---------------- FORGOT PASSWORD ----------------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    // Find user in any collection
    let user = await User.findOne({ email }) ||
               await Teacher.findOne({ email }) ||
               await Admission.findOne({ email });

    if (!user) {
      // Always return success to avoid revealing accounts
      return res.status(200).json({ success: true, message: 'If this email exists, a reset link has been sent' });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Determine which collection the user belongs to
    let collection = 'users';
    if (user.role === 'teacher') collection = 'teachers';
    if (user.role === 'admission') collection = 'admissions';

    await mongoose.connection.collection(collection).updateOne(
      { _id: user._id },
      { $set: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 3600000) } } // 1 hour expiry
    );

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password.html?token=${token}`;

    // Send email via Zoho (can switch provider by updating this function)
    await sendResetEmail(user.email, resetLink);

    res.status(200).json({ success: true, message: 'If this email exists, a reset link has been sent' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

// ---------------- SEND EMAIL FUNCTION ----------------
async function sendResetEmail(toEmail, resetLink) {
  try {
    // Get Zoho access token
    const tokenResponse = await axios.post(
      'https://accounts.zoho.com/oauth/v2/token',
      qs.stringify({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get account ID
    const accountsRes = await axios.get('https://mail.zoho.com/api/accounts', {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });
    const accountId = accountsRes.data.data[0].accountId;

    // Send the reset email
    await axios.post(
      `https://mail.zoho.com/api/accounts/${accountId}/messages`,
      {
        fromAddress: process.env.ZOHO_EMAIL,
        toAddress: toEmail,
        subject: 'Password Reset — Delta State Education Portal',
        content: `<p>Hello, click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
      },
      { headers: { Authorization: `Zoho-oauthtoken ${accessToken}`, 'Content-Type': 'application/json' } }
    );

    console.log(`✅ Reset email sent to ${toEmail}`);
  } catch (err) {
    console.error('Error sending email via Zoho API:', err.response?.data || err.message);
  }
}

// ---------------- RESET PASSWORD ----------------
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password required' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const now = new Date();

    // Find user in all collections
    let teacherDoc = await mongoose.connection.collection('teachers').findOne({ resetToken: token, resetTokenExpiry: { $gt: now } });
    let userDoc = await mongoose.connection.collection('users').findOne({ resetToken: token, resetTokenExpiry: { $gt: now } });
    let admissionDoc = await mongoose.connection.collection('admissions').findOne({ resetToken: token, resetTokenExpiry: { $gt: now } });

    let collection = teacherDoc ? 'teachers' : userDoc ? 'users' : admissionDoc ? 'admissions' : null;
    let doc = teacherDoc || userDoc || admissionDoc;

    if (!doc) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password and clear token
    await mongoose.connection.collection(collection).updateOne(
      { _id: doc._id },
      { $set: { password: hashedPassword }, $unset: { resetToken: '', resetTokenExpiry: '' } }
    );

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

module.exports = { login, register, getMe, forgotPassword, resetPassword };