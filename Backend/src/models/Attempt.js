const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true }, // index in quiz.questions
  selectedOptions: [Number], // array of selected indices
  earnedPoints: { type: Number, default: 0 }
});

const attemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [answerSchema],
  totalScore: { type: Number, default: 0 },
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date },
  durationSeconds: { type: Number }
});

module.exports = mongoose.model('Attempt', attemptSchema);