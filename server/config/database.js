const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'member',
          email TEXT,
          full_name TEXT,
          profile_image TEXT,
          bio TEXT,
          joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Game requests table
      db.run(`
        CREATE TABLE IF NOT EXISTS game_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game_name TEXT NOT NULL,
          game_link TEXT,
          requester_name TEXT NOT NULL,
          image_path TEXT,
          status TEXT DEFAULT 'pending',
          requested_by INTEGER,
          duplicate_of INTEGER,
          played_at DATETIME,
          rejection_reason TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (requested_by) REFERENCES users (id),
          FOREIGN KEY (duplicate_of) REFERENCES game_requests (id)
        )
      `);

      // Add rejection_reason column if it doesn't exist (for existing databases)
      db.run(`
        ALTER TABLE game_requests ADD COLUMN rejection_reason TEXT;
      `, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding rejection_reason column:', err.message);
        }
      });

      // Fan arts table
      db.run(`
        CREATE TABLE IF NOT EXISTS fan_arts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          artist_name TEXT NOT NULL,
          image_path TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          description TEXT,
          submitted_by INTEGER,
          approved_by INTEGER,
          approved_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (submitted_by) REFERENCES users (id),
          FOREIGN KEY (approved_by) REFERENCES users (id)
        )
      `);

      // Live streams table
      db.run(`
        CREATE TABLE IF NOT EXISTS live_streams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          youtube_url TEXT NOT NULL,
          thumbnail_url TEXT,
          description TEXT,
          is_active INTEGER DEFAULT 1,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          started_at DATETIME,
          ended_at DATETIME,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);

      // Site settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          setting_key TEXT UNIQUE NOT NULL,
          setting_value TEXT,
          updated_by INTEGER,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (updated_by) REFERENCES users (id)
        )
      `);

      // Add new columns to existing users table if they don't exist
      const newColumns = [
        'email TEXT',
        'full_name TEXT', 
        'profile_image TEXT',
        'bio TEXT',
        'joined_date DATETIME',
        'last_login DATETIME',
        'is_active INTEGER DEFAULT 1'
      ];

      newColumns.forEach(column => {
        const columnName = column.split(' ')[0];
        db.run(`ALTER TABLE users ADD COLUMN ${column};`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error(`Error adding ${columnName} column:`, err.message);
          }
        });
      });

      // Update role column default for existing users
      db.run(`UPDATE users SET role = 'member' WHERE role = 'user';`);

      // Create default admin user (password: admin123)
      const bcrypt = require('bcryptjs');
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync('admin123', saltRounds);

      db.run(`
        INSERT OR IGNORE INTO users (username, password, role, full_name) 
        VALUES ('admin', ?, 'admin', 'Administrator BRRADS')
      `, [hashedPassword], (err) => {
        if (err) {
          console.error('Error creating admin user:', err);
          reject(err);
        } else {
          console.log('Database initialized successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { db, initializeDatabase };
