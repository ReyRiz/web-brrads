# BRRADS EMPIRE

Website komunitas gaming untuk para BRRADS (Barudak Reza Edan Pars) - komunitas yang dibuat oleh YouTuber Reza Auditore.

## 🚀 Fitur Utama

### 🎮 Game Request System
- Submit game requests untuk dimainkan oleh Reza Auditore
- Sistem otomatis deteksi duplikasi game
- Status tracking: Pending → Approved → Played
- Upload screenshot/GIF game (opsional)
- Admin panel untuk review dan approval

### 🎨 Fan Art Gallery
- Upload dan showcase karya seni dari komunitas
- Review system oleh admin
- Gallery publik untuk approved fan arts
- Support multiple image formats (JPG, PNG, GIF, WebP)

### 🔐 Authentication System
- User registration dan login
- Role-based access (User/Admin)
- Protected routes untuk admin panel
- JWT-based authentication

### 👑 Admin Panel
- Dashboard dengan statistik lengkap
- Manage game requests (approve/reject/mark as played)
- Manage fan art submissions
- View dan delete content

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI Framework
- **Vite** - Build tool dan dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database (easy migration to production)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📦 Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd web-brrads
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   # Copy .env file and configure if needed
   # Default configuration should work for development
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```
   This will start both frontend (http://localhost:5173) and backend (http://localhost:5000)

   Alternatively, you can run them separately:
   ```bash
   # Terminal 1: Frontend only
   npm run client
   
   # Terminal 2: Backend only
   npm run server
   ```

## 🗄️ Database

Project menggunakan SQLite untuk development dengan setup otomatis:
- Database file: `database.sqlite` (akan dibuat otomatis)
- Tables: users, game_requests, fan_arts
- Auto-seeding dengan admin user default

### Default Admin Credentials
- **Username**: admin
- **Password**: admin123

## 📁 Project Structure

```
web-brrads/
├── public/
│   └── uploads/          # Uploaded images
├── server/               # Backend code
│   ├── config/
│   │   └── database.js   # Database setup
│   ├── middleware/
│   │   └── auth.js       # Authentication middleware
│   ├── routes/
│   │   ├── auth.js       # Auth endpoints
│   │   ├── gameRequests.js
│   │   └── fanArt.js
│   └── server.js         # Main server file
├── src/                  # Frontend code
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── GameRequests.jsx
│   │   ├── FanArt.jsx
│   │   └── AdminPanel.jsx
│   ├── utils/
│   │   ├── api.js
│   │   └── helpers.js
│   └── App.jsx
└── package.json
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Game Requests
- `GET /api/game-requests/all` - Get all requests (public)
- `POST /api/game-requests/submit` - Submit new request
- `PUT /api/game-requests/:id/status` - Update status (admin)
- `DELETE /api/game-requests/:id` - Delete request (admin)

### Fan Art
- `GET /api/fan-art/all` - Get approved fan arts (public)
- `POST /api/fan-art/submit` - Submit new fan art
- `GET /api/fan-art/admin/all` - Get all fan arts (admin)
- `PUT /api/fan-art/:id/status` - Update status (admin)
- `DELETE /api/fan-art/:id` - Delete fan art (admin)

## 🚀 Deployment

### Database Migration
SQLite database dapat mudah di-migrate ke production:

1. **PostgreSQL** (Recommended untuk production)
2. **MySQL/MariaDB**
3. **MongoDB**

Cukup update connection string di `server/config/database.js`

### Environment Variables untuk Production
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=your-production-database-url
FRONTEND_URL=https://your-domain.com
```

### Build untuk Production
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 🎨 Design System

### Colors
- **Primary**: Purple (`#9333ea`)
- **Secondary**: Yellow (`#eab308`)
- **Success**: Green (`#22c55e`)
- **Danger**: Red (`#ef4444`)
- **Warning**: Yellow (`#f59e0b`)

### Typography
- **Font Family**: Inter
- **Headings**: Bold (700-900)
- **Body**: Regular (400-500)

## 🔒 Security Features

- JWT token authentication
- Password hashing dengan bcrypt
- Rate limiting untuk API endpoints
- File upload validation
- CORS protection
- Helmet security headers
- Input sanitization

## 📱 Responsive Design

Website fully responsive dengan breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

Project ini dibuat untuk komunitas BRRADS Empire. 

## 🙏 Credits

- **Reza Auditore** - Content Creator & Community Leader
- **ReyRiz** - Developer
- **BRRADS Community** - Inspiration & Support

---

**DAKSBRRADS!** 🔥

Made with ❤️ for the BRRADS Empire Community
"# web-brrads" 
