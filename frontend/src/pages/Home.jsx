import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MapAnimation from '../components/MapAnimation';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-900">
      {/* Left Side: Map Animation */}
      <div className="w-full md:w-[60%] h-[50vh] md:h-auto md:flex-1 relative overflow-hidden bg-slate-900 border-b md:border-b-0 md:border-r border-slate-700/50">
        <MapAnimation />
        {/* Overlay gradient to blend nicely toward the UI card */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b md:bg-gradient-to-r from-transparent via-transparent to-slate-900/80 z-30"></div>
      </div>

      {/* Right Side: UI Card */}
      <div className="w-full md:w-[40%] flex-shrink-0 bg-slate-900 flex items-center justify-center p-8 relative overflow-hidden z-40">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-sm glass bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
            {/* Plane Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 mb-4 drop-shadow-md">
            Welcome Aboard
          </h1>
          
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            Book flights easily with Airline Reservation System
          </p>
          
          <div className="w-full flex flex-col gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25"
            >
              Login
            </button>
            
            <button 
              onClick={() => navigate('/register')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-600 hover:border-slate-500"
            >
              Register
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
