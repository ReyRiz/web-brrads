# BRRADS EMPIRE - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React application for "BRRADS EMPIRE" - a community website for YouTuber Reza Auditore with the following features:

## Key Features
- **Authentication System**: Admin and user roles
- **Game Request System**: Users can submit game requests with automatic duplicate detection
- **Admin Panel**: Review and manage game requests and fan art submissions
- **Fan Art System**: Submit and review fan art
- **Responsive Design**: Mobile-first approach
- **Database**: SQLite for local development, easily migrable to production

## Technology Stack
- **Frontend**: React with Vite, React Router, Axios
- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Authentication**: JWT tokens with bcrypt
- **File Upload**: Multer for image/GIF uploads
- **Security**: Helmet, rate limiting

## Code Style Guidelines
- Use functional components with hooks
- Follow React best practices
- Use responsive CSS (mobile-first)
- Implement proper error handling
- Use semantic HTML elements
- Keep components modular and reusable

## Database Schema
- Users (id, username, password, role, created_at)
- GameRequests (id, game_name, game_link, requester_name, image_path, status, requested_by, duplicate_of, played_at, created_at)
- FanArts (id, title, artist_name, image_path, status, description, submitted_by, created_at)

## Security Considerations
- Validate all user inputs
- Sanitize file uploads
- Use proper authentication middleware
- Implement rate limiting
- Use HTTPS in production
