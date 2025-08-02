import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Gamepad2, 
  Palette, 
  Users,
  Eye,
  Check,
  X,
  Trash2,
  Calendar,
  User,
  BarChart3,
  TrendingUp,
  Search,
  UserCheck,
  UserMinus,
  Crown,
  Star,
  Clock,
  Mail,
  Settings
} from 'lucide-react';
import { formatDate, getStatusColor } from '../utils/helpers';
import axios from '../utils/api';

const AdminPanel = () => {
  const { user, isAdmin, isModerator } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    totalFanArts: 0,
    pendingFanArts: 0,
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    moderatorUsers: 0
  });

  // Game Requests
  const [gameRequests, setGameRequests] = useState([]);
  const [gameRequestsLoading, setGameRequestsLoading] = useState(false);
  
  // Fan Arts
  const [fanArts, setFanArts] = useState([]);
  const [fanArtsLoading, setFanArtsLoading] = useState(false);

  // Users Management
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('all');
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0, 
    adminUsers: 0,
    moderatorUsers: 0,
    memberUsers: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0
  });

  // Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      console.log('🔄 Fetching stats...'); // Debug log
      
      // Get user stats and other stats
      const [gameRequestsRes, fanArtsRes, userStatsRes] = await Promise.all([
        axios.get('/api/game-requests/all?limit=1'),
        axios.get('/api/fan-art/admin/all?limit=1'),
        axios.get('/api/users/stats')
      ]);

      console.log('📊 Game requests response:', gameRequestsRes.data); // Debug log
      console.log('🎨 Fan arts response:', fanArtsRes.data); // Debug log
      console.log('👥 User stats response:', userStatsRes.data); // Debug log

      setStats({
        totalRequests: gameRequestsRes.data.pagination?.total_items || 0,
        pendingRequests: gameRequestsRes.data.requests?.filter(r => r.status === 'pending').length || 0,
        totalFanArts: fanArtsRes.data.pagination?.total_items || 0,
        pendingFanArts: fanArtsRes.data.fanArts?.filter(f => f.status === 'pending').length || 0,
        totalUsers: userStatsRes.data.total_users || 0,
        activeUsers: userStatsRes.data.active_users || 0,
        adminUsers: userStatsRes.data.total_admins || 0,
        moderatorUsers: userStatsRes.data.total_moderators || 0
      });

      // Set detailed user stats
      setUserStats({
        totalUsers: userStatsRes.data.total_users || 0,
        activeUsers: userStatsRes.data.active_users || 0,
        adminUsers: userStatsRes.data.total_admins || 0,
        moderatorUsers: userStatsRes.data.total_moderators || 0,
        memberUsers: userStatsRes.data.total_members || 0,
        newUsersThisWeek: userStatsRes.data.new_users_week || 0,
        newUsersThisMonth: userStatsRes.data.new_users_month || 0
      });

      console.log('✅ Stats updated successfully'); // Debug log
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      console.error('❌ Error details:', error.response?.data);
    }
  };

  // Fetch game requests for admin
  const fetchGameRequests = async () => {
    setGameRequestsLoading(true);
    try {
      const response = await axios.get('/api/game-requests/all?limit=50');
      setGameRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching game requests:', error);
    }
    setGameRequestsLoading(false);
  };

  // Fetch fan arts for admin
  const fetchFanArts = async () => {
    setFanArtsLoading(true);
    try {
      const response = await axios.get('/api/fan-art/admin/all?limit=50');
      setFanArts(response.data.fanArts);
    } catch (error) {
      console.error('Error fetching fan arts:', error);
    }
    setFanArtsLoading(false);
  };

  // Fetch users for admin
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setUsersLoading(false);
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    // Only admin can change user roles
    if (!isAdmin()) {
      // Create a custom modal-like alert for moderators
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
      alertDiv.innerHTML = `
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 0h12a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2zM12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">🔒 Akses Terbatas</h3>
            </div>
          </div>
          <p class="text-gray-600 mb-6">
            Hanya <strong>Admin</strong> yang dapat mengubah role pengguna. 
            Sebagai Moderator, Anda dapat mengelola game requests dan fan arts, 
            tetapi tidak dapat mengubah role pengguna.
          </p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Mengerti
          </button>
        </div>
      `;
      document.body.appendChild(alertDiv);
      return;
    }

    // Prevent admin from changing their own role
    if (user.id === userId) {
      // Create a custom modal-like alert
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
      alertDiv.innerHTML = `
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">⚠️ Aksi Tidak Diizinkan</h3>
            </div>
          </div>
          <p class="text-gray-600 mb-6">
            Anda tidak dapat mengubah role akun Anda sendiri untuk menjaga keamanan sistem. 
            Jika perlu mengubah role, mintalah admin lain untuk melakukannya.
          </p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Mengerti
          </button>
        </div>
      `;
      document.body.appendChild(alertDiv);
      return;
    }

    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole });
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      fetchStats(); // Refresh stats
      alert(`User role updated to ${newRole} successfully!`);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  };

  // Toggle user active status
  const toggleUserStatus = async (userId, currentStatus) => {
    // Only admin can change user status
    if (!isAdmin()) {
      // Create a custom modal-like alert for moderators
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
      alertDiv.innerHTML = `
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 0h12a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2zM12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">🔒 Akses Terbatas</h3>
            </div>
          </div>
          <p class="text-gray-600 mb-6">
            Hanya <strong>Admin</strong> yang dapat mengubah status pengguna. 
            Sebagai Moderator, Anda dapat melihat informasi pengguna tetapi tidak dapat mengubah status mereka.
          </p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Mengerti
          </button>
        </div>
      `;
      document.body.appendChild(alertDiv);
      return;
    }

    // Prevent admin from deactivating their own account
    if (user.id === userId) {
      alert('⚠️ Tidak dapat mengubah status akun Anda sendiri untuk menjaga akses admin!');
      return;
    }

    try {
      const newStatus = !currentStatus;
      await axios.put(`/api/users/${userId}/status`, { is_active: newStatus });
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, is_active: newStatus } : user
        )
      );
      
      fetchStats(); // Refresh stats
      alert(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  // Delete user
  const deleteUser = async (userId, username) => {
    // Only admin can delete users
    if (!isAdmin()) {
      // Create a custom modal-like alert for moderators
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
      alertDiv.innerHTML = `
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 0h12a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2zM12 7c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">🔒 Akses Terbatas</h3>
            </div>
          </div>
          <p class="text-gray-600 mb-6">
            Hanya <strong>Admin</strong> yang dapat menghapus pengguna. 
            Sebagai Moderator, Anda tidak memiliki akses untuk menghapus akun pengguna.
          </p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Mengerti
          </button>
        </div>
      `;
      document.body.appendChild(alertDiv);
      return;
    }

    // Prevent admin from deleting their own account
    if (user.id === userId) {
      // Create a custom modal-like alert
      const alertDiv = document.createElement('div');
      alertDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
      alertDiv.innerHTML = `
        <div class="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">🚫 Aksi Dilarang</h3>
            </div>
          </div>
          <div class="mb-6">
            <p class="text-gray-600 mb-3">
              <strong>PERINGATAN:</strong> Anda tidak dapat menghapus akun Anda sendiri!
            </p>
            <p class="text-gray-600 text-sm">
              Hal ini untuk mencegah kehilangan akses admin dan menjaga keamanan sistem. 
              Jika Anda perlu menghapus akun ini, mintalah admin lain untuk melakukannya.
            </p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Mengerti
          </button>
        </div>
      `;
      document.body.appendChild(alertDiv);
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) return;
    
    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
      fetchStats();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         (user.email && user.email.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
                         (user.full_name && user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()));
    
    const matchesRole = userFilterRole === 'all' || user.role === userFilterRole;
    
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (isModerator()) {
      fetchStats();
      
      // Auto refresh stats every 30 seconds
      const statsInterval = setInterval(() => {
        fetchStats();
      }, 30000);

      return () => clearInterval(statsInterval);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'games' && gameRequests.length === 0) {
      fetchGameRequests();
    }
    if (activeTab === 'fanarts' && fanArts.length === 0) {
      fetchFanArts();
    }
    if (activeTab === 'users' && users.length === 0) {
      fetchUsers();
    }
  }, [activeTab]);

  // Update game request status
  const updateGameRequestStatus = async (id, status) => {
    try {
      await axios.put(`/api/game-requests/${id}/status`, { status });
      
      // Update local state
      setGameRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, status } : request
        )
      );
      
      fetchStats(); // Refresh stats
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating game request status:', error);
      alert('Error updating status');
    }
  };

  // Update fan art status
  const updateFanArtStatus = async (id, status) => {
    try {
      await axios.put(`/api/fan-art/${id}/status`, { status });
      
      // Update local state
      setFanArts(prev => 
        prev.map(fanArt => 
          fanArt.id === id ? { ...fanArt, status } : fanArt
        )
      );
      
      fetchStats(); // Refresh stats
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating fan art status:', error);
      alert('Error updating status');
    }
  };

  // Delete game request
  const deleteGameRequest = async (id) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    
    try {
      await axios.delete(`/api/game-requests/${id}`);
      setGameRequests(prev => prev.filter(request => request.id !== id));
      fetchStats();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting game request:', error);
      alert('Error deleting request');
    }
  };

  // Delete fan art
  const deleteFanArt = async (id) => {
    if (!confirm('Are you sure you want to delete this fan art?')) return;
    
    try {
      await axios.delete(`/api/fan-art/${id}`);
      setFanArts(prev => prev.filter(fanArt => fanArt.id !== id));
      fetchStats();
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting fan art:', error);
      alert('Error deleting fan art');
    }
  };

  // Open modal
  const openModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
  };

  if (!isModerator()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need moderator or admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Shield className="text-red-600" />
            <span>{isAdmin() ? 'Admin Panel' : 'Moderator Panel'}</span>
          </h1>
          <p className="text-gray-600 mt-2">
            {isAdmin() 
              ? 'Manage game requests, fan arts, users, and community content'
              : 'Manage game requests, fan arts, and view community statistics'
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8 border border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              ...(isAdmin() ? [{ id: 'users', label: 'Users', icon: Users }] : []),
              { id: 'games', label: 'Game Requests', icon: Gamepad2 },
              { id: 'fanarts', label: 'Fan Arts', icon: Palette },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-brrads-red text-brrads-red bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
                  </div>
                  <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Members</p>
                    <p className="text-3xl font-bold text-indigo-600">{userStats.memberUsers}</p>
                  </div>
                  <div className="bg-indigo-500 bg-opacity-20 p-3 rounded-full">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.adminUsers}</p>
                  </div>
                  <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Moderators</p>
                    <p className="text-3xl font-bold text-brrads-peach">{stats.moderatorUsers}</p>
                  </div>
                  <div className="bg-brrads-peach bg-opacity-20 p-3 rounded-full">
                    <Star className="w-6 h-6 text-brrads-peach" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalRequests}</p>
                  </div>
                  <div className="bg-brrads-red bg-opacity-20 p-3 rounded-full">
                    <Gamepad2 className="w-6 h-6 text-brrads-red" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-3xl font-bold text-brrads-peach">{stats.pendingRequests}</p>
                  </div>
                  <div className="bg-brrads-peach bg-opacity-20 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-brrads-peach" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Fan Arts</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalFanArts}</p>
                  </div>
                  <div className="bg-gray-200 p-3 rounded-full">
                    <Palette className="w-6 h-6 text-brrads-gray" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Fan Arts</p>
                    <p className="text-3xl font-bold text-brrads-red">{stats.pendingFanArts}</p>
                  </div>
                  <div className="bg-brrads-red bg-opacity-20 p-3 rounded-full">
                    <Eye className="w-6 h-6 text-brrads-red" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className={`grid grid-cols-1 ${isAdmin() ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                {isAdmin() && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Manage Users</h3>
                      <p className="text-sm text-gray-600">{stats.totalUsers} total users</p>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('games')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Gamepad2 className="w-8 h-8 text-brrads-red" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Review Game Requests</h3>
                    <p className="text-sm text-gray-600">{stats.pendingRequests} pending requests</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('fanarts')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Palette className="w-8 h-8 text-brrads-peach" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Review Fan Arts</h3>
                    <p className="text-sm text-gray-600">{stats.pendingFanArts} pending submissions</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{userStats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New This Week</p>
                    <p className="text-3xl font-bold text-green-600">{userStats.newUsersThisWeek}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">New This Month</p>
                    <p className="text-3xl font-bold text-brrads-peach">{userStats.newUsersThisMonth}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-brrads-peach" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Members</p>
                    <p className="text-3xl font-bold text-brrads-red">{userStats.memberUsers}</p>
                  </div>
                  <User className="w-8 h-8 text-brrads-red" />
                </div>
              </div>
            </div>

            {/* User Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brrads-red focus:border-transparent"
                      />
                    </div>
                    
                    {/* Role Filter */}
                    <select
                      value={userFilterRole}
                      onChange={(e) => setUserFilterRole(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brrads-red focus:border-transparent"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="member">Member</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {usersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brrads-red mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading users...</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((currentUser) => {
                        const isCurrentUser = user.id === currentUser.id;
                        return (
                        <tr 
                          key={currentUser.id} 
                          className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  isCurrentUser 
                                    ? 'bg-blue-100 ring-2 ring-blue-500' 
                                    : 'bg-brrads-red bg-opacity-20'
                                }`}>
                                  <User className={`h-5 w-5 ${isCurrentUser ? 'text-blue-600' : 'text-brrads-red'}`} />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {currentUser.username}
                                  {isCurrentUser && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{currentUser.email}</div>
                                {currentUser.full_name && (
                                  <div className="text-xs text-gray-400">{currentUser.full_name}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              currentUser.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800'
                                : currentUser.role === 'moderator'
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {currentUser.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                              {currentUser.role === 'moderator' && <Star className="w-3 h-3 mr-1" />}
                              {currentUser.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              currentUser.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {currentUser.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(currentUser.joined_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {currentUser.last_login ? formatDate(currentUser.last_login) : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {/* Role Change Dropdown - Only for Admin */}
                              <select
                                value={currentUser.role}
                                onChange={(e) => updateUserRole(currentUser.id, e.target.value)}
                                className={`text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-brrads-red focus:border-transparent ${
                                  isCurrentUser || !isAdmin() 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : ''
                                }`}
                                disabled={isCurrentUser || !isAdmin()}
                                title={
                                  isCurrentUser 
                                    ? 'Cannot change your own role' 
                                    : !isAdmin()
                                    ? 'Only admins can change user roles'
                                    : 'Change user role'
                                }
                              >
                                <option value="member">Member</option>
                                <option value="moderator">Moderator</option>
                                <option value="admin">Admin</option>
                              </select>
                              
                              {/* Toggle Status - Only for Admin */}
                              <button
                                onClick={() => toggleUserStatus(currentUser.id, currentUser.is_active)}
                                className={`p-2 rounded-lg ${
                                  isCurrentUser || !isAdmin()
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : currentUser.is_active 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                disabled={isCurrentUser || !isAdmin()}
                                title={
                                  isCurrentUser 
                                    ? 'Cannot change your own status'
                                    : !isAdmin()
                                    ? 'Only admins can change user status'
                                    : currentUser.is_active 
                                    ? 'Deactivate User' 
                                    : 'Activate User'
                                }
                              >
                                {currentUser.is_active ? <UserMinus size={16} /> : <UserCheck size={16} />}
                              </button>
                              
                              {/* Delete User - Only for Admin */}
                              <button
                                onClick={() => deleteUser(currentUser.id, currentUser.username)}
                                className={`p-2 rounded-lg ${
                                  isCurrentUser || !isAdmin()
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                                disabled={isCurrentUser || !isAdmin()}
                                title={
                                  isCurrentUser 
                                    ? 'Cannot delete your own account' 
                                    : !isAdmin()
                                    ? 'Only admins can delete users'
                                    : 'Delete User'
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                
                {!usersLoading && filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Game Requests Tab */}
        {activeTab === 'games' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Game Requests Management</h2>
            </div>
            
            <div className="overflow-x-auto">
              {gameRequestsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brrads-red mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading...</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gameRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {request.image_path && (
                              <img
                                src={`${axios.defaults.baseURL}${request.image_path}`}
                                alt={request.game_name}
                                className="w-10 h-10 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{request.game_name}</div>
                              {request.game_link && (
                                <a
                                  href={request.game_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-brrads-red hover:text-red-700"
                                >
                                  View Game
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.requester_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openModal(request, 'game')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye size={16} />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateGameRequestStatus(request.id, 'approved')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => updateGameRequestStatus(request.id, 'rejected')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <button
                              onClick={() => updateGameRequestStatus(request.id, 'played')}
                              className="text-purple-600 hover:text-purple-700"
                              title="Mark as Played"
                            >
                              ✓ Played
                            </button>
                          )}
                          <button
                            onClick={() => deleteGameRequest(request.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Fan Arts Tab */}
        {activeTab === 'fanarts' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Fan Arts Management</h2>
            </div>
            
            <div className="overflow-x-auto">
              {fanArtsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading...</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artwork</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fanArts.map((fanArt) => (
                      <tr key={fanArt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={`${axios.defaults.baseURL}${fanArt.image_path}`}
                              alt={fanArt.title}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                            <div className="text-sm font-medium text-gray-900">{fanArt.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fanArt.artist_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fanArt.status)}`}>
                            {fanArt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(fanArt.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openModal(fanArt, 'fanart')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye size={16} />
                          </button>
                          {fanArt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateFanArtStatus(fanArt.id, 'approved')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => updateFanArtStatus(fanArt.id, 'rejected')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteFanArt(fanArt.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalType === 'game' ? 'Game Request Details' : 'Fan Art Details'}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {modalType === 'game' ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-900">Game Name</h3>
                      <p className="text-gray-700">{selectedItem.game_name}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Requester</h3>
                      <p className="text-gray-700">{selectedItem.requester_name}</p>
                    </div>
                    {selectedItem.game_link && (
                      <div>
                        <h3 className="font-semibold text-gray-900">Game Link</h3>
                        <a
                          href={selectedItem.game_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 break-all"
                        >
                          {selectedItem.game_link}
                        </a>
                      </div>
                    )}
                    {selectedItem.image_path && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Screenshot</h3>
                        <img
                          src={`${axios.defaults.baseURL}${selectedItem.image_path}`}
                          alt={selectedItem.game_name}
                          className="max-w-full h-auto rounded-lg"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold text-gray-900">Title</h3>
                      <p className="text-gray-700">{selectedItem.title}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Artist</h3>
                      <p className="text-gray-700">{selectedItem.artist_name}</p>
                    </div>
                    {selectedItem.description && (
                      <div>
                        <h3 className="font-semibold text-gray-900">Description</h3>
                        <p className="text-gray-700">{selectedItem.description}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Artwork</h3>
                      <img
                        src={`${axios.defaults.baseURL}${selectedItem.image_path}`}
                        alt={selectedItem.title}
                        className="max-w-full h-auto rounded-lg"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h3 className="font-semibold text-gray-900">Status</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Submitted</h3>
                    <p className="text-gray-700 text-sm">{formatDate(selectedItem.created_at)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedItem.status === 'pending' && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <button
                      onClick={() => {
                        if (modalType === 'game') {
                          updateGameRequestStatus(selectedItem.id, 'approved');
                        } else {
                          updateFanArtStatus(selectedItem.id, 'approved');
                        }
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Check size={16} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        if (modalType === 'game') {
                          updateGameRequestStatus(selectedItem.id, 'rejected');
                        } else {
                          updateFanArtStatus(selectedItem.id, 'rejected');
                        }
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <X size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
