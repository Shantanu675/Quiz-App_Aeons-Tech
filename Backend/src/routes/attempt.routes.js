const express = require('express');
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

const router = express.Router();

// POST /api/quizzes/:id/attempts — start a new attempt
router.post('/:id/attempts', auth(), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    if (!quiz.isPublished) return res.status(403).json({ msg: 'Quiz is not published' });

    const attempt = new Attempt({
      user: req.user.id,
      quiz: req.params.id,
      answers: [],
      startedAt: new Date(),
    });
    await attempt.save();
    console.log('Attempt created:', attempt);
    res.json({ attemptId: attempt._id });
  } catch (err) {
    console.error('Error starting attempt:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/attempts/:attemptId/submit — submit attempt
router.post('/:attemptId/submit', auth(), async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ msg: 'Attempt not found' });
    if (attempt.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    attempt.answers = req.body.answers || [];
    console.log('Received answers:', JSON.stringify(req.body.answers, null, 2));
    let totalScore = 0;
    attempt.answers.forEach((ans, idx) => {
      const question = quiz.questions[ans.questionIndex];
      if (!question) {
        console.log(`Question ${ans.questionIndex} not found`);
        return;
      }
      const isCorrect = JSON.stringify(ans.selectedOptions.sort()) === JSON.stringify(question.correctOptions.sort());
      console.log(`Question ${ans.questionIndex + 1}: Selected=${ans.selectedOptions}, Correct=${question.correctOptions}, IsCorrect=${isCorrect}, Points=${question.points}`);
      totalScore += isCorrect ? question.points : 0;
      ans.earnedPoints = isCorrect ? question.points : 0; // Set earnedPoints per answer
    });
    attempt.totalScore = totalScore;
    attempt.submittedAt = new Date();
    await attempt.save();
    console.log('Attempt submitted:', attempt);
    res.json({ attemptId: attempt._id, totalScore });
  } catch (err) {
    console.error('Error submitting attempt:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/attempts/:attemptId — get attempt details
router.get('/:attemptId', auth(), async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId).populate('quiz');
    if (!attempt) return res.status(404).json({ msg: 'Attempt not found' });
    if (attempt.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });
    console.log('Attempt fetched:', attempt);
    res.json(attempt);
  } catch (err) {
    console.error('Error fetching attempt:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;