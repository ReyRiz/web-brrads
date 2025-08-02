const express = require('express');
const { prisma } = require('../config/prisma');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get current live stream
router.get('/current', async (req, res) => {
  try {
    const stream = await prisma.liveStream.findFirst({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        youtubeUrl: true,
        thumbnailUrl: true,
        description: true,
        startedAt: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ 
      stream: stream ? {
        id: stream.id,
        title: stream.title,
        youtube_url: stream.youtubeUrl,
        thumbnail_url: stream.thumbnailUrl,
        description: stream.description,
        started_at: stream.startedAt,
        created_at: stream.createdAt
      } : null
    });

  } catch (error) {
    console.error('Get current stream error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get all live streams (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [streams, totalCount] = await Promise.all([
      prisma.liveStream.findMany({
        include: {
          createdByUser: {
            select: {
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.liveStream.count()
    ]);

    res.json({
      streams: streams.map(stream => ({
        id: stream.id,
        title: stream.title,
        youtube_url: stream.youtubeUrl,
        thumbnail_url: stream.thumbnailUrl,
        description: stream.description,
        is_active: stream.isActive,
        created_by: stream.createdBy,
        created_by_username: stream.createdByUser?.username,
        created_at: stream.createdAt,
        started_at: stream.startedAt,
        ended_at: stream.endedAt
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(totalCount / parseInt(limit)),
        total_streams: totalCount,
        per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all streams error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Create new live stream (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  const { title, youtube_url, thumbnail_url, description } = req.body;

  if (!title || !youtube_url) {
    return res.status(400).json({ message: 'Title and YouTube URL are required' });
  }

  // Validate YouTube URL
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  if (!youtubeRegex.test(youtube_url)) {
    return res.status(400).json({ message: 'Invalid YouTube URL' });
  }

  try {
    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Deactivate current live streams
      await tx.liveStream.updateMany({
        where: {
          isActive: true
        },
        data: {
          isActive: false,
          endedAt: new Date()
        }
      });

      // Create new live stream
      return await tx.liveStream.create({
        data: {
          title,
          youtubeUrl: youtube_url,
          thumbnailUrl: thumbnail_url,
          description,
          isActive: true,
          createdBy: req.user.id,
          startedAt: new Date()
        }
      });
    });

    res.status(201).json({ 
      message: 'Live stream created successfully!',
      streamId: result.id 
    });

  } catch (error) {
    console.error('Create stream error:', error);
    res.status(500).json({ message: 'Error creating live stream' });
  }
});

// Update live stream (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const streamId = parseInt(req.params.id);
  const { title, youtube_url, thumbnail_url, description } = req.body;

  if (!title || !youtube_url) {
    return res.status(400).json({ message: 'Title and YouTube URL are required' });
  }

  // Validate YouTube URL
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  if (!youtubeRegex.test(youtube_url)) {
    return res.status(400).json({ message: 'Invalid YouTube URL' });
  }

  try {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId }
    });

    if (!stream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }

    const updatedStream = await prisma.liveStream.update({
      where: { id: streamId },
      data: {
        title,
        youtubeUrl: youtube_url,
        thumbnailUrl: thumbnail_url,
        description
      }
    });

    res.json({ 
      message: 'Live stream updated successfully!',
      stream: {
        id: updatedStream.id,
        title: updatedStream.title,
        youtube_url: updatedStream.youtubeUrl,
        thumbnail_url: updatedStream.thumbnailUrl,
        description: updatedStream.description
      }
    });

  } catch (error) {
    console.error('Update stream error:', error);
    res.status(500).json({ message: 'Error updating live stream' });
  }
});

// Toggle live stream active status (Admin only)
router.patch('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  const streamId = parseInt(req.params.id);

  try {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId }
    });

    if (!stream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }

    if (!stream.isActive) {
      // If activating this stream, deactivate all others first
      await prisma.liveStream.updateMany({
        where: {
          isActive: true,
          NOT: {
            id: streamId
          }
        },
        data: {
          isActive: false,
          endedAt: new Date()
        }
      });
    }

    const updatedStream = await prisma.liveStream.update({
      where: { id: streamId },
      data: {
        isActive: !stream.isActive,
        startedAt: !stream.isActive ? new Date() : stream.startedAt,
        endedAt: stream.isActive ? new Date() : null
      }
    });

    res.json({ 
      message: `Live stream ${updatedStream.isActive ? 'activated' : 'deactivated'} successfully!`,
      isActive: updatedStream.isActive
    });

  } catch (error) {
    console.error('Toggle stream error:', error);
    res.status(500).json({ message: 'Error toggling live stream status' });
  }
});

// Delete live stream (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const streamId = parseInt(req.params.id);

  try {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId }
    });

    if (!stream) {
      return res.status(404).json({ message: 'Live stream not found' });
    }

    await prisma.liveStream.delete({
      where: { id: streamId }
    });

    res.json({ message: 'Live stream deleted successfully!' });

  } catch (error) {
    console.error('Delete stream error:', error);
    res.status(500).json({ message: 'Error deleting live stream' });
  }
});

// Get dashboard statistics (Admin only)
router.get('/stats/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalStreams,
      activeStreams,
      streamThisMonth
    ] = await Promise.all([
      prisma.liveStream.count(),
      prisma.liveStream.count({ where: { isActive: true } }),
      prisma.liveStream.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      })
    ]);

    res.json({
      total: totalStreams,
      active: activeStreams,
      this_month: streamThisMonth
    });

  } catch (error) {
    console.error('Get stream stats error:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

module.exports = router;
