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
    <div className="flex-1 flex items-center justify-center p-4 w-full h-[calc(100vh-64px)] overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden bg-slate-800/80 backdrop-blur-3xl border border-slate-700/50"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && <p className="text-red-400 text-sm text-center mb-4 bg-red-500/10 p-2 rounded">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          {isRegister && (
            <input 
              type="text" 
              placeholder="Full Name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
          />

          {isRegister && (
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all"
            >
              <option value="passenger">Passenger</option>
              <option value="agent">Travel Agent</option>
            </select>
          )}

          <button 
            type="submit" 
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 transition-all"
          >
            {isRegister ? <><UserPlus className="w-5 h-5"/> Sign Up</> : <><LogIn className="w-5 h-5"/> Sign In</>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400 font-medium relative z-10">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button 
            type="button" 
            onClick={() => { setIsRegister(!isRegister); navigate(isRegister ? '/login' : '/register'); }} 
            className="ml-2 text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>

        {/* Decorative circle */}
        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 rounded-full bg-blue-500/20 blur-[100px] z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-64 h-64 rounded-full bg-indigo-500/20 blur-[100px] z-0 pointer-events-none"></div>
      </motion.div>
    </div>
  );
};

export default Login;
