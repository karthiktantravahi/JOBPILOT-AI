# JobPilot AI - Production Deployment Guide

This guide details how to deploy **JobPilot AI** completely within free-tier cloud environments.

---

## Architecture Overview

```mermaid
graph LR
    User[User Browser] -->|HTTPS| CF[Cloudflare Pages\n(Client SPA)]
    CF -->|API Requests| Backend[Render / Railway / Fly\nNode.js Express API]
    Backend -->|Mongoose| Atlas[(MongoDB Atlas Free M0\nor In-Memory Fallback)]
    Backend -->|Public Feeds| Greenhouse[Greenhouse Boards]
    Backend -->|Public Feeds| Lever[Lever Postings]
    Backend -->|Public Feeds| Remotive[Remotive API]
    Backend -->|Public Feeds| Arbeitnow[Arbeitnow API]
```

---

## 1. Frontend Deployment: Cloudflare Pages

Cloudflare Pages provides 100% free hosting for single-page applications with unlimited bandwidth and global CDN edge routing.

### Step-by-Step Instructions:
1. Push your repository to GitHub or GitLab.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
3. Select **Create application** > **Pages** > **Connect to Git**.
4. Configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `cd client && npm install && npm run build` (or root build command `npm run build:client`)
   - **Build output directory**: `client/dist`
   - **Root directory**: `/`
5. Under **Environment variables**, set:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
6. Click **Save and Deploy**.
7. Routing: The `client/public/_redirects` file (`/* /index.html 200`) ensures client-side routing works on refresh.

---

## 2. Backend Deployment: Free-Tier Node.js (Render / Railway / Koyeb)

### Option A: Render.com (Recommended Free Tier)
1. Sign up at [Render.com](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your repository.
4. Configure settings:
   - **Name**: `jobpilot-api`
   - **Region**: Closest to your users (e.g. Oregon / Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Configure Environment Variables in the Render dashboard:
   ```env
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-jobpilot-app.pages.dev
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/jobpilot?retryWrites=true&w=majority
   JWT_SECRET=your_super_strong_production_jwt_secret_key_random_string
   JWT_EXPIRES_IN=7d
   ENABLE_CRON_SYNC=true
   JOB_SYNC_CRON=0 */6 * * *
   ```
6. **Health Check Path**: `/api/health`

### Render Free Tier Limitations:
- **Spin down on idle**: Render free instances spin down after 15 minutes of inactivity. The first request takes 30-50 seconds to boot.
- **Outbound bandwidth**: 100GB/month free.
- **Node Cron background jobs**: If the web service is asleep, scheduled cron triggers may pause until the next wake-up request. For 24/7 background cron without sleep, use a free UptimeRobot monitor hitting `/api/health` every 10 minutes.

---

## 3. Database: MongoDB Atlas (M0 Free Tier)

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster and select **M0 Free (Shared)** (512MB free storage, plenty for 100,000+ jobs and user profiles).
3. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
4. Under **Database Access**, create a database user and copy the secure password.
5. In your cluster dashboard, click **Connect** > **Drivers** (Node.js).
6. Copy the connection string and paste into your server `MONGODB_URI` environment variable.

### Fallback Mode (Zero-Config Development):
If `MONGODB_URI` is left blank, the server automatically starts an internal in-memory MongoDB instance (`mongodb-memory-server`) so you can run and test the complete stack locally with zero configuration required!

---

## 4. Verification and Health Check

Once deployed, visit your backend health endpoint:
```
GET https://your-backend-service.onrender.com/api/health
```
Expected response:
```json
{
  "status": "healthy",
  "service": "JobPilot AI Backend API",
  "uptime": 124.5,
  "timestamp": "2026-11-03T11:20:00.000Z",
  "environment": "production"
}
```
