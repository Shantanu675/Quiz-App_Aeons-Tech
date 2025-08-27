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
      setUser({ token, id: decoded.id, role: decoded.role });
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

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};