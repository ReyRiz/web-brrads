const { prisma } = require('./config/prisma');
const bcrypt = require('bcryptjs');

const createModerator = async () => {
  try {
    const hashedPassword = await bcrypt.hash('moderator123', 10);
    
    const moderator = await prisma.user.create({
      data: {
        username: 'moderator',
        password: hashedPassword,
        email: 'moderator@brrads.com',
        fullName: 'Test Moderator',
        role: 'moderator',
        isActive: true
      }
    });

    console.log('✅ Moderator account created successfully!');
    console.log('🔑 Username: moderator');
    console.log('🔑 Password: moderator123');
    console.log('📧 Email: moderator@brrads.com');
    console.log('👤 Role: moderator');
    console.log('🆔 User ID:', moderator.id);

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Username already exists');
    } else {
      console.log('❌ Error creating moderator:', error.message);
    }
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
};

createModerator();
