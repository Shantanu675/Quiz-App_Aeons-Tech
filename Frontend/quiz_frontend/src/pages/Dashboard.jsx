import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios.js';
import QuizCard from '../components/QuizCard.jsx';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quizzes', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        console.log('Fetched quizzes:', response.data);
        setQuizzes(response.data);
      } catch (err) {
        const errorMsg = err.response?.data?.msg || 'Failed to fetch quizzes';
        console.error('Error:', errorMsg);
        setError(errorMsg);
      }
    };
    if (user) fetchQuizzes();
  }, [user]);

  const handlePublish = async (quizId) => {
    try {
      await api.put(`/quizzes/${quizId}/publish`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setQuizzes(quizzes.map(q => q._id === quizId ? { ...q, isPublished: true } : q));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to publish quiz');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {quizzes.length === 0 ? (
        <p>No quizzes available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="border p-4 rounded">
              <QuizCard quiz={quiz} />
              {user?.role === 'instructor' && !quiz.isPublished && (
                <button
                  onClick={() => handlePublish(quiz._id)}
                  className="mt-2 bg-blue-500 text-white p-2 rounded"
                >
                  Publish
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}