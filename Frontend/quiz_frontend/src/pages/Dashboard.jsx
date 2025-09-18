import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios.js';
import QuizCard from '../components/QuizCard.jsx';
import { motion } from 'framer-motion';

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
    <div className= "w-full p-6 bg-gradient-to-b from-purple-100 via-pink-100 to-yellow-100  min-h-screen">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-6 text-center text-purple-700 drop-shadow-md"
      >
        🎓 Available Quizzes
      </motion.h2>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {quizzes.length === 0 ? (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center text-lg text-gray-700"
        >
          No quizzes available.
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <motion.div 
              key={quiz._id}
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`mt-10 p-5 rounded-2xl shadow-lg bg-purple-200 hover:scale-105 hover:shadow-2xl transition-transform`}
            >
              <QuizCard quiz={quiz} />
              {user?.role === 'instructor' && !quiz.isPublished && (
                <button
                  onClick={() => handlePublish(quiz._id)}
                  className="mt-4 w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:shadow-lg hover:from-green-500 hover:to-green-700 transition"
                >
                  🚀 Publish
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
