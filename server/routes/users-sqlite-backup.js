const express = require('express');
const { db } = require('../config/database');
const { authenticateToken, requireAdmin, requireModerator } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin and Moderator can view, only Admin can modify)
router.get('/', authenticateToken, requireModerator, (req, res) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = 'WHERE 1=1';
  let params = [];

  if (search) {
    whereClause += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (role) {
    whereClause += ' AND role = ?';
    params.push(role);
  }

  // Get total count
  db.get(`SELECT COUNT(*) as total FROM users ${whereClause}`, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    // Get users with pagination
    const query = `
      SELECT id, username, email, full_name, role, joined_date, last_login, is_active, created_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    db.all(query, [...params, limit, offset], (err, users) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        users,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(countResult.total / limit),
          total_users: countResult.total,
          per_page: parseInt(limit)
        }
      });
    });
  });
});

// Get user statistics (Admin and Moderator can view)
router.get('/stats', authenticateToken, requireModerator, (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_users FROM users',
    'SELECT COUNT(*) as total_members FROM users WHERE role = "member"',
    'SELECT COUNT(*) as total_moderators FROM users WHERE role = "moderator"',
    'SELECT COUNT(*) as total_admins FROM users WHERE role = "admin"',
    'SELECT COUNT(*) as active_users FROM users WHERE is_active = 1',
    'SELECT COUNT(*) as new_users_today FROM users WHERE DATE(created_at) = DATE("now")',
    'SELECT COUNT(*) as new_users_week FROM users WHERE created_at >= DATE("now", "-7 days")',
    'SELECT COUNT(*) as new_users_month FROM users WHERE created_at >= DATE("now", "-30 days")'
  ];

  const stats = {};
  let completed = 0;

  queries.forEach((query, index) => {
    db.get(query, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      Object.assign(stats, result);
      completed++;

      if (completed === queries.length) {
        res.json(stats);
      }
    });
  });
});

// Promote user to moderator (Admin only)
router.put('/:id/promote', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['member', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  db.run('UPDATE users SET role = ? WHERE id = ?', [role, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User role updated to ${role} successfully` });
  });
});

// Update user role (Admin only) - Alias for promote endpoint
router.put('/:id/role', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['member', 'moderator', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  // Prevent admin from changing their own role
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({ message: 'Cannot change your own role' });
  }

  db.run('UPDATE users SET role = ? WHERE id = ?', [role, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User role updated to ${role} successfully` });
  });
});

// Deactivate/Activate user (Admin only)
router.put('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  db.run('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${is_active ? 'activated' : 'deactivated'} successfully` });
  });
});

// Get user profile
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Users can only view their own profile unless they're admin/moderator
  if (req.user.id !== parseInt(id) && !['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  db.get(`
    SELECT id, username, email, full_name, role, bio, profile_image, 
           joined_date, last_login, is_active, created_at
    FROM users WHERE id = ?
  `, [id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  });
});

// Update user profile
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { full_name, email, bio } = req.body;

  // Users can only update their own profile unless they're admin
  if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  db.run(`
    UPDATE users 
    SET full_name = ?, email = ?, bio = ?
    WHERE id = ?
  `, [full_name, email, bio, id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  });
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;
