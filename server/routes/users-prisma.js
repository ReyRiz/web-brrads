const express = require('express');
const { prisma } = require('../config/prisma');
const { authenticateToken, requireAdmin, requireModerator } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin and Moderator can view, only Admin can modify)
router.get('/', authenticateToken, requireModerator, async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {};

    if (search) {
      where.OR = [
        {
          username: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          fullName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          joinedDate: true,
          lastLogin: true,
          isActive: true,
          createdAt: true,
          bio: true,
          profileImage: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        joined_date: user.joinedDate,
        last_login: user.lastLogin,
        is_active: user.isActive,
        created_at: user.createdAt,
        bio: user.bio,
        profile_image: user.profileImage
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / parseInt(limit)),
        total_users: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get user by ID (Admin and Moderator can view all, users can view their own)
router.get('/:id', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  const requestingUser = req.user;

  // Check if user can access this profile
  if (requestingUser.id !== userId && !['admin', 'moderator'].includes(requestingUser.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        joinedDate: true,
        lastLogin: true,
        isActive: true,
        createdAt: true,
        bio: true,
        profileImage: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        joined_date: user.joinedDate,
        last_login: user.lastLogin,
        is_active: user.isActive,
        created_at: user.createdAt,
        bio: user.bio,
        profile_image: user.profileImage
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Update user role (Admin only)
router.patch('/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body;

  const validRoles = ['member', 'moderator', 'admin'];
  
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing own role
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        role: true,
        fullName: true,
        email: true
      }
    });

    res.json({ 
      message: `User role updated to ${role}`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        full_name: updatedUser.fullName,
        email: updatedUser.email
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Toggle user active status (Admin only)
router.patch('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ message: 'is_active must be a boolean' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deactivating own account
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own account status' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: is_active },
      select: {
        id: true,
        username: true,
        role: true,
        fullName: true,
        email: true,
        isActive: true
      }
    });

    res.json({ 
      message: `User ${is_active ? 'activated' : 'deactivated'}`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        role: updatedUser.role,
        full_name: updatedUser.fullName,
        email: updatedUser.email,
        is_active: updatedUser.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting own account
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete user and cascade delete related records
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully', deletedUser: user.username });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get user statistics (Admin and Moderator only)
router.get('/stats/dashboard', authenticateToken, requireModerator, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      moderatorUsers,
      memberUsers,
      newUsersThisMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'moderator' } }),
      prisma.user.count({ where: { role: 'member' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    res.json({
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      roles: {
        admin: adminUsers,
        moderator: moderatorUsers,
        member: memberUsers
      },
      new_this_month: newUsersThisMonth
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

// Get user activity summary (Admin and Moderator can view all, users can view their own)
router.get('/:id/activity', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  const requestingUser = req.user;

  // Check if user can access this profile
  if (requestingUser.id !== userId && !['admin', 'moderator'].includes(requestingUser.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const [
      gameRequestsCount,
      fanArtCount,
      recentGameRequests,
      recentFanArt
    ] = await Promise.all([
      prisma.gameRequest.count({ where: { requestedBy: userId } }),
      prisma.fanArt.count({ where: { submittedBy: userId } }),
      prisma.gameRequest.findMany({
        where: { requestedBy: userId },
        select: {
          id: true,
          gameName: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.fanArt.findMany({
        where: { submittedBy: userId },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    res.json({
      summary: {
        game_requests: gameRequestsCount,
        fan_art: fanArtCount
      },
      recent_activity: {
        game_requests: recentGameRequests.map(req => ({
          id: req.id,
          game_name: req.gameName,
          status: req.status,
          created_at: req.createdAt
        })),
        fan_art: recentFanArt.map(art => ({
          id: art.id,
          title: art.title,
          status: art.status,
          created_at: art.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Failed to get user activity' });
  }
});

module.exports = router;
