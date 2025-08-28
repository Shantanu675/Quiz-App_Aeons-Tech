// /home/shantanu/Quiz Application/Backend/src/routes/attempt.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify token and user
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// POST /api/quizzes/:quizId/attempts — Start a new attempt
router.post('/:quizId/attempts', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    if (req.user.role !== 'instructor' && quiz.createdBy.toString() !== req.user.id) {
      const existingAttempt = await Attempt.findOne({ quiz: req.params.quizId, user: req.user.id });
      if (existingAttempt) return res.status(400).json({ msg: 'You have already attempted this quiz' });
    }

    const attempt = new Attempt({
      user: req.user.id,
      quiz: req.params.quizId,
      answers: [],
      totalScore: 0,
    });

    await attempt.save();
    res.json({ attemptId: attempt.id });
  } catch (err) {
    console.error('Error starting attempt:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/attempts/:attemptId/submit — Submit attempt
router.post('/:attemptId/submit', auth, async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ msg: 'Attempt not found' });

    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    let totalScore = 0;
    const answers = req.body.answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      const isCorrect = answer.selectedOptions.sort().join(',') === question.correctOptions.sort().join(',');
      const earnedPoints = isCorrect ? question.points : 0;
      totalScore += earnedPoints;
      return { ...answer, earnedPoints };
    });

    attempt.answers = answers;
    attempt.totalScore = totalScore;
    await attempt.save();

    res.json({ totalScore, answers });
  } catch (err) {
    console.error('Error submitting attempt:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/quizzes/:quizId/attempts — Get all attempts for a quiz (instructor only)
router.get('/:quizId/attempts', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') return res.status(403).json({ msg: 'Access denied' });

    const attempts = await Attempt.find({ quiz: req.params.quizId }).populate('user', 'email');
    res.json(attempts);
  } catch (err) {
    console.error('Error fetching attempts:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;