# 🧭 JobPilot AI

> **Find the right job. Apply smarter.**

A global, AI-powered job discovery and application management platform built with 100% free and open-source software.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node: >=18](https://img.shields.io/badge/Node-%3E%3D18-brightgreen.svg)
![React: 18](https://img.shields.io/badge/React-18-blue.svg)
![Cost: $0.00](https://img.shields.io/badge/Cost-%240.00%20Forever-success.svg)

---

## 🌟 Key Features

- **Zero Paid APIs / Zero Cost**: Never requires OpenAI, Gemini, Claude, or paid scraping services. Embeddings and matching run locally using open-source models and browser-native Transformers.js.
- **Authentic Public Job Ingestion**:
  - **Greenhouse Public Boards** (GitLab, Cloudflare, Stripe feeds)
  - **Lever Public Postings** (Automattic, Kinsta feeds)
  - **Remotive API** (Worldwide remote jobs)
  - **Arbeitnow API** (European tech postings)
  - Real job URLs, transparent company attribution, and automatic SHA-256 deduplication.
- **Explainable AI Matching Engine**:
  - Skills match (35%)
  - Experience compatibility (20%)
  - Role title similarity (15%)
  - Education match (10%)
  - Location & work mode (10%)
  - Employment type (5%)
  - Salary compatibility (5%)
  - Fully customizable weights with instant client-side recalculation and human-readable score justifications.
- **Resume Intelligence**:
  - Secure PDF upload and text parsing.
  - Heuristic extraction of contact info, technical skills, education degrees, work milestones, projects, and certifications.
  - Review-first workflow: Extracted data is presented to the user for verification before updating their profile.
- **Application Tracker**:
  - Interactive **Kanban Board** with 7 stages: `Saved`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.
  - Responsive **List/Table View** with search, sorting, and inline status updates.
  - Activity timelines, interview dates, salary tracking, and recruiter notes.
- **Real Analytics Dashboard**:
  - Real database-derived statistics: Total saved, submitted applications, interview rate, offer rate, success rate, and average AI match score.
  - Interactive weekly activity graph and job source distribution.
- **In-App Notifications**:
  - Alerts for newly discovered matching jobs, scheduled synchronization completions, and upcoming interview dates.
- **Premium Responsive SaaS UI**:
  - Built with React, Vite, Tailwind CSS, DaisyUI, and Lucide React.
  - One-click Light and Dark themes with persistent preferences.

---

## 🏗️ Architecture & Technology Stack

```mermaid
graph TD
    subgraph "Frontend (Cloudflare Pages)"
        ReactApp[React 18 + Vite SPA]
        TJS[Transformers.js Local Embeddings]
        DaisyUI[Tailwind CSS + DaisyUI Themes]
        Router[React Router 6]
    end

    subgraph "Backend (Node.js / Express)"
        API[Express REST API]
        Auth[JWT & Bcrypt Security]
        Cron[Node-Cron Scheduled Ingestion]
        Parser[ResumeParserService (pdf-parse)]
        RateLimit[Express Rate Limiter & Helmet]
    end

    subgraph "Job Ingestion Adapters"
        Remotive[Remotive API]
        Greenhouse[Greenhouse Public Boards]
        Lever[Lever Public Postings]
        Arbeitnow[Arbeitnow Open Feeds]
    end

    subgraph "Database Layer"
        Mongo[(MongoDB Atlas M0 or In-Memory Embedded Fallback)]
    end

    ReactApp -->|REST API| API
    TJS -->|Client In-Browser| ReactApp
    API --> Mongo
    API --> Auth
    Cron --> Remotive
    Cron --> Greenhouse
    Cron --> Lever
    Cron --> Arbeitnow
    Remotive --> API
    Greenhouse --> API
    Lever --> API
    Arbeitnow --> API
```

---

## 📁 Project Structure

```
JOBPILOT-AI/
├── client/                     # Frontend Single-Page Application
│   ├── public/
│   │   └── _redirects          # Cloudflare Pages SPA rewrite rules
│   ├── src/
│   │   ├── ai/                 # Client-side AI & similarity algorithms
│   │   │   ├── matcher.js      # Explainable weighted matching logic
│   │   │   ├── similarity.js   # Transformers.js embeddings & fallback
│   │   │   └── skillsTaxonomy.js
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ApplicationModal.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobModal.jsx
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── MatchExplanationModal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationDropdown.jsx
│   │   │   ├── ResumeUploader.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── context/            # Auth, Theme & Notification Contexts
│   │   ├── layouts/            # MainLayout & ProtectedRoute
│   │   ├── pages/              # Landing, Jobs, Tracker, Analytics, etc.
│   │   └── services/           # Axios API connectors
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                     # Backend API & Job Ingestion Engine
│   ├── src/
│   │   ├── config/             # DB, Environment & Constants
│   │   ├── controllers/        # Express Route Handlers
│   │   ├── jobs/               # Background Node-Cron Scheduler
│   │   ├── middleware/         # Auth, RateLimiter, Upload, ErrorHandler
│   │   ├── models/             # Mongoose Models (User, Job, Application, etc.)
│   │   ├── routes/             # REST Route Definitions
│   │   ├── services/
│   │   │   ├── adapters/       # Remotive, Greenhouse, Lever, Arbeitnow
│   │   │   ├── jobIngestionService.js
│   │   │   ├── matchingService.js
│   │   │   └── resumeParserService.js
│   │   ├── utils/              # Hash, SkillsTaxonomy, SeedData, Logger
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server startup script
│   ├── tests/                  # Vitest & Supertest automated test suite
│   └── package.json
│
├── docs/                       # Comprehensive documentation
│   ├── AI_ARCHITECTURE.md      # AI scoring math & Transformers.js setup
│   ├── API.md                  # REST endpoint documentation
│   ├── DEPLOYMENT.md           # Cloudflare Pages & free backend hosting
│   └── FREE_TIER_GUIDE.md      # Zero-cost infrastructure guide
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quickstart (Zero-Configuration Local Development)

JobPilot AI comes with an automatic **In-Memory MongoDB fallback** (`mongodb-memory-server`). You can run the entire stack immediately without installing or configuring external database software!

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/JOBPILOT-AI.git
cd JOBPILOT-AI

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Configure Environment (Optional for local dev)
Copy the example environment file:
```bash
cp .env.example .env
```
*(If `MONGODB_URI` is left blank, the server automatically boots an embedded in-memory database and auto-seeds baseline opportunities).*

### 3. Run Development Servers
Start both the backend API and frontend Vite dev server concurrently:
```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🧪 Running Automated Tests

Run backend unit and integration tests (auth flow, resume parser, explainable matcher, application pipeline, and analytics):

```bash
npm test
```

Sample output:
```bash
 ✓ tests/server.test.js (12 tests) 1248ms
 Test Files  1 passed (1)
      Tests  12 passed (12)
```

---

## 🔄 Live Job Ingestion CLI

Synchronize real public jobs from Greenhouse, Lever, Remotive, and Arbeitnow directly from your terminal:

```bash
npm run sync:jobs
```

---

## 🌐 Public Deployment (100% Free Tier)

| Component | Recommended Free Host | Configuration |
| :--- | :--- | :--- |
| **Frontend** | [Cloudflare Pages](https://pages.cloudflare.com/) | Build: `cd client && npm run build`, Output: `client/dist` |
| **Backend** | [Render](https://render.com/) or [Railway](https://railway.app/) | Build: `npm install`, Start: `npm start` in `server/` |
| **Database** | [MongoDB Atlas Free M0](https://www.mongodb.com/cloud/atlas) | 512MB free cluster with URI in `MONGODB_URI` |

Detailed step-by-step instructions are available in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 📄 License

This project is open-source and released under the **MIT License**.
