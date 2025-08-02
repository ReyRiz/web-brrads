import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Gamepad2, 
  Search, 
  Filter,
  Calendar,
  User,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Plus,
  Settings
} from 'lucide-react';
import { formatDate, getStatusColor } from '../utils/helpers';
import axios from '../utils/api';
import GameRequestModal from '../components/GameRequestModal';
import AdminActionModal from '../components/AdminActionModal';

const GameRequests = () => {
  const { user, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    status: isAdmin() ? '' : 'approved', // Non-admin users only see approved games
    search: '',
    page: 1
  });

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch game requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', '12');

      const endpoint = isAdmin() ? '/api/game-requests/all' : '/api/game-requests/public';
      const response = await axios.get(`${endpoint}?${params}`);
      setRequests(response.data.requests);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  // Handle admin action
  const handleAdminAction = (request) => {
    setSelectedRequest(request);
    setShowAdminModal(true);
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'played': return <Play className="w-4 h-4" />;
      case 'duplicate': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
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
                <Gamepad2 className="text-purple-600" />
                <span>Game Requests</span>
              </h1>
              <p className="text-gray-600 mt-2">
                {isAdmin() 
                  ? 'Kelola game requests dari komunitas' 
                  : 'Lihat game yang disetujui dan submit request baru'
                }
              </p>
            </div>
            
            <button
              onClick={() => setShowRequestModal(true)}
              className="mt-4 md:mt-0 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Request Game</span>
            </button>
          </div>
        </div>

        {/* Submit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Upload className="text-purple-600" />
              <span>Submit Game Request</span>
            </h2>

            {formMessage.text && (
              <div className={`p-4 rounded-lg mb-6 ${
                formMessage.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {formMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Game *
                  </label>
                  <input
                    type="text"
                    name="game_name"
                    required
                    value={formData.game_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Masukkan nama game"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Requester *
                  </label>
                  <input
                    type="text"
                    name="requester_name"
                    required
                    value={formData.requester_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Nama kamu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Game (Optional)
                </label>
                <input
                  type="url"
                  name="game_link"
                  value={formData.game_link}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="https://store.steampowered.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Screenshot/GIF Game (Optional)
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Max 10MB. Format: JPG, PNG, GIF
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 sm:flex-none bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="played">Played</option>
                  <option value="rejected">Rejected</option>
                  <option value="duplicate">Duplicate</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No game requests found</p>
            <p className="text-gray-500">Be the first to submit a request!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200">
                {/* Image */}
                {request.image_path && (
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img
                      src={`${axios.defaults.baseURL}${request.image_path}`}
                      alt={request.game_name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </span>
                    
                    {request.played_at && (
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <Play size={12} />
                        <span>Played</span>
                      </span>
                    )}
                  </div>

                  {/* Game Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {request.game_name}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <User size={14} />
                      <span>Requested by: <strong>{request.requester_name}</strong></span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>{formatDate(request.created_at)}</span>
                    </div>

                    {request.duplicate_of && (
                      <div className="text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                        <span className="text-xs">
                          Already requested by: <strong>{request.original_requester}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Game Link */}
                  {request.game_link && (
                    <a
                      href={request.game_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span>View Game</span>
                    </a>
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
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              
              <button
                onClick={() => handleFilterChange('page', Math.min(pagination.total_pages, filters.page + 1))}
                disabled={filters.page === pagination.total_pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRequests;
