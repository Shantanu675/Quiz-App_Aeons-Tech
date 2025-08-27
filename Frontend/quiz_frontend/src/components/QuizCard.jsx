import { Link } from 'react-router-dom';

export default function QuizCard({ quiz }) {
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="text-lg font-semibold">{quiz.title}</h3>
      <p className="text-gray-600">{quiz.description}</p>
      <p className="text-sm text-gray-500">Time: {quiz.timeLimitMinutes} min</p>
      <Link to={`/quiz/${quiz._id}/attempt`} className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded">
        Attempt Quiz
      </Link>
    </div>
  );
}