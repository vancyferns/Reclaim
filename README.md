# 🌱 Reclaim

**Open-Source Accountability Infrastructure for Voluntary Behavioral Self-Regulation**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Reclaim is a privacy-first, open-source accountability platform designed for individuals who voluntarily seek to regulate compulsive adult content consumption that interferes with productivity, relationships, or mental well-being.

> Freedom from compulsive behavior should not be restricted by paywalls.

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT + bcrypt password hashing
- 🔥 **Streak Tracking** — Daily check-ins, current/longest streak, relapse count
- 🛡️ **Emergency Urge Mode** — Delay timer, breathing exercises, grounding, motivational prompts
- 🤝 **Accountability Partners** — Consent-driven email notifications
- 📊 **Smart Analytics** — Trigger patterns, mood tracking, visual insights with Chart.js
- 🔒 **Privacy First** — No browsing history, no screenshots, no third-party analytics
- 🐳 **Self-Hostable** — Docker support for easy deployment

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS v4 |
| Charts | Chart.js + react-chartjs-2 |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| DevOps | Docker, Docker Compose |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

### 1. Clone & Install

```bash
git clone https://github.com/vancyferns/Reclaim.git
cd Reclaim

# Install backend dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

### 3. Start with Docker (Recommended)

```bash
docker-compose up -d
```

This starts PostgreSQL, the backend API, and the frontend.

### 4. Start Without Docker

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
```

### 5. Open

Navigate to `http://localhost:5173`

## 📁 Project Structure

```
Reclaim/
├── client/                  # React + Vite Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   └── services/        # API service layer
│   └── package.json
├── server/                  # Node.js + Express Backend
│   ├── src/
│   │   ├── config/          # DB, env, schema init
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, validation
│   │   └── routes/          # API route definitions
│   └── package.json
├── extension/               # Browser Extension (Week 4)
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile (auth) |

### Streaks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/streak` | Get current streak |
| POST | `/api/streak/checkin` | Daily check-in |
| POST | `/api/streak/relapse` | Log relapse |
| GET | `/api/streak/history` | Relapse history |
| GET | `/api/streak/analytics` | Analytics data |

### Emergency Mode
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emergency/start` | Start session |
| PUT | `/api/emergency/:id/complete` | Complete session |
| GET | `/api/emergency/history` | Session history |
| GET | `/api/emergency/motivation` | Random prompt |

### Partners
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/partners` | Add partner |
| GET | `/api/partners` | List partners |
| DELETE | `/api/partners/:id` | Remove partner |

## 🛡️ Core Principles

1. **Voluntary Participation** — Users explicitly enable every feature
2. **Privacy First** — No browsing history tracking, no screenshots, no spying
3. **Transparency** — Fully open-source, audit the code
4. **Behavioral Science** — Focused on accountability and interruption, not moral policing

## 🔒 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT token authentication
- Rate limiting on auth endpoints (20 req/15min)
- Global API rate limiting (100 req/15min)
- Helmet.js security headers
- Input validation on all endpoints
- No third-party analytics or tracking

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🤝 Contributing

PRs are welcome! Please read the contribution guidelines before submitting.

---

*Built with purpose. Made in India. 🇮🇳*