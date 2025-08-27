import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios.js';
import Question from '../components/Question.jsx';
import Timer from '../components/Timer.jsx';
import Results from './Results.jsx';

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizAndStartAttempt = async () => {
      try {
        console.log('Fetching quiz with ID:', id, 'User:', user);
        const quizRes = await api.get(`/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        console.log('Quiz fetched:', quizRes.data);
        setQuiz(quizRes.data);

        const attemptRes = await api.post(`/quizzes/${id}/attempts`, {}, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        console.log('Attempt started:', attemptRes.data);
        setAttemptId(attemptRes.data.attemptId);
        setAnswers(quizRes.data.questions.map((_, idx) => ({
          questionIndex: idx,
          selectedOptions: []
        })));
      } catch (err) {
        const errorMsg = err.response?.data?.msg || 'Failed to load quiz';
        console.error('Error fetching quiz/starting attempt:', errorMsg);
        setError(errorMsg);
      }
    };
    if (user) fetchQuizAndStartAttempt();
  }, [id, user]);

  const handleAnswer = (questionIndex, selectedOptions) => {
    console.log('Answer updated:', { questionIndex, selectedOptions });
    setAnswers(prev => prev.map(ans =>
      ans.questionIndex === questionIndex ? { ...ans, selectedOptions } : ans
    ));
  };

  const handleSubmit = async () => {
    console.log('Submit clicked:', { attemptId, answers });
    if (!attemptId) {
      setError('No attempt ID available');
      return;
    }
    try {
      const res = await api.post(`/attempts/${attemptId}/submit`, { answers }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      console.log('Submission response:', res.data);
      navigate(`/attempt/${attemptId}/results`);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to submit quiz';
      console.error('Error submitting quiz:', errorMsg);
      setError(errorMsg);
    }
  };

  const handleTimeUp = () => {
    console.log('Time up, submitting quiz');
    handleSubmit();
  };

  if (!quiz) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  else {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
      <p className="mb-4">{quiz.description}</p>
      {quiz.timeLimitMinutes > 0 && (
        <Timer seconds={quiz.timeLimitMinutes * 60} onExpire={handleTimeUp} />
      )}
      {quiz.questions.map((q, idx) => (
        <Question
          key={idx}
          question={q}
          index={idx}
          onAnswer={handleAnswer}
          selectedOptions={answers[idx]?.selectedOptions || []}
        />
      ))}
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white p-2 rounded"
        disabled={!attemptId}
      >
        Submit Quiz
      </button>
    </div>
  );
}
}