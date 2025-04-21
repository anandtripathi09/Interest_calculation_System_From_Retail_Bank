import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg" 
            alt="Bank Logo" 
            className="h-8 w-8 object-cover rounded-full"
          />
          <span className="text-xl font-bold">AC's Bank</span>
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{user?.name}</span>
              </div>
              <Link 
                to={isAdmin ? "/admin" : "/dashboard"} 
                className="px-4 py-2 rounded hover:bg-blue-800 transition-colors"
              >
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="px-4 py-2 rounded hover:bg-blue-800 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-yellow-500 text-blue-900 font-medium rounded hover:bg-yellow-400 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;