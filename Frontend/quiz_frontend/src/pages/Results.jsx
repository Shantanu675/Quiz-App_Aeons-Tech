import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios.js";

export default function Results() {
  const { attemptId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        console.log("Fetching result for attempt:", attemptId, "User:", user);
        const res = await api.get(`/attempts/${attemptId}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        console.log("Result fetched:", JSON.stringify(res.data, null, 2));
        setResult(res.data);
      } catch (err) {
        const errorMsg =
          err.response?.data?.msg ||
          err.message ||
          "Failed to load results";
        console.error(
          "Error fetching result:",
          errorMsg,
          "Status:",
          err.response?.status
        );
        setError(errorMsg);
      }
    };
    if (user) fetchResult();
    else setError("User not authenticated");
  }, [attemptId, user]);

  if (error)
    return (
      <div className="text-center text-red-600 font-semibold text-lg mt-6">
        {error}
      </div>
    );
  if (!result || !result.quiz)
    return (
      <div className="text-center text-gray-600 font-medium text-lg mt-6">
        Loading...
      </div>
    );

  const totalPoints = result.quiz.questions.reduce(
    (sum, q) => sum + q.points,
    0
  );

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-lg mt-8 border border-gray-200">
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Quiz Results
        </h2>
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-gray-700">
            <span className="font-semibold">Quiz:</span> {result.quiz.title}
          </p>
          <p className="text-xl font-bold text-blue-600 mt-2">
            Score: {result.totalScore || 0} / {totalPoints}
          </p>
        </div>

        {/* Answers Section */}
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          Your Answers
        </h3>
        {result.quiz.questions.map((q, idx) => {
          const userAnswer = result.answers[idx]?.selectedOptions || [];
          const correctAnswer = q.correctOptions || [];
          const isCorrect =
            JSON.stringify([...userAnswer].sort()) ===
            JSON.stringify([...correctAnswer].sort());

          return (
            <div
              key={idx}
              className={`mb-5 p-5 rounded-xl shadow-sm border transition-all duration-300 ${
                isCorrect
                  ? "bg-green-100 border-green-600"
                  : "bg-red-100 border-red-600"
              }`}
            >
              <p className="font-semibold text-lg mb-2 text-gray-900">
                Question {idx + 1}: {q.text}
              </p>
              <p className="text-gray-800">
                <span className="font-semibold">Your Answer:</span>{" "}
                {userAnswer.length > 0
                  ? userAnswer
                      .map((i) => q.options[i]?.text || "Invalid")
                      .join(", ")
                  : "None"}
              </p>
              <p className="text-gray-800">
                <span className="font-semibold">Correct Answer:</span>{" "}
                {correctAnswer
                  .map((i) => q.options[i]?.text || "Invalid")
                  .join(", ")}
              </p>
              <p className="mt-1 font-medium text-gray-900">
                Points: {result.answers[idx]?.earnedPoints || 0} / {q.points}
              </p>
            </div>
          );
        })}

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 text-lg font-semibold rounded-full shadow-md 
                      text-white bg-gradient-to-r from-blue-500 to-purple-500 
                      hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
