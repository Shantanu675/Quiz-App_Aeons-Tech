import { useState, useRef, useContext } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext"; // adjust path

export default function OtpInput({ length = 6, onChange }) {
  const [otp, setOtp] = useState(Array(length).fill(""));
  const [error, setError] = useState('');
  const { verify_otp } = useContext(AuthContext);
  const inputs = useRef([]);
  const navigate = useNavigate();

  // get email passed from forgot_password
  const location = useLocation();
  const email = location.state?.email;

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // Only numbers allowed
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onChange && onChange(newOtp.join(""));

    if (value && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join(""); // join digits into one string

    try {
      await verify_otp(email, enteredOtp);
      navigate("/reset_password", { state: { email } });
    } catch (err) {
      const errorMsg = err?.response?.data?.msg || "Wrong OTP";
      setError(errorMsg);
      console.log(err);
    }
  };

  return (
    <>
      <div className="p-4 flex items-center justify-center min-h-screen bg-gradient-to-br">
        <div className="w-full max-w-lg bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
            {/* Title */}
            <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-2">
                Enter OTP
            </h2>

            <p className="text-center text-gray-600 mb-8">
                Enter received OTP in Email
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP */}
              <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                  <input
                  key={index}
                  ref={(el) => (inputs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              ))}
              </div>

              {/* Submit */}
              <button
                  type="submit"
                  className="w-full p-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all mt-8"
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
    </>
  );
}
