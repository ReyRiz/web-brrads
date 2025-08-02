const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { prisma } = require('../config/prisma');
const { authenticateToken, requireAdmin, requireModerator } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/uploads/games');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'game-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed'));
    }
  }
});

// Submit new game request (Requires login)
router.post('/submit', authenticateToken, upload.single('image'), async (req, res) => {
  const { game_name, game_link, requester_name } = req.body;
  const userId = req.user.id;

  // Input validation and sanitization
  if (!game_name || typeof game_name !== 'string' || game_name.trim().length === 0) {
    return res.status(400).json({ message: 'Game name is required and must be valid text' });
  }

  if (!requester_name || typeof requester_name !== 'string' || requester_name.trim().length === 0) {
    return res.status(400).json({ message: 'Requester name is required and must be valid text' });
  }

  // Sanitize inputs
  const sanitizedGameName = game_name.trim().substring(0, 255);
  const sanitizedRequesterName = requester_name.trim().substring(0, 100);
  const sanitizedGameLink = game_link ? game_link.trim().substring(0, 500) : null;

  // Validate URL if provided
  if (sanitizedGameLink) {
    try {
      new URL(sanitizedGameLink);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid game link URL format' });
    }
  }

  try {
    // Check for spam: limit requests per user per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRequestCount = await prisma.gameRequest.count({
      where: {
        requestedBy: userId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (todayRequestCount >= 5) {
      return res.status(429).json({ 
        message: 'Daily request limit reached. You can only submit 5 game requests per day.' 
      });
    }

    // Check for duplicate game requests by the same user
    const existingRequest = await prisma.gameRequest.findFirst({
      where: {
        gameName: {
          mode: 'insensitive',
          equals: sanitizedGameName
        },
        requestedBy: userId
      }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You have already requested this game before.' 
      });
    }

    // Check for recent duplicate requests (within 1 hour) by any user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentDuplicate = await prisma.gameRequest.findFirst({
      where: {
        gameName: {
          mode: 'insensitive',
          equals: sanitizedGameName
        },
        createdAt: {
          gte: oneHourAgo
        }
      }
    });

    if (recentDuplicate) {
      return res.status(400).json({ 
        message: 'This game was recently requested. Please wait before requesting it again.' 
      });
    }

    // All validations passed, proceed with insertion
    const imagePath = req.file ? `/uploads/games/${req.file.filename}` : null;

    const newRequest = await prisma.gameRequest.create({
      data: {
        gameName: sanitizedGameName,
        gameLink: sanitizedGameLink,
        requesterName: sanitizedRequesterName,
        imagePath: imagePath,
        requestedBy: userId,
        status: 'pending'
      }
    });
    
    res.status(201).json({ 
      message: 'Game request submitted successfully',
      id: newRequest.id
    });

  } catch (error) {
    console.error('Game request submission error:', error);
    res.status(500).json({ message: 'Failed to submit game request' });
  }
});

// Get public game requests (only approved and played games)
router.get('/public', async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {
      status: {
        in: ['approved', 'played']
      }
    };

    if (search) {
      where.OR = [
        {
          gameName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          requesterName: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [requests, totalCount] = await Promise.all([
      prisma.gameRequest.findMany({
        where,
        include: {
          requestedByUser: {
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
      prisma.gameRequest.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      requests: requests.map(req => ({
        ...req,
        submitted_by_username: req.requestedByUser?.username
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get public requests error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get all game requests with admin information (Admin/Moderator only)
router.get('/admin', authenticateToken, requireModerator, async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where = {};

    if (search) {
      where.OR = [
        {
          gameName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          requesterName: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const [requests, totalCount] = await Promise.all([
      prisma.gameRequest.findMany({
        where,
        include: {
          requestedByUser: {
            select: {
              id: true,
              username: true
            }
          },
          duplicateOfRequest: {
            select: {
              id: true,
              gameName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.gameRequest.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get admin requests error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Get user's own game requests
router.get('/my-requests', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    const [requests, totalCount] = await Promise.all([
      prisma.gameRequest.findMany({
        where: {
          requestedBy: userId
        },
        include: {
          duplicateOfRequest: {
            select: {
              id: true,
              gameName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.gameRequest.count({
        where: {
          requestedBy: userId
        }
      })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ message: 'Database error' });
  }
});

// Update game request status (Admin/Moderator only)
router.patch('/:id/status', authenticateToken, requireModerator, async (req, res) => {
  const requestId = parseInt(req.params.id);
  const { status, rejection_reason, duplicate_of } = req.body;

  const validStatuses = ['pending', 'approved', 'rejected', 'played', 'duplicate'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  // Rejection reason is required for rejected status
  if (status === 'rejected' && (!rejection_reason || rejection_reason.trim().length === 0)) {
    return res.status(400).json({ message: 'Rejection reason is required for rejected requests' });
  }

  // Duplicate ID is required for duplicate status
  if (status === 'duplicate' && !duplicate_of) {
    return res.status(400).json({ message: 'Original request ID is required for duplicate status' });
  }

  try {
    // Verify the request exists
    const request = await prisma.gameRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({ message: 'Game request not found' });
    }

    // If marking as duplicate, verify the original request exists
    if (status === 'duplicate' && duplicate_of) {
      const originalRequest = await prisma.gameRequest.findUnique({
        where: { id: parseInt(duplicate_of) }
      });

      if (!originalRequest) {
        return res.status(400).json({ message: 'Original request not found' });
      }
    }

    // Update the request
    const updateData = {
      status,
      rejectionReason: status === 'rejected' ? rejection_reason?.trim() : null,
      duplicateOf: status === 'duplicate' ? parseInt(duplicate_of) : null,
      playedAt: status === 'played' ? new Date() : null
    };

    const updatedRequest = await prisma.gameRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        requestedByUser: {
          select: {
            username: true
          }
        },
        duplicateOfRequest: {
          select: {
            id: true,
            gameName: true
          }
        }
      }
    });

    res.json({ 
      message: `Game request ${status} successfully`,
      request: updatedRequest
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Failed to update request status' });
  }
});

// Delete game request (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  const requestId = parseInt(req.params.id);

  try {
    const request = await prisma.gameRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) {
      return res.status(404).json({ message: 'Game request not found' });
    }

    // Delete associated image file if it exists
    if (request.imagePath) {
      const fullPath = path.join(__dirname, '../../public', request.imagePath);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (fileError) {
        console.error('Error deleting image file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    await prisma.gameRequest.delete({
      where: { id: requestId }
    });

    res.json({ message: 'Game request deleted successfully' });

  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Failed to delete request' });
  }
});

// Get dashboard statistics (Admin/Moderator only)
router.get('/stats/dashboard', authenticateToken, requireModerator, async (req, res) => {
  try {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      playedRequests,
      rejectedRequests,
      duplicateRequests,
      todayRequests
    ] = await Promise.all([
      prisma.gameRequest.count(),
      prisma.gameRequest.count({ where: { status: 'pending' } }),
      prisma.gameRequest.count({ where: { status: 'approved' } }),
      prisma.gameRequest.count({ where: { status: 'played' } }),
      prisma.gameRequest.count({ where: { status: 'rejected' } }),
      prisma.gameRequest.count({ where: { status: 'duplicate' } }),
      prisma.gameRequest.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    res.json({
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      played: playedRequests,
      rejected: rejectedRequests,
      duplicate: duplicateRequests,
      today: todayRequests
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

module.exports = router;
