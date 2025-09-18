const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ text: { type: String, required: true } }],
  correctOptions: [{ type: Number, required: true }], // array of indices (0-based)
  points: { type: Number, default: 1 },
  image: { type: String } // optional URL
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String },
  questions: [questionSchema],
  timeLimitMinutes: { type: Number, default: 0 },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);