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
    <nav className="bg-white border-b border-slate-200 w-full py-4 px-8 sticky top-0 z-50 flex justify-between items-center shadow-sm">
      <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
        <Plane className="w-8 h-8 rotate-45" />
        <span className="text-2xl font-bold tracking-wider">AeroServe</span>
      </Link>

      <div className="flex items-center space-x-2">
        <Link to="/" className="text-slate-600 font-medium px-4 py-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-all">Home</Link>
        {token ? (
          <>
            <Link to="/dashboard" className="text-slate-600 font-medium px-4 py-2 rounded-lg hover:text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-all">
              <UserIcon className="w-4 h-4" />
              <span>{userRole === 'admin' ? 'Admin Panel' : 'Dashboard'}</span>
            </Link>
            <button onClick={handleLogout} className="text-slate-600 font-medium px-4 py-2 rounded-lg hover:text-red-600 hover:bg-red-50 flex items-center gap-2 transition-all">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm hover:shadow-md ml-4 transition-all">
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
