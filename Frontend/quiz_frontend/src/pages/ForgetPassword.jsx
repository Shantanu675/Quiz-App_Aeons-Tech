import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const { forgot_password } = useContext(AuthContext);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("reached");
      await forgot_password(email);
      navigate("/otp", { state: { email } });
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'User not found';
      setError(errorMsg);
      console.log(error); 
    }
  };

  return (
    <div className="p-4 flex items-center justify-center min-h-screen bg-gradient-to-br">
      <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
        {/* Title */}
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-2">
          Forget Password
        </h2>

        <div className="mb-4 text-sm text-yellow-700 bg-yellow-100 border border-yellow-200 p-3 rounded-lg">
          Forgotten your password? Enter your e-mail address below, and we'll send you an e-mail allowing you to reset it.
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all outline-none"
              placeholder="Enter your email"
              required
            />
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
