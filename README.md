# Inkwell — Modern Blog Platform

A production-ready, full-stack blog platform inspired by Medium and Dev.to. Built with React, Node.js, and MongoDB.

![Inkwell Preview](https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=400&fit=crop)

---

## ✨ Features

### Core
- 🔐 **JWT Authentication** — Register, login, persistent sessions
- ✍️ **Markdown Editor** — Write with live preview and syntax support
- 💬 **Nested Comments** — Threaded discussions with likes and replies
- 🏷️ **Tags & Categories** — Organize and filter content
- ❤️ **Like System** — Like posts and comments
- 🔖 **Bookmarks** — Save posts for later
- 👤 **User Profiles** — Public profiles with follower/following
- 👑 **Admin Panel** — Manage users, posts, categories
- 🌗 **Dark/Light Mode** — Persisted theme preference
- 📱 **Fully Responsive** — Mobile-first design
- 🔍 **Search & Filter** — Full-text search, category/tag filtering
- 📊 **Dashboard** — Analytics for your posts

### Tech
- ⚡ **Vite** for instant HMR
- 🎨 **Tailwind CSS** with custom design system
- 🎞️ **Framer Motion** for smooth animations
- 🛡️ **Helmet + Rate Limiting** for security
- 📖 **Reading progress bar** on post pages
- 💀 **Skeleton loaders** for every view
- 🔢 **Pagination** on blog listing

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone and setup

```bash
git clone https://github.com/yourname/inkwell.git
cd inkwell
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run seed    # Optional: seed with demo data
npm run dev     # Starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000/api
npm install
npm run dev     # Starts on http://localhost:5173
```

### Demo Accounts (after seeding)
| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@inkwell.dev      | Admin@123 |
| User  | sarah@inkwell.dev      | User@123  |
| User  | marcus@inkwell.dev     | User@123  |

---

## 🏗️ Project Structure

```
inkwell/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, me
│   │   ├── postController.js     # CRUD, like, bookmark
│   │   ├── commentController.js  # CRUD, like, replies
│   │   ├── userController.js     # Profile, follow, dashboard
│   │   └── adminController.js    # Stats, user mgmt
│   ├── middleware/
│   │   ├── auth.js               # JWT protect, adminOnly
│   │   ├── errorHandler.js       # Global error handler
│   │   └── validate.js           # express-validator
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   ├── users.js
│   │   ├── admin.js
│   │   └── categories.js
│   ├── utils/
│   │   └── seed.js               # Demo data seeder
│   ├── server.js                 # Express app entry
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   ├── Skeletons.jsx
    │   │   │   └── ProtectedRoute.jsx
    │   │   ├── blog/
    │   │   │   ├── PostCard.jsx
    │   │   │   └── MarkdownRenderer.jsx
    │   │   └── comment/
    │   │       └── CommentSection.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Auth state + actions
    │   │   └── ThemeContext.jsx   # Dark/light mode
    │   ├── hooks/
    │   │   └── index.js           # useDebounce, useReadingProgress, etc.
    │   ├── layouts/
    │   │   └── MainLayout.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── BlogPage.jsx       # List with search/filter
    │   │   ├── PostPage.jsx       # Single post
    │   │   ├── WritePage.jsx      # Create/edit editor
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── SettingsPage.jsx
    │   │   ├── AdminPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── services/
    │   │   └── api.js             # Axios instance + all API calls
    │   └── utils/
    │       └── helpers.js         # Formatting utilities
    └── .env.example
```

---

## 🔌 API Reference

### Auth
```
POST   /api/auth/register    { name, username, email, password }
POST   /api/auth/login       { email, password }
GET    /api/auth/me          🔒 Get current user
```

### Posts
```
GET    /api/posts            ?page=1&limit=10&search=&category=&tag=&sort=latest
GET    /api/posts/featured   Hero + trending + latest
GET    /api/posts/my/posts   🔒 Current user's posts
GET    /api/posts/:slug      Single post (by slug or ID)
POST   /api/posts            🔒 Create post
PUT    /api/posts/:id        🔒 Update post
DELETE /api/posts/:id        🔒 Delete post
PUT    /api/posts/:id/like   🔒 Toggle like
PUT    /api/posts/:id/bookmark 🔒 Toggle bookmark
```

### Comments
```
GET    /api/comments/:postId         All comments for a post
POST   /api/comments                 🔒 { content, postId, parentId? }
PUT    /api/comments/:id             🔒 Edit comment
DELETE /api/comments/:id             🔒 Delete comment
PUT    /api/comments/:id/like        🔒 Toggle like
```

### Users
```
GET    /api/users/:username          Public profile + posts
GET    /api/users/dashboard          🔒 Dashboard stats
PUT    /api/users/profile            🔒 Update profile
PUT    /api/users/password           🔒 Change password
PUT    /api/users/:id/follow         🔒 Toggle follow
```

### Admin (🔒👑)
```
GET    /api/admin/stats
GET    /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/posts/:id
POST   /api/admin/categories
DELETE /api/admin/categories/:id
```

---

## 🌍 Deployment

### Backend → Render / Railway

1. Create a new Web Service
2. Connect your repo
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=<strong-random-string>
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend → Vercel / Netlify

1. Import your repo
2. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.render.com/api
   ```
3. Build command: `npm run build`
4. Output directory: `dist`

### Database → MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user
3. Whitelist all IPs: `0.0.0.0/0`
4. Copy the connection string to `MONGO_URI`

---

## 🔒 Security Features

- **Helmet.js** — HTTP security headers
- **express-mongo-sanitize** — NoSQL injection prevention
- **express-rate-limit** — API rate limiting (100 req/15min, 10 auth req/15min)
- **bcryptjs** — Password hashing with salt rounds 12
- **JWT** — Stateless token auth with expiry
- **Input validation** — express-validator on all routes
- **CORS** — Whitelisted origin only
- **XSS** — xss-clean middleware

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Font Display | Playfair Display |
| Font Body | DM Sans |
| Font Mono | JetBrains Mono |
| Primary | #9333ea (ink-600) |
| Border radius | 12px (cards), 8px (inputs) |
| Transition | 200-300ms ease |

---

## 📄 License

MIT — free to use for portfolios, learning, and production.
