// /home/shantanu/Quiz Application/Backend/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['https://quiz-shantanu.netlify.app', 'http://localhost:5173', 'https://quiz-1-dnu2.onrender.com', 'https://quiz-application-shantanu.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/attempts', require('./routes/attempt.routes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));