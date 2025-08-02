const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../config/database');
const { authenticateToken, requireAdmin, requireModerator } = require('../middleware/auth');

const router = express.Router();

// Configure multer for fan art uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/fanart');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'fanart-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit for fan art
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
    }
  }
});

// Submit new fan art (Requires login)
router.post('/submit', authenticateToken, upload.single('image'), (req, res) => {
  const { title, artist_name, description } = req.body;
  const userId = req.user.id;

  // Input validation and sanitization
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title is required and must be valid text' });
  }

  if (!artist_name || typeof artist_name !== 'string' || artist_name.trim().length === 0) {
    return res.status(400).json({ message: 'Artist name is required and must be valid text' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  // Sanitize inputs to prevent SQL injection
  const sanitizedTitle = title.trim().substring(0, 255);
  const sanitizedArtistName = artist_name.trim().substring(0, 100);
  const sanitizedDescription = description ? description.trim().substring(0, 1000) : '';

  // Check for spam: limit submissions per user per day
  db.get(
    'SELECT COUNT(*) as count FROM fan_arts WHERE submitted_by = ? AND DATE(created_at) = DATE("now")',
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (result.count >= 3) { // Max 3 fan art submissions per day per user
        return res.status(429).json({ 
          message: 'Daily submission limit reached. You can only submit 3 fan arts per day.' 
        });
      }

      // Check for duplicate titles by the same user
      db.get(
        'SELECT id FROM fan_arts WHERE LOWER(title) = LOWER(?) AND submitted_by = ?',
        [sanitizedTitle, userId],
        (err, duplicate) => {
          if (err) {
            return res.status(500).json({ message: 'Database error' });
          }

          if (duplicate) {
            return res.status(400).json({ 
              message: 'You have already submitted fan art with this title.' 
            });
          }

          // All validations passed, proceed with insertion
          const imagePath = `/uploads/fanart/${req.file.filename}`;

          db.run(
            `INSERT INTO fan_arts (title, artist_name, image_path, description, status, submitted_by) 
             VALUES (?, ?, ?, ?, 'pending', ?)`,
            [sanitizedTitle, sanitizedArtistName, imagePath, sanitizedDescription, userId],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Failed to submit fan art' });
              }

              res.status(201).json({
                message: 'Fan art submitted successfully! It will be reviewed by admin.',
                fanArtId: this.lastID
              });
            }
          );
        }
      );
    }
  );
});

// Get all fan arts (public - only approved ones)
router.get('/all', (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  const query = `
    SELECT fa.*, u.username as submitted_by_username
    FROM fan_arts fa
    LEFT JOIN users u ON fa.submitted_by = u.id
    WHERE fa.status = 'approved'
    ORDER BY fa.created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [parseInt(limit), offset], (err, fanArts) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    // Get total count for pagination
    db.get(
      'SELECT COUNT(*) as total FROM fan_arts WHERE status = "approved"',
      (err, countResult) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        res.json({
          fanArts,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(countResult.total / limit),
            total_items: countResult.total,
            items_per_page: parseInt(limit)
          }
        });
      }
    );
  });
});

// Admin/Moderator: Get all fan arts (including pending)
router.get('/admin/all', authenticateToken, requireModerator, (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT fa.*, u.username as submitted_by_username
    FROM fan_arts fa
    LEFT JOIN users u ON fa.submitted_by = u.id
  `;
  let params = [];

  if (status) {
    query += ' WHERE fa.status = ?';
    params.push(status);
  }

  query += ` ORDER BY fa.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, fanArts) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM fan_arts';
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
        fanArts,
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

// Admin: Update fan art status
router.put('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'approved', 'rejected'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  db.run(
    'UPDATE fan_arts SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating fan art status' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Fan art not found' });
      }

      res.json({ message: 'Fan art status updated successfully' });
    }
  );
});

// Admin: Delete fan art
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // First get the fan art to delete associated image
  db.get('SELECT image_path FROM fan_arts WHERE id = ?', [id], (err, fanArt) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!fanArt) {
      return res.status(404).json({ message: 'Fan art not found' });
    }

    // Delete the image file
    const imagePath = path.join(__dirname, '../../public', fanArt.image_path);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete the database record
    db.run('DELETE FROM fan_arts WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting fan art' });
      }

      res.json({ message: 'Fan art deleted successfully' });
    });
  });
});

// Get single fan art details
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT fa.*, u.username as submitted_by_username
     FROM fan_arts fa
     LEFT JOIN users u ON fa.submitted_by = u.id
     WHERE fa.id = ? AND fa.status = 'approved'`,
    [id],
    (err, fanArt) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!fanArt) {
        return res.status(404).json({ message: 'Fan art not found' });
      }

      res.json(fanArt);
    }
  );
});

module.exports = router;
