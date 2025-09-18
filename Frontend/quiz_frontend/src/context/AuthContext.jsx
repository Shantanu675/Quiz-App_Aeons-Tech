import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ token, id: decoded.id, role: decoded.role });
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.token;      
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser({ token, id: decoded.user.id, role: decoded.user.role });    
      navigate('/');
    } catch (err) {
      throw err.response?.data?.msg || 'Login failed';
    }
  };

  const register = async (name, email, password, role = 'student') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      
      const token = res.data.token;
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser({ token, id: decoded.id, role: decoded.role });
      navigate('/');
    } catch (err) {
      throw err.response?.data?.msg || 'Registration failed';
    }
  };

  const forgot_password = async (email) => {
    try {
      console.log(email);
      
      const res = await api.post('/auth/forgot-password', { email });
      console.log(res);
      
      const message = res.data.msg;
      console.log(message);
              
      navigate('/otp', { state: { email } });
    } catch (err) {
      throw err.response?.data?.msg || 'User Not Exist';
    }
  };

  const verify_otp = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      console.log(res.data);
      return res.data; // don't navigate here
    } catch (err) {
      throw err.response?.data?.msg || 'Wrong OTP';
    }
  };

  const reset_password = async (email, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { email, newPassword });
      return res.data;
    } catch (err) {
      throw err.response?.data?.msg || 'Reset password failed';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, forgot_password, verify_otp, reset_password, logout }}>
      {children}
    </AuthContext.Provider>
  );
};