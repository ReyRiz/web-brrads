import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import bradsLogo from '../assets/brrads-logo.png';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    full_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        // Login
        const result = await login(formData.username, formData.password);
        
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } else {
        // Register
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' });
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
          setLoading(false);
          return;
        }

        if (!formData.email || !formData.full_name) {
          setMessage({ type: 'error', text: 'Email and full name are required for registration' });
          setLoading(false);
          return;
        }

        const result = await register(formData.username, formData.password, formData.email, formData.full_name);
        
        if (result.success) {
          setMessage({ type: 'success', text: result.message + ' Please login now.' });
          setIsLogin(true);
          setFormData({ username: formData.username, password: '', confirmPassword: '', email: '', full_name: '' });
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '', confirmPassword: '', email: '', full_name: '' });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brrads-black via-brrads-gray to-brrads-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-brrads-peach transition-colors">
            <img 
              src={bradsLogo} 
              alt="BRRADS Empire Logo" 
              className="h-16 w-16"
            />
            <span className="font-bold text-2xl">BRRADS EMPIRE</span>
          </Link>
          <p className="mt-4 text-gray-300">
            {isLogin ? 'Login ke akun kamu' : 'Daftar sebagai member baru'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white border-opacity-20">
          <div className="space-y-6">
            <div className="flex bg-gray-800 bg-opacity-50 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isLogin
                    ? 'bg-brrads-red text-brrads-light shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <LogIn size={16} />
                <span>Login</span>
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  !isLogin
                    ? 'bg-brrads-red text-brrads-light shadow-lg'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <UserPlus size={16} />
                <span>Register</span>
              </button>
            </div>

            {/* Alert Message */}
            {message.text && (
              <div className={`p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-brrads-peach bg-opacity-20 border-amber-400 text-amber-100'
                  : 'bg-brrads-red bg-opacity-20 border-brrads-red text-red-100'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brrads-red focus:border-transparent transition-all"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-600 bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brrads-red focus:border-transparent transition-all"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Registration fields */}
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-200 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        required={!isLogin}
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brrads-red focus:border-transparent transition-all"
                        placeholder="Nama lengkap (contoh: Reza BRRADS)"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required={!isLogin}
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brrads-red focus:border-transparent transition-all"
                        placeholder="Email aktif kamu"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Confirm Password (Register only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required={!isLogin}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-800 bg-opacity-50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brrads-red focus:border-transparent transition-all"
                      placeholder="Konfirmasi password"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brrads-red hover:bg-red-700 disabled:bg-red-800 text-brrads-light font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brrads-light"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                    <span>{isLogin ? 'Login' : 'Register'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                onClick={toggleMode}
                className="text-gray-300 hover:text-brrads-peach text-sm transition-colors"
              >
                {isLogin
                  ? "Belum punya akun? Daftar sekarang"
                  : "Sudah punya akun? Login di sini"
                }
              </button>
            </div>

      
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-gray-300 hover:text-yellow-300 text-sm transition-colors inline-flex items-center space-x-1"
          >
            <span>← Kembali ke Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
