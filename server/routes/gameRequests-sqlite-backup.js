const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/database');
const { authenticateToken, requireAdmin, requireModerator } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/games');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'game-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed'));
    }
  }
});

// Submit new game request (Requires login)
router.post('/submit', authenticateToken, upload.single('image'), (req, res) => {
  const { game_name, game_link, requester_name } = req.body;
  const userId = req.user.id;

  // Input validation and sanitization
  if (!game_name || typeof game_name !== 'string' || game_name.trim().length === 0) {
    return res.status(400).json({ message: 'Game name is required and must be valid text' });
  }

  if (!requester_name || typeof requester_name !== 'string' || requester_name.trim().length === 0) {
    return res.status(400).json({ message: 'Requester name is required and must be valid text' });
  }

  // Sanitize inputs to prevent SQL injection
  const sanitizedGameName = game_name.trim().substring(0, 255);
  const sanitizedRequesterName = requester_name.trim().substring(0, 100);
  const sanitizedGameLink = game_link ? game_link.trim().substring(0, 500) : null;

  // Validate URL if provided
  if (sanitizedGameLink) {
    try {
      new URL(sanitizedGameLink);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid game link URL format' });
    }
  }

  // Check for spam: limit requests per user per day
  db.get(
    'SELECT COUNT(*) as count FROM game_requests WHERE requested_by = ? AND DATE(created_at) = DATE("now")',
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (result.count >= 5) { // Max 5 requests per day per user
        return res.status(429).json({ 
          message: 'Daily request limit reached. You can only submit 5 game requests per day.' 
        });
      }

      // Check for duplicate game requests by the same user
      db.get(
        'SELECT id FROM game_requests WHERE LOWER(game_name) = LOWER(?) AND requested_by = ?',
        [sanitizedGameName, userId],
        (err, duplicate) => {
          if (err) {
            return res.status(500).json({ message: 'Database error' });
          }

          if (duplicate) {
            return res.status(400).json({ 
              message: 'You have already requested this game before.' 
            });
          }

          // Check for recent duplicate requests (within 1 hour) by any user
          db.get(
            `SELECT id FROM game_requests 
             WHERE LOWER(game_name) = LOWER(?) 
             AND created_at > datetime('now', '-1 hour')`,
            [sanitizedGameName],
            (err, recentDuplicate) => {
              if (err) {
                return res.status(500).json({ message: 'Database error' });
              }

              if (recentDuplicate) {
                return res.status(400).json({ 
                  message: 'This game was recently requested. Please wait before requesting it again.' 
                });
              }

              // All validations passed, proceed with insertion
              const imagePath = req.file ? `/uploads/games/${req.file.filename}` : null;

              db.run(
                `INSERT INTO game_requests (game_name, game_link, requester_name, image_path, requested_by, status) 
                 VALUES (?, ?, ?, ?, ?, 'pending')`,
                [sanitizedGameName, sanitizedGameLink, sanitizedRequesterName, imagePath, userId],
                function(err) {
                  if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ message: 'Failed to submit game request' });
                  }
                  
                  res.status(201).json({ 
                    message: 'Game request submitted successfully',
                    id: this.lastID
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Get public game requests (only approved and played games)
router.get('/public', (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT gr.*, u.username as submitted_by_username
    FROM game_requests gr
    LEFT JOIN users u ON gr.requested_by = u.id
    WHERE gr.status IN ('approved', 'played')
  `;
  let params = [];

  if (search) {
    query += ' AND (gr.game_name LIKE ? OR gr.requester_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY gr.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, requests) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM game_requests WHERE status IN ('approved', 'played')`;
    let countParams = [];

    if (search) {
      countQuery += ' AND (game_name LIKE ? OR requester_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      const totalItems = countResult.total;
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          limit: parseInt(limit)
        }
      });
    });
  });
});

// Get all game requests (public)
router.get('/all', (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT gr.*, u.username as submitted_by_username,
           orig.requester_name as original_requester
    FROM game_requests gr
    LEFT JOIN users u ON gr.requested_by = u.id
    LEFT JOIN game_requests orig ON gr.duplicate_of = orig.id
  `;
  let params = [];

  if (status) {
    query += ' WHERE gr.status = ?';
    params.push(status);
  }

  query += ` ORDER BY gr.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, requests) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM game_requests';
    let countParams = [];

    if (status) {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        requests,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(countResult.total / limit),
          total_items: countResult.total,
          items_per_page: parseInt(limit)
        }
      });
    });
  });
});

// Admin/Moderator: Update request status
router.put('/:id/status', authenticateToken, requireModerator, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'approved', 'rejected', 'played'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const updateData = [status];
  let query = 'UPDATE game_requests SET status = ?';

  // If marking as played, set played_at timestamp
  if (status === 'played') {
    query += ', played_at = CURRENT_TIMESTAMP';
  }

  query += ' WHERE id = ?';
  updateData.push(id);

  db.run(query, updateData, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error updating request' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request status updated successfully' });
  });
});

// Admin: Delete request
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // First get the request to delete associated image
  db.get('SELECT image_path FROM game_requests WHERE id = ?', [id], (err, request) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Delete the image file if it exists
    if (request.image_path) {
      const imagePath = path.join(__dirname, '../../public', request.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the database record
    db.run('DELETE FROM game_requests WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting request' });
      }

      res.json({ message: 'Request deleted successfully' });
    });
  });
});

// Admin/Moderator action: Approve request
router.put('/:id/approve', authenticateToken, requireModerator, (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE game_requests SET status = ?, played_at = NULL WHERE id = ?',
    ['approved', id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      res.json({ message: 'Request approved successfully' });
    }
  );
});

// Admin/Moderator action: Reject request
router.put('/:id/reject', authenticateToken, requireModerator, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'Rejection reason is required' });
  }

  db.run(
    'UPDATE game_requests SET status = ?, rejection_reason = ? WHERE id = ?',
    ['rejected', reason, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      res.json({ message: 'Request rejected successfully' });
    }
  );
});

// Admin/Moderator action: Mark as played
router.put('/:id/mark-played', authenticateToken, requireModerator, (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE game_requests SET status = ?, played_at = DATETIME("now") WHERE id = ?',
    ['played', id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Request not found' });
      }

      res.json({ message: 'Request marked as played successfully' });
    }
  );
});

// Admin action: Delete request permanently
router.put('/:id/delete', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // First get the request to delete associated image
  db.get('SELECT image_path FROM game_requests WHERE id = ?', [id], (err, request) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Delete the image file if it exists
    if (request.image_path) {
      const imagePath = path.join(__dirname, '../../public', request.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the database record
    db.run('DELETE FROM game_requests WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting request' });
      }

      res.json({ message: 'Request deleted permanently' });
    });
  });
});

module.exports = router;
