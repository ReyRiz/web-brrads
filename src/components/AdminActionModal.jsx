import React, { useState } from 'react';
import Modal from './Modal';
import { 
  CheckCircle, 
  XCircle, 
  Play, 
  Trash2, 
  AlertTriangle,
  Eye
} from 'lucide-react';
import axios from '../utils/api';

const AdminActionModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [action, setAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAction = async (actionType) => {
    if (actionType === 'reject' && !rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Alasan penolakan harus diisi!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let endpoint = '';
      let payload = {};

      switch (actionType) {
        case 'approve':
          endpoint = `/api/game-requests/${request.id}/approve`;
          break;
        case 'reject':
          endpoint = `/api/game-requests/${request.id}/reject`;
          payload = { reason: rejectionReason };
          break;
        case 'played':
          endpoint = `/api/game-requests/${request.id}/mark-played`;
          break;
        case 'delete':
          endpoint = `/api/game-requests/${request.id}/delete`;
          break;
        default:
          return;
      }

      const response = await axios.put(endpoint, payload);

      setMessage({ 
        type: 'success', 
        text: response.data.message 
      });

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Auto close after 1.5 seconds
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1500);

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error melakukan aksi' 
      });
    }
    setLoading(false);
  };

  const resetModal = () => {
    setAction('');
    setRejectionReason('');
    setMessage({ type: '', text: '' });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!request) return null;

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
    <Modal isOpen={isOpen} onClose={handleClose} title="Kelola Game Request" size="lg">
      <div className="space-y-6">
        {/* Request Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detail Request</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Game:</span> {request.game_name}</div>
                <div><span className="font-medium">Requester:</span> {request.requester_name}</div>
                <div><span className="font-medium">Status:</span> {getStatusBadge(request.status)}</div>
                <div><span className="font-medium">Tanggal:</span> {new Date(request.created_at).toLocaleDateString('id-ID')}</div>
              </div>
            </div>
            {request.image_path && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Gambar</h4>
                <img 
                  src={`http://localhost:5001${request.image_path}`}
                  alt={request.game_name}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
          {request.game_link && (
            <div className="mt-4">
              <span className="font-medium">Link Game:</span>
              <a 
                href={request.game_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 ml-2"
              >
                {request.game_link}
              </a>
            </div>
          )}
        </div>

        {/* Action Selection */}
        {!action && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Pilih Aksi</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('review')}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <Eye className="w-5 h-5 mr-2 text-gray-600" />
                <span>Tinjau</span>
              </button>
              
              <button
                onClick={() => setAction('approve')}
                className="flex items-center justify-center p-3 border border-green-300 rounded-lg hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-green-700"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => setAction('reject')}
                className="flex items-center justify-center p-3 border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-red-700"
              >
                <XCircle className="w-5 h-5 mr-2" />
                <span>Reject</span>
              </button>

              <button
                onClick={() => setAction('played')}
                className="flex items-center justify-center p-3 border border-blue-300 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-700"
              >
                <Play className="w-5 h-5 mr-2" />
                <span>Sudah Dimainkan</span>
              </button>

              <button
                onClick={() => setAction('delete')}
                className="flex items-center justify-center p-3 border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-red-700 col-span-2"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                <span>Hapus Game</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Forms */}
        {action === 'review' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Review Game Request</h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                Request ini sedang dalam tahap review. Anda dapat melihat detail lengkap di atas.
                Pilih aksi lain untuk melanjutkan proses review.
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setAction('')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Kembali
              </button>
            </div>
          </div>
        )}

        {action === 'approve' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Approve Game Request
            </h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800 mb-4">
                Game ini akan disetujui dan muncul di halaman public untuk dilihat semua pengunjung.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setAction('')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {action === 'reject' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <XCircle className="w-5 h-5 mr-2 text-red-600" />
              Reject Game Request
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Jelaskan alasan mengapa request ini ditolak..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setAction('')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={loading || !rejectionReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {action === 'played' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2 text-blue-600" />
              Tandai Sudah Dimainkan
            </h4>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 mb-4">
                Game ini akan ditandai sebagai "Sudah Dimainkan" dan masih akan terlihat di halaman public.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setAction('')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleAction('played')}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Tandai Dimainkan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {action === 'delete' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-600" />
              Hapus Game Request
            </h4>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">Peringatan!</p>
                  <p className="text-red-700 mt-1">
                    Aksi ini akan menghapus game request secara permanen dan tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setAction('')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleAction('delete')}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Permanen</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </Modal>
  );
};

export default AdminActionModal;
