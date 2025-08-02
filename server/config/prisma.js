const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

// Initialize Prisma Client with proper configuration
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

// Initialize database with default data
const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing Prisma database...');

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!existingAdmin) {
      // Create default admin user
      const hashedPassword = await bcryptjs.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          role: 'admin',
          full_name: 'Administrator BRRADS',
          is_active: true,
        }
      });

      console.log('✅ Default admin user created (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Insert default site settings if they don't exist
    const defaultSettings = [
      { key: 'site_title', value: 'BRRADS EMPIRE' },
      { key: 'site_description', value: 'Official community website for YouTuber Reza Auditore' },
      { key: 'max_game_requests_per_day', value: '3' },
      { key: 'max_fanart_submissions_per_day', value: '2' },
      { key: 'enable_registrations', value: 'true' },
      { key: 'maintenance_mode', value: 'false' }
    ];

    for (const setting of defaultSettings) {
      const existing = await prisma.siteSetting.findUnique({
        where: { setting_key: setting.key }
      });

      if (!existing) {
        await prisma.siteSetting.create({
          data: {
            setting_key: setting.key,
            setting_value: setting.value,
          }
        });
      }
    }

    console.log('✅ Database initialized successfully with Prisma');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Graceful shutdown
const cleanup = async () => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Prisma client disconnected');
  } catch (error) {
    console.error('Error disconnecting Prisma:', error);
  }
};

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('beforeExit', cleanup);

module.exports = { 
  prisma, 
  initializeDatabase,
  cleanup 
};
