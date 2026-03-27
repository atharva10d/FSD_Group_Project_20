import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, LogIn, User as UserIcon, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="glass w-full py-4 px-8 sticky top-0 z-50 flex justify-between items-center shadow-lg">
      <Link to="/" className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
        <Plane className="w-8 h-8 rotate-45" />
        <span className="text-2xl font-bold tracking-wider">AeroServe</span>
      </Link>

      <div className="flex items-center space-x-6">
        <Link to="/" className="text-slate-300 hover:text-white transition-colors">Home</Link>
        {token ? (
          <>
            <Link to="/dashboard" className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors">
              <UserIcon className="w-4 h-4" />
              <span>{userRole === 'admin' ? 'Admin Panel' : 'Dashboard'}</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-medium shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
