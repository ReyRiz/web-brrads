const { db } = require('./config/database');
const bcrypt = require('bcrypt');

const createModerator = async () => {
  try {
    const hashedPassword = await bcrypt.hash('moderator123', 10);
    
    db.run(
      `INSERT INTO users (username, password, email, full_name, role, is_active, joined_date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      ['moderator', hashedPassword, 'moderator@brrads.com', 'Test Moderator', 'moderator', 1],
      function(err) {
        if (err) {
          console.log('❌ Error creating moderator:', err.message);
        } else {
          console.log('✅ Moderator account created successfully!');
          console.log('🔑 Username: moderator');
          console.log('🔑 Password: moderator123');
          console.log('📧 Email: moderator@brrads.com');
          console.log('👤 Role: moderator');
        }
        process.exit();
      }
    );
  } catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
};

createModerator();
