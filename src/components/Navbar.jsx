import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  Gamepad2, 
  Palette, 
  Shield, 
  LogIn, 
  LogOut,
  User
} from 'lucide-react';
import bradsLogo from '../assets/brrads-logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin, isModerator } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/games', label: 'Request Game', icon: Gamepad2 },
    { path: '/fanart', label: 'Fan Art', icon: Palette },
  ];

  if (isModerator()) {
    navLinks.push({ 
      path: '/admin', 
      label: isAdmin() ? 'Admin Panel' : 'Moderator Panel', 
      icon: Shield 
    });
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gradient-to-r from-brrads-black via-brrads-gray to-brrads-black shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-white font-bold text-xl hover:text-brrads-peach transition-colors"
          >
            <img 
              src={bradsLogo} 
              alt="BRRADS Empire Logo" 
              className="h-10 w-10"
            />
            <span className="hidden sm:inline">BRRADS EMPIRE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                    isActive(path)
                      ? 'bg-brrads-red text-white shadow-lg'
                      : 'text-brrads-light hover:bg-brrads-gray hover:text-brrads-peach'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-white">
                    <User size={16} />
                    <span className="text-sm font-medium">{user.username}</span>
                    {user.role === 'admin' && (
                      <span className="bg-brrads-red text-white px-2 py-1 rounded-full text-xs font-bold">
                        ADMIN
                      </span>
                    )}
                    {user.role === 'moderator' && (
                      <span className="bg-brrads-peach text-brrads-black px-2 py-1 rounded-full text-xs font-bold">
                        MOD
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-brrads-red hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-brrads-red hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-brrads-gray inline-flex items-center justify-center p-2 rounded-md text-brrads-light hover:text-brrads-peach hover:bg-brrads-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brrads-red transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-brrads-black bg-opacity-90">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(path)
                    ? 'bg-brrads-red text-white'
                    : 'text-brrads-light hover:bg-brrads-gray hover:text-brrads-peach'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
            
            {/* Mobile User Menu */}
            <div className="border-t border-brrads-gray pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-brrads-light flex items-center space-x-2">
                    <User size={20} />
                    <div>
                      <div className="font-medium">{user.username}</div>
                      {user.role === 'admin' && (
                        <div className="text-brrads-peach text-xs">Administrator</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-brrads-light hover:bg-brrads-red transition-colors flex items-center space-x-2"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-md text-base font-medium bg-brrads-red text-white hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <LogIn size={20} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
