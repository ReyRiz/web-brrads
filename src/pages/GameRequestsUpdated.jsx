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
    status: isAdmin() ? '' : 'approved',
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
      page: 1
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu Review' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Disetujui' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Ditolak' },
      played: { color: 'bg-blue-100 text-blue-800', text: 'Sudah Dimainkan' },
      duplicate: { color: 'bg-orange-100 text-orange-800', text: 'Duplikat' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Gamepad2 className="text-brrads-red" />
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
              className="mt-4 md:mt-0 bg-brrads-red hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Request Game</span>
            </button>
          </div>
        </div>

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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brrads-red focus:border-transparent"
                />
              </div>
            </div>
            
            {isAdmin() && (
              <div className="md:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brrads-red focus:border-transparent appearance-none bg-white"
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
            )}
          </div>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brrads-red mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No game requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isAdmin() ? 'No requests found.' : 'No approved games yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
              >
                {request.image_path && (
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={`http://localhost:5001${request.image_path}`}
                      alt={request.game_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {request.game_name}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>{request.requester_name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(request.created_at)}</span>
                    </div>
                  </div>

                  {request.game_link && (
                    <div className="mb-4">
                      <a
                        href={request.game_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-brrads-red hover:text-red-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        <span>View Game</span>
                      </a>
                    </div>
                  )}

                  {isAdmin() && (
                    <div className="border-t pt-4">
                      <button
                        onClick={() => handleAdminAction(request)}
                        className="w-full bg-brrads-red hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Kelola</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        <GameRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSuccess={fetchRequests}
        />

        <AdminActionModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          request={selectedRequest}
          onSuccess={fetchRequests}
        />
      </div>
    </div>
  );
};

export default GameRequests;
