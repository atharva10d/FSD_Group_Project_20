import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ isRegisterMode = false }) => {
  const [isRegister, setIsRegister] = useState(isRegisterMode);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'passenger' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
     setIsRegister(isRegisterMode);
  }, [isRegisterMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? 'register' : 'login';
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('name', res.data.user.name);
      localStorage.setItem('email', res.data.user.email);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md border border-slate-200 w-full max-w-md relative overflow-hidden transition-shadow"
      >
        <h2 className="text-3xl font-extrabold mb-8 text-center text-slate-900 tracking-tight">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          {isRegister && (
            <input 
              type="text" 
              placeholder="Full Name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-500"
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-500"
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-500"
          />

          {isRegister && (
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            >
              <option value="passenger">Passenger</option>
              <option value="agent">Travel Agent</option>
            </select>
          )}

          <button 
            type="submit" 
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all"
          >
            {isRegister ? <><UserPlus className="w-5 h-5"/> Sign Up</> : <><LogIn className="w-5 h-5"/> Sign In</>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium relative z-10">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button 
            type="button" 
            onClick={() => { setIsRegister(!isRegister); navigate(isRegister ? '/login' : '/register'); }} 
            className="ml-2 text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4"
          >
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>

      </motion.div>
    </div>
  );
};

export default Login;
