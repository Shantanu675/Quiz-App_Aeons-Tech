import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios.js';
import Question from '../components/Question.jsx';
import Timer from '../components/Timer.jsx';
import SplitText from '../components/SplitText.jsx';

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
  // if (error) return <div className="text-red-500">{error}</div>;
  if (error) {
    return (
      <div className="flex justify-end mt-8">
        <div className="relative w-full max-w-md bg-white border text-black py-1 rounded-xl shadow-lg">
          {/* Animated error text */}
          <p className="text-center text-xl font">
            <SplitText
              text={error + " !"}
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </p>
  
          {/* Red line animation at bottom */}
          <div className="absolute bottom-0 left-0 h-1 bg-red-600 animate-moveLine"></div>
        </div>
  
        {/* Keyframes for the moving line */}
        <style>{`
          @keyframes moveLine {
            from { width: 0%; }
            to { width: 100%; }
          }
          .animate-moveLine {
            animation: moveLine 3s linear forwards;
          }
        `}</style>
      </div>
    );
  }

  else {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
      <p className="mb-4">{quiz.description}</p>
      {quiz.timeLimitMinutes > 0 && (
        <Timer seconds={quiz.timeLimitMinutes * 60} onExpire={handleTimeUp} className="pb-4 mb-4"/>
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
        className="px-6 py-3 text-lg font-semibold rounded-full shadow-md 
                 text-white bg-gradient-to-r from-purple-500 to-blue-500 
                 transition-all duration-300 ease-in-out hover:from-purple-600 hover:to-blue-600 
                 focus:outline-none focus:ring-4 focus:ring-purple-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!attemptId}
      >
        Submit Quiz
      </button>
    </div>
  );
}
}