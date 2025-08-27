import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios.js';

export default function Results() {
  const { attemptId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        console.log('Fetching result for attempt:', attemptId, 'User:', user);
        const res = await api.get(`/attempts/${attemptId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        console.log('Result fetched:', JSON.stringify(res.data, null, 2));
        setResult(res.data);
      } catch (err) {
        const errorMsg = err.response?.data?.msg || err.message || 'Failed to load results';
        console.error('Error fetching result:', errorMsg, 'Status:', err.response?.status);
        setError(errorMsg);
      }
    };
    if (user) fetchResult();
    else setError('User not authenticated');
  }, [attemptId, user]);

  if (error) return <div className="text-red-500">{error}</div>;
  if (!result || !result.quiz) return <div>Loading...</div>;

  const totalPoints = result.quiz.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
      <p className="mb-4">Quiz: {result.quiz.title}</p>
      <p className="mb-4">Score: {result.totalScore || 0} / {totalPoints}</p>
      <h3 className="text-lg font-semibold mb-2">Your Answers</h3>
      {result.quiz.questions.map((q, idx) => (
        <div key={idx} className="mb-4 border p-4 rounded">
          <p className="font-semibold">Question {idx + 1}: {q.text}</p>
          <p>Your Answer: {result.answers[idx]?.selectedOptions.map(i => q.options[i]?.text || 'Invalid').join(', ') || 'None'}</p>
          <p>Correct Answer: {q.correctOptions.map(i => q.options[i]?.text || 'Invalid').join(', ')}</p>
          <p>Points: {result.answers[idx]?.earnedPoints || 0} / {q.points}</p>
        </div>
      ))}
      <button
        onClick={() => navigate('/')}
        className="mt-4 bg-blue-500 text-white p-2 rounded"
      >
        Back to Dashboard
      </button>
    </div>
  );
}