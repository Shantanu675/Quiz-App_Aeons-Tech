import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Brand */}
        <Link
          to="/"
          className="text-white text-3xl font-extrabold tracking-wide hover:opacity-90 transition-opacity"
        >
          QuizQuest
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to="/create-quiz"
                className="text-white font-bold px-3 py-2 rounded-md hover:bg-blue-500 transition-colors text-base max-[400px]:text-xs m-1"
              >
                Create Quiz
              </Link>
              <button
                onClick={logout}
                className="text-white font-bold px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 transition-colors text-base max-[400px]:text-xs"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white font-bold px-3 py-2 rounded-md hover:bg-blue-500 transition-colors text-base max-[400px]:text-xs"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white font-bold px-3 py-2 rounded-md bg-green-500 hover:bg-green-600 transition-colors text-base max-[400px]:text-xs"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
