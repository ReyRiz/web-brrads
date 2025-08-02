import React, { useState } from 'react';
import Modal from './Modal';
import { Upload, Gamepad2 } from 'lucide-react';
import axios from '../utils/api';

const GameRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    game_name: '',
    game_link: '',
    requester_name: '',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('game_name', formData.game_name);
      formDataToSend.append('game_link', formData.game_link);
      formDataToSend.append('requester_name', formData.requester_name);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post('/api/game-requests/submit', formDataToSend);

      setMessage({ 
        type: 'success', 
        text: 'Game request berhasil dikirim! Admin akan meninjau request Anda.' 
      });

      // Reset form
      setFormData({
        game_name: '',
        game_link: '',
        requester_name: '',
        image: null
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        setMessage({ type: '', text: '' });
      }, 2000);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error mengirim request' 
      });
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      game_name: '',
      game_link: '',
      requester_name: '',
      image: null
    });
    setMessage({ type: '', text: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request Game Baru" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game Name */}
        <div>
          <label htmlFor="game_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Game *
          </label>
          <input
            type="text"
            id="game_name"
            name="game_name"
            value={formData.game_name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brrads-red focus:border-brrads-red"
            placeholder="Masukkan nama game..."
          />
        </div>

        {/* Game Link */}
        <div>
          <label htmlFor="game_link" className="block text-sm font-medium text-gray-700 mb-1">
            Link Game (Steam, Epic Games, dll)
          </label>
          <input
            type="url"
            id="game_link"
            name="game_link"
            value={formData.game_link}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brrads-red focus:border-brrads-red"
            placeholder="https://store.steampowered.com/app/..."
          />
        </div>

        {/* Requester Name */}
        <div>
          <label htmlFor="requester_name" className="block text-sm font-medium text-gray-700 mb-1">
            Nama Anda *
          </label>
          <input
            type="text"
            id="requester_name"
            name="requester_name"
            value={formData.requester_name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brrads-red focus:border-brrads-red"
            placeholder="Nama atau username Anda..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Gambar Game (Opsional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-brrads-red transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-brrads-red hover:text-red-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brrads-red"
                >
                  <span>Upload gambar</span>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">atau drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 5MB</p>
              {formData.image && (
                <p className="text-sm text-green-600 font-medium">✓ {formData.image.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brrads-red"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brrads-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brrads-red disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4" />
                <span>Kirim Request</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GameRequestModal;
