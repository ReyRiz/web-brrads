import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Palette, 
  Upload, 
  Search,
  Calendar,
  User,
  Heart,
  Eye,
  ImageIcon
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import axios from '../utils/api';
import LoginRequiredModal from '../components/LoginRequiredModal';

const FanArt = () => {
  const { user } = useAuth();
  const [fanArts, setFanArts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist_name: '',
    description: '',
    image: null
  });
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState(null);

  // Modal state
  const [selectedFanArt, setSelectedFanArt] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch fan arts
  const fetchFanArts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/fan-art/all?page=${page}&limit=12`);
      setFanArts(response.data.fanArts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching fan arts:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFanArts(currentPage);
  }, [currentPage]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormMessage({ type: '', text: '' });

    if (!formData.image) {
      setFormMessage({ type: 'error', text: 'Please select an image file' });
      setSubmitLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('artist_name', formData.artist_name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('image', formData.image);

      const response = await axios.post('/api/fan-art/submit', formDataToSend);

      setFormMessage({ 
        type: 'success', 
        text: response.data.message 
      });

      // Reset form
      setFormData({
        title: '',
        artist_name: '',
        description: '',
        image: null
      });
      setPreviewImage(null);

      // Auto close form after success
      setTimeout(() => {
        setShowForm(false);
        setFormMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      setFormMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error submitting fan art' 
      });
    }
    setSubmitLoading(false);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreviewImage(e.target.result);
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Open modal
  const openModal = (fanArt) => {
    setSelectedFanArt(fanArt);
  };

  // Close modal
  const closeModal = () => {
    setSelectedFanArt(null);
  };

  // Handle upload button
  const handleUploadClick = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowForm(!showForm);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Palette className="text-brrads-red" />
                <span>Fan Art Gallery</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Showcase karya seni terbaik dari komunitas BRRADS Empire
              </p>
            </div>
            
            <button
              onClick={handleUploadClick}
              className="mt-4 md:mt-0 bg-brrads-red hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>Upload Fan Art</span>
            </button>
          </div>
        </div>

        {/* Submit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Upload className="text-brrads-red" />
              <span>Upload Fan Art</span>
            </h2>

            {formMessage.text && (
              <div className={`p-4 rounded-lg mb-6 ${
                formMessage.type === 'success'
                  ? 'bg-brrads-peach bg-opacity-20 text-amber-800 border border-amber-200'
                  : 'bg-brrads-red bg-opacity-20 text-red-800 border border-red-200'
              }`}>
                {formMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brrads-red focus:border-transparent transition-all"
                      placeholder="Judul karya seni"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artist Name *
                    </label>
                    <input
                      type="text"
                      name="artist_name"
                      required
                      value={formData.artist_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brrads-red focus:border-transparent transition-all"
                      placeholder="Nama seniman"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brrads-red focus:border-transparent transition-all resize-none"
                      placeholder="Ceritakan tentang karya seni ini..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brrads-red transition-colors">
                    {previewImage ? (
                      <div className="space-y-4">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="max-w-full h-48 object-contain mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setFormData(prev => ({ ...prev, image: null }));
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-brrads-red hover:text-red-700 font-medium">
                              Click to upload
                            </span>
                            <span className="text-gray-600"> or drag and drop</span>
                          </label>
                          <input
                            id="image-upload"
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="hidden"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 15MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-brrads-red hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>Upload Fan Art</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setPreviewImage(null);
                    setFormData({
                      title: '',
                      artist_name: '',
                      description: '',
                      image: null
                    });
                  }}
                  className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Fan Arts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brrads-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading fan arts...</p>
          </div>
        ) : fanArts.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No fan arts found</p>
            <p className="text-gray-500">Be the first to upload your masterpiece!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fanArts.map((fanArt) => (
              <div 
                key={fanArt.id} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                onClick={() => openModal(fanArt)}
              >
                {/* Image */}
                <div className="aspect-square bg-gray-200 overflow-hidden">
                  <img
                    src={`${axios.defaults.baseURL}${fanArt.image_path}`}
                    alt={fanArt.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                    {fanArt.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <User size={14} />
                    <span>{fanArt.artist_name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>{formatDate(fanArt.created_at)}</span>
                  </div>

                  {fanArt.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {fanArt.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                disabled={currentPage === pagination.total_pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedFanArt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div className="bg-white rounded-2xl max-w-4xl max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedFanArt.title}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={`${axios.defaults.baseURL}${selectedFanArt.image_path}`}
                    alt={selectedFanArt.title}
                    className="w-full rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Artist</h3>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <User size={16} />
                      <span>{selectedFanArt.artist_name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Created</h3>
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Calendar size={16} />
                      <span>{formatDate(selectedFanArt.created_at)}</span>
                    </div>
                  </div>
                  
                  {selectedFanArt.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedFanArt.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors">
                        <Heart size={20} />
                        <span>Like</span>
                      </button>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Eye size={20} />
                        <span>Views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Login Required Modal */}
        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          featureName="upload fan art"
        />
      </div>
    );
  };export default FanArt;
