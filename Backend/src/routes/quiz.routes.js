const express = require('express');
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

const router = express.Router();

// GET /api/quizzes — get all quizzes
router.get('/', auth(), async (req, res) => {
  try {
    const quizzes = await Quiz.find({ $or: [{ creator: req.user.id }, { isPublished: true }] });
    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// GET /api/quizzes/:id — get quiz details
router.get('/:id', auth(['admin', 'instructor', 'student']), [
  param('id').isMongoId().withMessage('Invalid quiz ID'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    if (req.user.id !== quiz.creator.toString() && req.user.role !== 'admin') {
      quiz.questions.forEach(q => { q.correctOptions = undefined; });
    }

    res.json(quiz);
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/quizzes — create quiz
router.post('/', auth(['admin', 'instructor']), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  body('date').optional().isString(),
  body('timeLimitMinutes').isInt({ min: 0 }).withMessage('Time limit must be non-negative'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question required'),
  body('questions.*.text').notEmpty().withMessage('Question text is required'),
  body('questions.*.options').isArray({ min: 2 }).withMessage('At least two options required'),
  body('questions.*.options.*.text').notEmpty().withMessage('Option text is required'),
  body('questions.*.correctOptions').isArray({ min: 1 }).withMessage('At least one correct option required'),
  body('questions.*.points').isInt({ min: 1 }).withMessage('Points must be at least 1'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const quiz = new Quiz({ ...req.body, creator: req.user.id });
    await quiz.save();
    console.log('Quiz saved:', quiz);
    res.status(201).json(quiz);
  } catch (err) {
    console.error('Error saving quiz:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/quizzes/:id/publish — publish quiz
router.put('/:id/publish', auth(['admin', 'instructor']), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    if (quiz.creator.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
    quiz.isPublished = true;
    await quiz.save();
    console.log('Quiz published:', quiz);
    res.json(quiz);
  } catch (err) {
    console.error('Error publishing quiz:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/quizzes/:id/attempts — start new attempt
router.post('/:id/attempts', auth(['student']), [
  param('id').isMongoId().withMessage('Invalid quiz ID'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.isPublished) return res.status(404).json({ msg: 'Quiz not found or not published' });

    const existingAttempt = await Attempt.findOne({ user: req.user.id, quiz: quiz._id });
    if (existingAttempt) return res.status(400).json({ msg: 'Already attempted this quiz' });

    const attempt = new Attempt({
      user: req.user.id,
      quiz: quiz._id,
      startedAt: new Date(),
      answers: quiz.questions.map((q, idx) => ({ questionIndex: idx, selectedOptions: [] })),
    });
    await attempt.save();

    res.json({ attemptId: attempt._id, startedAt: attempt.startedAt });
  } catch (err) {
    console.error('Error starting attempt:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/quizzes/:id/leaderboard — top scores
router.get('/:id/leaderboard', [
  param('id').isMongoId().withMessage('Invalid quiz ID'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const attempts = await Attempt.find({ quiz: req.params.id })
      .sort({ totalScore: -1 })
      .limit(10)
      .populate('user', 'name');

    res.json(attempts.map(a => ({ user: a.user.name, score: a.totalScore })));
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;