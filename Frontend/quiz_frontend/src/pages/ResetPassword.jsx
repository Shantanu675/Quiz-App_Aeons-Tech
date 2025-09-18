import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function ForgetPassword() {
  const { reset_password } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setnewPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // get email passed from forgot_password
  const location = useLocation();
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reset_password(email, newPassword);
      navigate("/", { state: { email } });
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Reset password failed';
      setError(errorMsg);
      console.log(error); 
    }
  };

  return (
    <div className="p-4 flex items-center justify-center min-h-screen bg-gradient-to-br">
      <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
        {/* Title */}
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-2">
          Reset Password
        </h2>

        <div className="mb-4 text-sm text-yellow-700 bg-yellow-100 border border-yellow-200 p-3 rounded-lg">
          Enter new password you want to set replacing old one.
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Password */}
          <div className="relative">
            <label className="block mb-2 font-medium text-gray-700">
              New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setnewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all outline-none pr-12"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="absolute top-11 right-3 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full p-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          >
            Continue
          </button>
        </form>

        {/* Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
