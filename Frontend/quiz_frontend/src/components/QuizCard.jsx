import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function QuizCard({ quiz }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-orange-100 text-white p-5 rounded-2xl shadow-lg hover:shadow-2xl transform transition-all duration-300"
    >
      <h3 className="text-orange-500 text-3xl font-extrabold mb-2 ">{quiz.title}</h3>
      <p className="text-black text-lg opacity-90 mb-1">{quiz.description}</p>
      <p className="text-blue-900 text-lg opacity-90 mb-1">{quiz.date}</p>
      <p className="text-amber-900 text-lg opacity-80 mb-4">⏱ Time: {quiz.timeLimitMinutes} min</p>
      <Link
        to={`/quiz/${quiz._id}/attempt`}
        className="inline-block bg-white text-indigo-600 font-semibold px-4 py-2 rounded-xl shadow-md hover:bg-gray-100 transition-all duration-300"
      >
        🚀 Attempt Quiz
      </Link>
    </motion.div>
  );
}
