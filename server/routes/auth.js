const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { username, password, email, full_name } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const checkQuery = email ? 
      'SELECT id FROM users WHERE username = ? OR email = ?' : 
      'SELECT id FROM users WHERE username = ?';
    const checkParams = email ? [username, email] : [username];
    
    db.get(checkQuery, checkParams, async (err, row) => {
      if (err) {
        console.error('Database error during user check:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      db.run(
        'INSERT INTO users (username, password, email, full_name, role, joined_date) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, email || null, full_name || null, 'member', new Date().toISOString()],
        function(err) {
          if (err) {
            console.error('Database error during user creation:', err);
            return res.status(500).json({ message: 'Error creating user: ' + err.message });
          }

          res.status(201).json({ 
            message: 'Member account created successfully! Welcome to BRRADS Empire!',
            userId: this.lastID 
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    try {
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          full_name: user.full_name
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      // Update last login
      db.run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), user.id]);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          full_name: user.full_name,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
});

// Get current user info
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

module.exports = router;
