import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgetPassword from './pages/ForgetPassword.jsx';
import OTP from './pages/OTP.jsx';
import ResetPassword from './pages/ResetPassword.jsx'
import Dashboard from './pages/Dashboard.jsx';
import CreateQuiz from './pages/CreateQuiz.jsx';
import QuizAttempt from './pages/QuizAttempt.jsx';
import Results from './pages/Results.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import Navbar from './components/Navbar.jsx';

function App() {
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <Navbar />
      <div className="w-full">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgetPassword /></PublicRoute>} />
          <Route path="/otp" element={<PublicRoute><OTP /></PublicRoute>} />
          <Route path="/reset_password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Private Routes */}
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
