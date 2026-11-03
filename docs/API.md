# JobPilot AI - REST API Reference

Base URL: `http://localhost:5000/api` (Development) or `https://<your-host>/api` (Production)

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new user account and returns a JWT token.
- **Body**:
  ```json
  {
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Response** (201):
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "_id": "...", "name": "Alex Johnson", "email": "alex@example.com", "profile": { ... } }
  }
  ```

### `POST /api/auth/login`
Authenticates user credentials and issues a JWT token.
- **Body**:
  ```json
  { "email": "alex@example.com", "password": "Password123!" }
  ```

### `GET /api/auth/me`
Returns the currently authenticated user document.
- **Headers**: `Authorization: Bearer <token>`

---

## 2. Profile Endpoints

### `GET /api/profile`
Fetches user profile, skills, experience, and match settings.

### `PUT /api/profile`
Updates user profile fields.
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "headline": "Senior Full Stack Engineer",
    "skills": ["React", "Node.js", "TypeScript", "PostgreSQL"],
    "preferredWorkModes": ["remote"],
    "expectedSalary": { "min": 120000, "max": 160000 }
  }
  ```

### `PUT /api/profile/match-settings`
Updates custom weights and minimum threshold.
- **Body**:
  ```json
  {
    "weights": { "skills": 0.40, "experience": 0.20, "location": 0.15 },
    "minScore": 50,
    "enableAI": true
  }
  ```

---

## 3. Resume Intelligence Endpoints

### `POST /api/resume/upload`
Uploads a PDF resume and parses text without modifying the existing profile.
- **Headers**: `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`
- **Form Data**: `resume: <file.pdf>`
- **Response** (200):
  ```json
  {
    "success": true,
    "extractedData": {
      "name": "Alex Johnson",
      "phone": "(555) 123-4567",
      "skills": ["JavaScript", "React", "Node.js"],
      "education": [...],
      "experience": [...]
    }
  }
  ```

### `POST /api/resume/confirm`
Merges user-verified resume entities into the user profile.
- **Headers**: `Authorization: Bearer <token>`

---

## 4. Job Discovery Endpoints

### `GET /api/jobs`
Searches discovered jobs with filters.
- **Query Parameters**:
  - `q`: Search keyword across title, company, skills
  - `workMode`: `remote`, `hybrid`, `onsite`
  - `employmentType`: `full-time`, `contract`, `part-time`
  - `experienceLevel`: `entry`, `mid`, `senior`, `lead`
  - `source`: `Remotive`, `Greenhouse`, `Lever`, `Arbeitnow`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)

### `GET /api/jobs/recommended`
Returns jobs ranked by AI Match Percentage for the authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**: `minScore` (e.g. 40)

### `GET /api/jobs/:id`
Retrieves a single job posting by ID.

---

## 5. Application Tracker Endpoints

### `GET /api/applications`
Retrieves tracked applications for the authenticated user.
- **Query Parameters**: `status` (`SAVED`, `APPLIED`, `INTERVIEW`, etc.)

### `POST /api/applications`
Adds an application to tracker.
- **Body**:
  ```json
  {
    "jobId": "optional_job_id",
    "company": "Stripe",
    "jobTitle": "Full Stack Engineer",
    "status": "APPLIED",
    "appliedDate": "2026-11-03T00:00:00.000Z"
  }
  ```

### `PATCH /api/applications/:id/status`
Updates status and records transition in the timeline.
- **Body**:
  ```json
  { "status": "INTERVIEW", "note": "Passed preliminary recruiter screening" }
  ```

### `DELETE /api/applications/:id`
Removes an application from tracker.

---

## 6. Analytics & Synchronization Endpoints

### `GET /api/analytics`
Returns database-derived metrics, weekly activity, and pipeline funnel.

### `GET /api/sync/status`
Returns ingestion statistics, active jobs per source, and sync logs.

### `POST /api/sync/manual`
Triggers immediate synchronization across all adapters.
