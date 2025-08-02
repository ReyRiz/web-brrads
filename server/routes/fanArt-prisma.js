const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { prisma } = require('../config/prisma');
const { authenticateToken, requireAdmin, requireModerator } = require('../middleware/auth');

const router = express.Router();

// Configure multer for fan art uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/fanart');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'fanart-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit for fan art
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'));
    }
  }
});

// Submit new fan art (Requires login)
router.post('/submit', authenticateToken, upload.single('image'), async (req, res) => {
  const { title, artist_name, description } = req.body;
  const userId = req.user.id;

  // Input validation and sanitization
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ message: 'Title is required and must be valid text' });
  }

  if (!artist_name || typeof artist_name !== 'string' || artist_name.trim().length === 0) {
    return res.status(400).json({ message: 'Artist name is required and must be valid text' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  // Sanitize inputs
  const sanitizedTitle = title.trim().substring(0, 255);
  const sanitizedArtistName = artist_name.trim().substring(0, 100);
  const sanitizedDescription = description ? description.trim().substring(0, 1000) : null;

  try {
    // Check for spam: limit submissions per user per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySubmissionCount = await prisma.fanArt.count({
      where: {
        submittedBy: userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (todaySubmissionCount >= 3) {
      return res.status(429).json({ 
        message: 'Daily submission limit reached. You can only submit 3 fan art pieces per day.' 
      });
    }

    // All validations passed, proceed with insertion
    const imagePath = `/uploads/fanart/${req.file.filename}`;

    const newFanArt = await prisma.fanArt.create({
      data: {
        title: sanitizedTitle,
        artistName: sanitizedArtistName,
        description: sanitizedDescription,
        imagePath: imagePath,
        submittedBy: userId,
        status: 'pending'
      }
    });
    
    res.status(201).json({ 
      message: 'Fan art submitted successfully! It will be reviewed before being published.',
      id: newFanArt.id
    });

  } catch (error) {
    console.error('Fan art submission error:', error);
    res.status(500).json({ message: 'Failed to submit fan art' });
  }
});

// Get public fan art (only approved pieces)
router.get('/public', async (req, res) => {
  const { search, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {
      status: 'approved'
    };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          artistName: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [fanArts, totalCount] = await Promise.all([
      prisma.fanArt.findMany({
        where,
        include: {
          submittedByUser: {
            select: {
              username: true
            }
          },
          approvedByUser: {
            select: {
              username: true
            }
          }
        },
        orderBy: {
          approvedAt: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.fanArt.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      fanArts: fanArts.map(art => ({
        id: art.id,
        title: art.title,
        artist_name: art.artistName,
        description: art.description,
        image_path: art.imagePath,
        status: art.status,
        submitted_by_username: art.submittedByUser?.username,
        approved_by_username: art.approvedByUser?.username,
        approved_at: art.approvedAt,
        created_at: art.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get public fan art error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get all fan art with admin information (Admin/Moderator only)
router.get('/admin', authenticateToken, requireModerator, async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {};

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          artistName: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [fanArts, totalCount] = await Promise.all([
      prisma.fanArt.findMany({
        where,
        include: {
          submittedByUser: {
            select: {
              id: true,
              username: true
            }
          },
          approvedByUser: {
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
      prisma.fanArt.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      fanArts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get admin fan art error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get user's own fan art submissions
router.get('/my-submissions', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [fanArts, totalCount] = await Promise.all([
      prisma.fanArt.findMany({
        where: {
          submittedBy: userId
        },
        include: {
          approvedByUser: {
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
      prisma.fanArt.count({
        where: {
          submittedBy: userId
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      fanArts: fanArts.map(art => ({
        id: art.id,
        title: art.title,
        artist_name: art.artistName,
        description: art.description,
        image_path: art.imagePath,
        status: art.status,
        approved_by_username: art.approvedByUser?.username,
        approved_at: art.approvedAt,
        created_at: art.createdAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user fan art error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Update fan art status (Admin/Moderator only)
router.patch('/:id/status', authenticateToken, requireModerator, async (req, res) => {
  const fanArtId = parseInt(req.params.id);
  const { status } = req.body;
  const moderatorId = req.user.id;

  const validStatuses = ['pending', 'approved', 'rejected'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Verify the fan art exists
    const fanArt = await prisma.fanArt.findUnique({
      where: { id: fanArtId }
    });

    if (!fanArt) {
      return res.status(404).json({ message: 'Fan art not found' });
    }

    // Update the fan art
    const updateData = {
      status,
      approvedBy: status === 'approved' ? moderatorId : null,
      approvedAt: status === 'approved' ? new Date() : null
    };

    const updatedFanArt = await prisma.fanArt.update({
      where: { id: fanArtId },
      data: updateData,
      include: {
        submittedByUser: {
          select: {
            username: true
          }
        },
        approvedByUser: {
          select: {
            username: true
          }
        }
      }
    });

    res.json({ 
      message: `Fan art ${status} successfully`,
      fanArt: updatedFanArt
    });

  } catch (error) {
    console.error('Update fan art status error:', error);
    res.status(500).json({ message: 'Failed to update fan art status' });
  }
});

// Delete fan art (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const fanArtId = parseInt(req.params.id);

  try {
    const fanArt = await prisma.fanArt.findUnique({
      where: { id: fanArtId }
    });

    if (!fanArt) {
      return res.status(404).json({ message: 'Fan art not found' });
    }

    // Delete associated image file if it exists
    if (fanArt.imagePath) {
      const fullPath = path.join(__dirname, '../../public', fanArt.imagePath);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (fileError) {
        console.error('Error deleting image file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    await prisma.fanArt.delete({
      where: { id: fanArtId }
    });

    res.json({ message: 'Fan art deleted successfully' });

  } catch (error) {
    console.error('Delete fan art error:', error);
    res.status(500).json({ message: 'Failed to delete fan art' });
  }
});

// Get dashboard statistics (Admin/Moderator only)
router.get('/stats/dashboard', authenticateToken, requireModerator, async (req, res) => {
  try {
    const [
      totalFanArts,
      pendingFanArts,
      approvedFanArts,
      rejectedFanArts,
      todayFanArts
    ] = await Promise.all([
      prisma.fanArt.count(),
      prisma.fanArt.count({ where: { status: 'pending' } }),
      prisma.fanArt.count({ where: { status: 'approved' } }),
      prisma.fanArt.count({ where: { status: 'rejected' } }),
      prisma.fanArt.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    res.json({
      total: totalFanArts,
      pending: pendingFanArts,
      approved: approvedFanArts,
      rejected: rejectedFanArts,
      today: todayFanArts
    });

  } catch (error) {
    console.error('Get fan art dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

module.exports = router;
