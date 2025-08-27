import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateQuiz from './pages/CreateQuiz.jsx';
import QuizAttempt from './pages/QuizAttempt.jsx';
import Results from './pages/Results.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create-quiz" element={<PrivateRoute><CreateQuiz /></PrivateRoute>} />
          <Route path="/quiz/:id/attempt" element={<PrivateRoute><QuizAttempt /></PrivateRoute>} />
          <Route path="/attempt/:attemptId/results" element={<PrivateRoute><Results /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;