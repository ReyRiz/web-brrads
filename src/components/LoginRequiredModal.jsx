import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogIn, Users } from 'lucide-react';

const LoginRequiredModal = ({ isOpen, onClose, title = "Login Required", message = "You need to be logged in to perform this action." }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-brrads-red bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-brrads-red" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          <div className="bg-brrads-peach bg-opacity-20 border border-brrads-peach rounded-lg p-4">
            <p className="text-sm text-brrads-black font-medium">
              🎮 <strong>Join BRRADS EMPIRE Community!</strong>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Bergabunglah dengan komunitas untuk request game favorit dan berbagi fan art!
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Nanti Saja
          </button>
          <button
            onClick={handleLogin}
            className="flex-1 bg-brrads-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <LogIn size={16} />
            <span>Login Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
