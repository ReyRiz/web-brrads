const express = require('express');
const { db } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get current live stream
router.get('/current', (req, res) => {
  db.get(`
    SELECT id, title, youtube_url, thumbnail_url, description, started_at, created_at
    FROM live_streams 
    WHERE is_active = 1 
    ORDER BY created_at DESC 
    LIMIT 1
  `, (err, stream) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ stream });
  });
});

// Get all live streams (Admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  db.get('SELECT COUNT(*) as total FROM live_streams', (err, countResult) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    db.all(`
      SELECT ls.*, u.username as created_by_username
      FROM live_streams ls
      LEFT JOIN users u ON ls.created_by = u.id
      ORDER BY ls.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset], (err, streams) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        streams,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(countResult.total / limit),
          total_streams: countResult.total,
          per_page: parseInt(limit)
        }
      });
    });
  });
});

// Create new live stream (Admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { title, youtube_url, thumbnail_url, description } = req.body;

  if (!title || !youtube_url) {
    return res.status(400).json({ message: 'Title and YouTube URL are required' });
  }

  // Validate YouTube URL
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  if (!youtubeRegex.test(youtube_url)) {
    return res.status(400).json({ message: 'Invalid YouTube URL' });
  }

  // Deactivate current live stream
  db.run('UPDATE live_streams SET is_active = 0, ended_at = ? WHERE is_active = 1', 
    [new Date().toISOString()], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Create new live stream
      db.run(`
        INSERT INTO live_streams (title, youtube_url, thumbnail_url, description, is_active, created_by, started_at)
        VALUES (?, ?, ?, ?, 1, ?, ?)
      `, [title, youtube_url, thumbnail_url, description, req.user.id, new Date().toISOString()], 
      function(err) {
        if (err) {
          return res.status(500).json({ message: 'Error creating live stream' });
        }

        res.status(201).json({ 
          message: 'Live stream created successfully!',
          streamId: this.lastID 
        });
      });
    });
});

// Update live stream (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, youtube_url, thumbnail_url, description } = req.body;

  if (!title || !youtube_url) {
    return res.status(400).json({ message: 'Title and YouTube URL are required' });
  }

  // Validate YouTube URL
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  if (!youtubeRegex.test(youtube_url)) {
    return res.status(400).json({ message: 'Invalid YouTube URL' });
  }

  db.run(`
    UPDATE live_streams 
    SET title = ?, youtube_url = ?, thumbnail_url = ?, description = ?
    WHERE id = ?
  `, [title, youtube_url, thumbnail_url, description, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Live stream not found' });
    }

    res.json({ message: 'Live stream updated successfully' });
  });
});

// End live stream (Admin only)
router.put('/:id/end', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run(`
    UPDATE live_streams 
    SET is_active = 0, ended_at = ?
    WHERE id = ?
  `, [new Date().toISOString(), id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Live stream not found' });
    }

    res.json({ message: 'Live stream ended successfully' });
  });
});

// Delete live stream (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM live_streams WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Live stream not found' });
    }

    res.json({ message: 'Live stream deleted successfully' });
  });
});

module.exports = router;
