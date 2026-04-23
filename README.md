README.md

#  Echoes of Jannah

<div align="center">

![Echoes of Jannah Banner](https://via.placeholder.com/1200x400?text=Echoes+of+Jannah)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**A Full-Stack Spiritual Companion App for Connecting with the Quran**

[Live Demo](https://echoes-of-jannah.vercel.app) | [API Docs](https://api-docs.quran.foundation) | [Report Bug](https://github.com/iammaryam24/Echoes-Of-Jannah/issues)

</div>

---

## 📖 About The Project

**Echoes of Jannah** is a full-stack spiritual application that helps users build a deeper, more meaningful connection with the Quran. Unlike traditional Quran apps that focus solely on reading, Echoes of Jannah creates an emotional and personalized experience by connecting users' feelings with divine guidance from the Quran.

### 🎯 Problem Statement

Millions reconnect with the Quran during Ramadan, but many struggle to maintain that connection afterward. Echoes of Jannah solves this by:

- 🤝 **Emotionally engaging** users through personalized verse matching
- 📊 **Tracking progress** with gamification and analytics
- 👥 **Building community** through shared reflections
- 🎯 **Creating habits** with daily challenges and streaks

### ✨ Key Features

| Feature               | Description                                                    | Status |
|-----------------------|----------------------------------------------------------------|--------|
| 📖 **Quran Journey**  | Read, search, and listen to Quranic verses with translations   | ✅     |
| 💭 **Emotion Mirror** | Share feelings and receive relevant Quranic verses for guidance| ✅     |
| 🧬 **Spiritual DNA**  | Track spiritual growth, levels, and unlock achievements        | ✅     |
| 📅 **Life Timeline**  | Document life events and connect with Quranic wisdom           | ✅     |
| 👥 **Community Hub**  | Share reflections with fellow spiritual seekers                | ✅     |
| 🎯 **Daily Challenges**| Build consistent spiritual habits and earn XP                  | ✅     |
| 🎵 **Sacred Audio**   | Listen to beautiful Quran recitations by renowned reciters     | ✅     |
| 📊 **Advanced Analytics**| Deep insights into your spiritual journey with visual charts  | ✅     |

ARCHITECTURE:

                    ┌─────────────────────────────────────┐
                    │         User Browser                │
                    │    (React + Vite Frontend)          │
                    └─────────────┬───────────────────────┘
                                  │
                                  │ HTTPS / API Calls
                                  ▼
                    ┌─────────────────────────────────────┐
                    │      Backend Server (Node.js)        │
                    │         Express.js API               │
                    │                                      │
                    │  ┌──────────┐  ┌──────────┐        │
                    │  │  Auth    │  │  User    │        │
                    │  │  Routes  │  │  Routes  │        │
                    │  └──────────┘  └──────────┘        │
                    │  ┌──────────┐  ┌──────────┐        │
                    │  │ Content  │  │  Quran   │        │
                    │  │  Proxy   │  │   API    │        │
                    │  └──────────┘  │  Client  │        │
                    │                 └──────────┘        │
                    └─────────────┬───────────────────────┘
                                  │
                                  │ API Keys & Tokens
                                  ▼
                    ┌─────────────────────────────────────┐
                    │      Quran Foundation APIs          │
                    │                                      │
                    │  • Content API (Chapters/Verses)    │
                    │  • Audio API (Recitations)          │
                    │  • Tafsir API (Interpretations)     │
                    │  • Search API (Semantic Search)     │
                    │  • OAuth2 Auth API                  │
                    └─────────────────────────────────────┘

## 🛠️ Built With

### Frontend

| Technology          | Purpose                       |
|---------------------|-------------------------------|
| React 18            | UI library                    |
| Vite                | Build tool                    |
| Tailwind CSS        | Styling                       |
| Framer Motion       | Animations                    |
| Recharts            | Analytics charts              |
| React Hot Toast     | Notifications                 |

### Backend

| Technology          | Purpose                       |
|---------------------|-------------------------------|
| Node.js             | Runtime                       |
| Express.js          | Web framework                 |
| Express Session     | Session management            |
| Axios               | HTTP client                   |
| Helmet              | Security headers              |
| Compression         | Response compression          |
| Rate Limit          | DDoS protection               |

### APIs Used (Quran Foundation)

| API Category        | Endpoints                                      | Purpose                   |
|---------------------|------------------------------------------------|---------------------------|
| Content API         | `/chapters`, `/quran/verses/{script}`          | Get surahs and verses     |
| Audio API           | `/resources/recitations`, `/chapter_recitations/{id}` | Audio recitations     |
| Tafsir API          | `/tafsir`                                      | Verse interpretations     |
| Search API          | `/search`                                      | Semantic search           |
| Auth API            | OAuth2 endpoints                               | User authentication       |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/iammaryam24/Echoes-Of-Jannah.git
cd Echoes-Of-Jannah

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Create environment files
cp .env.example .env
cp backend/.env.example backend/.env
Environment Variables
Frontend (.env)
env
VITE_API_URL=http://localhost:3001
VITE_QURAN_API_BASE=https://api.quran.foundation/api/v1
Backend (backend/.env)
env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your-secret-key-here

# Quran Foundation API Credentials
PRELIVE_CLIENT_ID=your_client_id
PRELIVE_CLIENT_SECRET=your_client_secret
Running Locally
bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
Open http://localhost:5173

📁 Project Structure
text
echoes-of-jannah/
│
├── backend/                    # Backend server
│   ├── server.js              # Express server
│   ├── routes/                # API routes
│   ├── middleware/            # Auth middleware
│   ├── utils/                 # Utility functions
│   └── package.json
│
├── src/                       # Frontend source
│   ├── api/                   # API integration
│   ├── components/            # React components
│   ├── contexts/              # Context providers
│   ├── hooks/                 # Custom hooks
│   ├── pages/                 # Page components
│   ├── utils/                 # Helper functions
│   ├── App.jsx                # Main app
│   └── main.jsx               # Entry point
│
├── public/                    # Static assets
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
🔐 API Integration
Quran Foundation APIs Implemented
javascript
// 1. Content API - Get all surahs
GET /api/chapters

// 2. Verses API - Get verses with Arabic text
GET /api/verses?chapter=1&script=uthmani

// 3. Audio API - Get recitations
GET /api/recitations
GET /api/chapter-recitations/{reciterId}

// 4. Tafsir API - Get interpretations
GET /api/tafsir?chapter=1&verse=1

// 5. Search API - Semantic search
GET /api/search?q=mercy
Backend Endpoints
Method	Endpoint	Description
GET	/api/chapters	Get all surahs
GET	/api/verses	Get verses by chapter
GET	/api/recitations	Get reciters list
GET	/api/tafsir	Get verse tafsir
GET	/api/search	Search Quran
POST	/api/bookmarks	Save bookmark
GET	/api/bookmarks	Get user bookmarks
POST	/api/reading-sessions	Track reading
GET	/api/streaks	Get user streaks
1.	Go to Cyclic.sh
2.	Sign up with GitHub
3.	Click "Link Your Own" → select your repo
4.	Set:
o	Build Command: cd backend && npm install
o	Start Command: cd backend && node server.js
5.	Click "Deploy"
Deploy Frontend (Vercel)
bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
Or connect your GitHub repo to Vercel for automatic deployments.
