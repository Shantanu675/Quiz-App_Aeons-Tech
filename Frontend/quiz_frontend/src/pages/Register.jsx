import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext.jsx';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register: authRegister } = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      await authRegister(data.name, data.email, data.password, data.role);
    } catch (err) {
      setError(err);
      console.log(error);
    }
  };

  return (
    <div className="p-4 flex items-center justify-center min-h-screen bg-gradient-to-br">
      <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
        {/* Title */}
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Join us by creating your account
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all outline-none"
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all outline-none"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block mb-2 font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' },
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all outline-none pr-12"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute top-11 right-3 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Role</label>
            <select
              {...register('role')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all outline-none"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full p-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
          >
            Register
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
