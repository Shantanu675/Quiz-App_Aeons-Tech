const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: '/home/shantanu/Quiz Application/Backend/.env' });

console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);

if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in .env file');
  process.exit(1);
}

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend-render-url.onrender.com', 'https://quiz-1-dnu2.onrender.com/', 'https://quiz-application-shantanu.netlify.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { connectTimeoutMS: 30000, serverSelectionTimeoutMS: 30000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/quizzes', require('./routes/quiz.routes'));
app.use('/api/attempts', require('./routes/attempt.routes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));