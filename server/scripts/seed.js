const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create default admin user
    const hashedAdminPassword = await bcryptjs.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: hashedAdminPassword,
        role: 'admin',
        full_name: 'Administrator BRRADS',
        email: 'admin@brradsempire.com',
        bio: 'Main administrator of BRRADS EMPIRE community',
        is_active: true,
      },
    });

    // Create a demo moderator user
    const hashedModPassword = await bcryptjs.hash('mod123', 10);
    
    const moderator = await prisma.user.upsert({
      where: { username: 'moderator' },
      update: {},
      create: {
        username: 'moderator',
        password: hashedModPassword,
        role: 'moderator',
        full_name: 'Community Moderator',
        email: 'mod@brradsempire.com',
        bio: 'Community moderator helping manage BRRADS EMPIRE',
        is_active: true,
      },
    });

    // Create a demo member user
    const hashedMemberPassword = await bcryptjs.hash('member123', 10);
    
    const member = await prisma.user.upsert({
      where: { username: 'testmember' },
      update: {},
      create: {
        username: 'testmember',
        password: hashedMemberPassword,
        role: 'member',
        full_name: 'Test Member',
        email: 'member@example.com',
        bio: 'A test member of the BRRADS EMPIRE community',
        is_active: true,
      },
    });

    // Insert default site settings
    const settings = [
      { key: 'site_title', value: 'BRRADS EMPIRE' },
      { key: 'site_description', value: 'Official community website for YouTuber Reza Auditore' },
      { key: 'max_game_requests_per_day', value: '3' },
      { key: 'max_fanart_submissions_per_day', value: '2' },
      { key: 'enable_registrations', value: 'true' },
      { key: 'maintenance_mode', value: 'false' },
      { key: 'youtube_channel_url', value: 'https://youtube.com/@RezaAuditore' },
      { key: 'subscriber_count', value: '480000' },
      { key: 'community_motto', value: 'Building the Empire Together' }
    ];

    for (const setting of settings) {
      await prisma.siteSetting.upsert({
        where: { setting_key: setting.key },
        update: { setting_value: setting.value },
        create: {
          setting_key: setting.key,
          setting_value: setting.value,
          updated_by: admin.id,
        },
      });
    }

    // Create some sample game requests for demo
    const sampleGameRequests = [
      {
        game_name: 'Cyberpunk 2077',
        game_link: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/',
        requester_name: 'BRRADS Fan',
        status: 'approved',
        requested_by: member.id,
      },
      {
        game_name: 'The Witcher 3: Wild Hunt',
        game_link: 'https://store.steampowered.com/app/292030/The_Witcher_3_Wild_Hunt/',
        requester_name: 'RPG Lover',
        status: 'pending',
        requested_by: member.id,
      },
      {
        game_name: 'Red Dead Redemption 2',
        game_link: 'https://store.steampowered.com/app/1174180/Red_Dead_Redemption_2/',
        requester_name: 'Western Fan',
        status: 'played',
        requested_by: member.id,
        played_at: new Date('2024-01-15T10:00:00Z'),
      }
    ];

    for (const gameRequest of sampleGameRequests) {
      // Check if this game request already exists
      const existing = await prisma.gameRequest.findFirst({
        where: {
          game_name: gameRequest.game_name,
          requested_by: gameRequest.requested_by
        }
      });

      if (!existing) {
        await prisma.gameRequest.create({
          data: gameRequest
        });
      }
    }

    console.log('✅ Database seeded successfully');
    console.log('👤 Users created:');
    console.log('   - admin (password: admin123)');
    console.log('   - moderator (password: mod123)');
    console.log('   - testmember (password: member123)');
    console.log('⚙️  Site settings configured');
    console.log('🎮 Sample game requests added');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
