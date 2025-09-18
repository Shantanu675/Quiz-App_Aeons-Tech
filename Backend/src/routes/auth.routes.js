const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

let otpStore = {}; // 👈 declared globally, not inside routes

const transporter = nodemailer.createTransport({
  service: 'gmail', // or SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/auth/register
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
    
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log(req.body);
  
  const { email, password } = req.body;
  try {
    console.log('Login attempt:', { email });
    const user = await User.findOne({ email });
    
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    console.log("Received forgot-password request:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ msg: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 min
    otpStore[email] = { otp, expiry };

    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({ msg: 'Failed to send OTP email' });
      }
      console.log("OTP email sent:", info.response);
      res.json({ msg: 'OTP sent to your email' });
    });

  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpData = otpStore[email];
    if (!otpData) return res.status(400).json({ msg: 'OTP not requested' });

    if (otpData.expiry < Date.now()) {
      delete otpStore[email];
      return res.status(400).json({ msg: 'OTP expired' });
    }

    if (otpData.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });

    res.json({ msg: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ========================
// 5️⃣ Reset Password Route
// ========================
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    // const otpData = otpStore[email];
    // if (!otpData) return res.status(400).json({ msg: 'OTP not requested' });

    // if (otpData.expiry < Date.now()) {
    //   delete otpStore[email];
    //   return res.status(400).json({ msg: 'OTP expired' });
    // }

    // if (otpData.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    delete otpStore[email];

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;