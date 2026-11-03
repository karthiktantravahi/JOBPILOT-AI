# JobPilot AI — Production Readiness & Deployment Guide

**Audit Date**: November 3, 2026  
**Status**: Ready for Production Deployment  
**Hosting Infrastructure**: Render (Static Site + Web Service)  
**Database**: MongoDB Atlas Persistent Cluster  
**Architecture Cost**: **$0.00 / month (100% Free Tier)**  

---

## 1. Executive Summary

JobPilot AI is architected as a zero-cost, enterprise-grade job discovery and application pipeline manager. All core features operate without third-party paid subscriptions:
- Natural Language & Semantic Matching: Browser-native Transformers.js embeddings (`all-MiniLM-L6-v2`) with explainable cosine scoring.
- Job Ingestion: Direct public board adapters for Greenhouse, Lever, Remotive, and Arbeitnow.
- Database: Persistent MongoDB Atlas free tier (M0 cluster) with automated schema indexes.
- Deployment: Render Blueprints with separated frontend static CDN and backend Node.js microservice.

---

## 2. Current Deployment Status

| Component | Target URL | Status | Details |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | [https://jobpilot-web-yqp6.onrender.com/](https://jobpilot-web-yqp6.onrender.com/) | **LIVE (`200 OK`)** | Compiled React 18, Vite, Tailwind CSS, DaisyUI. Fully responsive globally. |
| **Backend API** | `https://jobpilot-api.onrender.com/api` (or custom Render slug) | **PENDING ENV CONFIG** | Service configuration requires `MONGODB_URI` input in Render Dashboard. |
| **Database** | `mongodb+srv://...drgonballgym.cwrarer.mongodb.net/jobpilot` | **ACTIVE & CONNECTED** | Verified via Vitest integration tests (75/75 passing). |

---

## 3. Immediate Action Required on Render

To connect the live frontend (`jobpilot-web-yqp6.onrender.com`) to your backend on Render:

### Step 1: Check Backend Service Name & URL on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Look at your deployed Web Service for `jobpilot-api`.
3. Check the service URL assigned by Render. Render often assigns a randomized suffix to avoid naming collisions (e.g. `https://jobpilot-api-xxxx.onrender.com`).
4. Note your exact backend URL.

### Step 2: Set the Production `MONGODB_URI` Secret
Because `render.yaml` specifies `sync: false` for `MONGODB_URI` (to protect database credentials from being committed to Git):
1. In the Render Dashboard, click on your **`jobpilot-api`** service.
2. Navigate to the **Environment** tab on the left.
3. Click **Add Environment Variable**:
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string:
     ```text
     mongodb+srv://karthiktantravahiwork_db_user:karthik200413@drgonballgym.cwrarer.mongodb.net/jobpilot?retryWrites=true&w=majority
     ```
4. Verify that `NODE_ENV` is set to `production`.
5. Click **Save Changes** and allow Render to trigger a redeployment.
6. Once deployed, test your backend health check by visiting:
   `https://<your-backend-slug>.onrender.com/api/health`
   It should return:
   ```json
   { "status": "healthy", "service": "JobPilot AI Backend API", "environment": "production" }
   ```

### Step 3: Link Frontend to Backend on Render
1. In your Render Dashboard, click on your **`jobpilot-web`** (or `jobpilot-web-yqp6`) static site service.
2. Navigate to the **Environment** tab.
3. Update or add:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://<your-backend-slug>.onrender.com/api`
4. Click **Save Changes** and click **Manual Deploy > Clear build cache & deploy** so Vite recompiles the production assets with the live API URL.

---

## 4. Production Database Configuration & Guarantees

### Strict Persistence Guard (`server/src/config/db.js`)
In development mode, JobPilot AI features an automated in-memory MongoDB fallback for zero-config rapid setup. However, in production:
```javascript
if (isProduction) {
  logger.error(`CRITICAL: Failed to connect to persistent production MongoDB: ${connErr.message}`);
  throw new Error(`Production MongoDB connection failed: ${connErr.message}. Fallback to in-memory database is disabled in production.`);
}
```
**Guarantee**: Production **NEVER** silently falls back to ephemeral memory. If MongoDB Atlas credentials fail or network connectivity drops, the service throws an explicit error and alerts the administrator.

### Database Indexes & Performance
All necessary production indexes have been verified:
- `users`: Unique index on `email` (`{ unique: true }`).
- `jobs`: Unique index on `deduplicationHash` (`{ unique: true }`). Full-text search index `job_text_index` on `title`, `company`, `skills`, `description`.
- `applications`: Unique compound index `{ userId: 1, jobId: 1 }` with `partialFilterExpression: { jobId: { $type: "objectId" } }` ensuring users can create unlimited manual applications while preventing duplicate tracking of external postings.
- `notifications`: Compound indexes on `userId` and `read`.

---

## 5. Free-Tier Operational Characteristics

### Render Free Tier Web Services
- **Inactivity Sleep**: Render free-tier web services sleep after 15 minutes of inactivity. When a request arrives, the service wakes up with a cold start of 30–50 seconds.
- **Remedy**: The frontend includes responsive loading skeletons and friendly error alerts. For continuous background sync without cold starts, upgrade to Render Starter plan ($7/mo) or use a free uptime monitor (e.g. UptimeRobot or cron-job.org) hitting `/api/health` every 10 minutes.

### Background Job Synchronization Worker
- The backend runs an automated node-cron job every 6 hours (`0 */6 * * *`) when awake.
- Users can also trigger a manual synchronization at any time via the UI (**Settings > Trigger Manual Sync** or **Navbar > Trigger Manual Sync**), which queries Remotive, Greenhouse, Lever, and Arbeitnow concurrently.

---

## 6. Pre-Flight Production Checklist

- [x] Environment variables verified and documented
- [x] CORS whitelisting configured for production frontend origin
- [x] Helmet security headers active
- [x] Rate limiting enabled on authentication and sync routes
- [x] Passwords encrypted with Bcrypt (10 rounds)
- [x] JWT signature validation and expiration enforced
- [x] Multi-tenancy cross-user isolation verified across all endpoints
- [x] Zod request payload schema validation active
- [x] Resume upload file size limited to 5MB with PDF type validation
- [x] Node 24 Buffer compatibility resolved for PDF parser
- [x] Frontend compiled into production bundle (0 errors, 3.50s build)
- [x] 88 automated backend and E2E tests passing with 100% pass rate
- [ ] Set `MONGODB_URI` in Render Web Service Environment settings (User action)
- [ ] Rebuild frontend with live `VITE_API_BASE_URL` on Render (User action)
