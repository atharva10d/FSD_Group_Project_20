import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plane, LogIn, UserPlus, Globe, Shield, Clock } from 'lucide-react';
import MapAnimation from '../components/MapAnimation';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden relative bg-slate-900">
      
      {/* Full-Width Cinematic Map Background */}
      <div className="absolute inset-0 z-0">
        <MapAnimation />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40 pointer-events-none"></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/60 pointer-events-none"></div>

      {/* Main Content Layer */}
      <div className="relative z-20 flex-1 flex flex-col md:flex-row items-center justify-between w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-0 gap-10">
        
        {/* Left Side: Hero Text */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="flex-1 max-w-xl text-center md:text-left"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-sky-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Globe className="w-3.5 h-3.5" />
            Trusted by 50,000+ travelers worldwide
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Your Journey{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Starts Here
            </span>
          </h1>
          
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-10 max-w-md">
            Search, compare, and book flights in seconds. Experience seamless air travel booking with real-time availability and secure payments.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center border border-sky-500/30">
                <Plane className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">200+</p>
                <p className="text-slate-400 text-xs font-medium">Daily Flights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">100%</p>
                <p className="text-slate-400 text-xs font-medium">Secure Payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-none">24/7</p>
                <p className="text-slate-400 text-xs font-medium">Live Support</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Floating Premium Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm flex-shrink-0"
        >
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 p-8 rounded-2xl shadow-2xl shadow-black/20 flex flex-col items-center text-center">
            
            <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mb-5 border border-sky-200 shadow-sm">
              <Plane className="w-7 h-7 text-sky-600 rotate-45" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome Aboard
            </h2>
            
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Sign in to manage your bookings or create a new account to get started.
            </p>
            
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              
              <button 
                onClick={() => navigate('/register')}
                className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 w-full">
              <p className="text-xs text-slate-400 font-medium">
                Protected by 256-bit SSL encryption
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Home;
