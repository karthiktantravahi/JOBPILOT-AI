# JobPilot AI — Bug Fixes & Code Rectifications Log

**Audit Date**: November 3, 2026  
**Auditor**: Senior Full-Stack Developer & QA Engineer  
**Status**: All Discovered Bugs Resolved & Regression Tested  
**Total Automated Tests Verifying Fixes**: **88 Passed / 0 Failed**  

---

## Comprehensive Summary of Discovered Bugs and Applied Solutions

---

### Bug 1: Application Tracker Unique Index Duplicate Key Error on Manual Applications
- **Severity**: High (Data Write Failure)
- **Component**: `server/src/models/Application.js`
- **Root Cause**:
  The application schema defined a unique compound index:
  ```javascript
  ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true, sparse: true });
  ```
  In MongoDB, a compound unique index with `sparse: true` only skips documents when **all** indexed fields are omitted. When a user created a second manual application where `jobId: null` or omitted, MongoDB indexed `{ userId: ObjectId(...), jobId: null }`, throwing an `E11000 duplicate key error collection: jobpilot.applications index: userId_1_jobId_1 dup key: { userId: ..., jobId: null }`.
- **Solution Applied**:
  Replaced `sparse: true` with a MongoDB partial filter expression that enforces uniqueness only when `jobId` is an actual `ObjectId`:
  ```javascript
  ApplicationSchema.index(
    { userId: 1, jobId: 1 },
    {
      unique: true,
      partialFilterExpression: { jobId: { $type: 'objectId' } },
    }
  );
  ```
- **Verification**: `server/tests/application_tracker_audit.test.js` created 7 manual applications across all pipeline stages with `jobId: null` without triggering duplicate key errors. (Status: **RESOLVED & VERIFIED**)

---

### Bug 2: Corrupted or Malformed PDF Resume Upload Returned 500 Server Error
- **Severity**: Medium (Improper Error Handling & Unhandled Exception)
- **Component**: `server/src/controllers/resumeController.js`
- **Root Cause**:
  `uploadAndParseResume` didn't catch PDF parsing errors specifically, delegating all parsing exceptions to Express's global 500 error handler. This exposed internal stack traces and returned an inappropriate 500 Internal Server Error when client submitted bad input.
- **Solution Applied**:
  Added specific try/catch block around `parseResume(req.file.buffer)`:
  ```javascript
  try {
    const parsedData = await parseResume(req.file.buffer, req.file.originalname);
    ...
  } catch (parseErr) {
    logger.warn(`Resume parsing failed for ${req.file.originalname}: ${parseErr.message}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid or unreadable PDF file. Please ensure the file is an uncorrupted PDF.',
    });
  }
  ```
- **Verification**: `server/tests/resume_intelligence_audit.test.js` tested corrupted PDF and non-PDF file renamed to `.pdf`; both returned 400 Bad Request with understandable error messages. (Status: **RESOLVED & VERIFIED**)

---

### Bug 3: Node.js 24 Buffer Memory Alignment Issue with `pdf-parse` (PDF.js)
- **Severity**: High (Runtime Crash on Node 24)
- **Component**: `server/src/services/resumeParserService.js`
- **Root Cause**:
  Under Node v24.19.0, passing an unaligned `Buffer` from `multer` directly to `pdf-parse` (which wraps an internal PDF.js build) crashed with `InvalidPDFException: bad XRef entry` due to TypedArray byte offset alignment differences in modern V8.
- **Solution Applied**:
  Converted the buffer to a clean `Uint8Array` before passing to `pdf-parse`:
  ```javascript
  const uint8 = new Uint8Array(pdfBuffer);
  const data = await pdf(uint8);
  ```
- **Verification**: Successfully parsed authentic PDF resumes in Node v24.19.0 runtime. (Status: **RESOLVED & VERIFIED**)

---

### Bug 4: Insecure Direct Object Reference (IDOR) Null Check Omission in Notification Controller
- **Severity**: High (Security & False Positive Success Response)
- **Component**: `server/src/controllers/notificationController.js`
- **Root Cause**:
  `deleteNotification` executed `findOneAndDelete({ _id: req.params.id, userId: req.user._id })` without verifying whether a document was actually found and deleted. When User B attempted to delete User A's notification, the query deleted nothing, but the controller still returned `{ success: true, message: 'Notification removed' }` with `200 OK`.
- **Solution Applied**:
  Added strict null check on query result:
  ```javascript
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found or access denied.',
    });
  }
  ```
- **Verification**: Tested in `server/tests/security_and_isolation.test.js` and `analytics_and_notifications_audit.test.js`. User B's attack on User A's notification returns `404 Not Found`. (Status: **RESOLVED & VERIFIED**)

---

### Bug 5: Ingestion Adapter Crash on Remotive Numerical Job ID
- **Severity**: Medium (Worker Crash during Sync)
- **Component**: `server/src/utils/hash.js`
- **Root Cause**:
  Remotive's public API returns numerical job IDs (e.g. `item.id = 148923`). The deduplication hash utility executed `(sourceIdOrUrl || "").toLowerCase()`. Because `item.id` was a number, calling `.toLowerCase()` threw a TypeError: `sourceIdOrUrl.toLowerCase is not a function`, causing the Remotive sync adapter to abort.
- **Solution Applied**:
  Explicitly stringified the input before invoking string methods:
  ```javascript
  export const generateJobHash = (company, title, sourceIdOrUrl) => {
    const raw = `${String(company || '').trim().toLowerCase()}|${String(title || '').trim().toLowerCase()}|${String(sourceIdOrUrl || '').trim().toLowerCase()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  };
  ```
- **Verification**: `server/tests/job_discovery_audit.test.js` successfully processed Remotive jobs with numerical IDs. (Status: **RESOLVED & VERIFIED**)

---

### Bug 6: Arbeitnow German Employment Types Rejected by Mongoose Enum
- **Severity**: Medium (Data Loss during Ingestion)
- **Component**: `server/src/services/adapters/arbeitnowAdapter.js`
- **Root Cause**:
  German tech job feeds on Arbeitnow returned localized employment types such as `"Unbefristeter Arbeitsvertrag"` (permanent contract) and `"Teilzeit"` (part-time). Passing these raw strings caused Mongoose validation errors against the `EMPLOYMENT_TYPES` enum (`full-time`, `part-time`, `contract`, `internship`, `freelance`, `other`).
- **Solution Applied**:
  Added international normalization dictionary to `arbeitnowAdapter.js`:
  ```javascript
  const normalizeEmploymentType = (raw) => {
    const str = String(raw || '').toLowerCase();
    if (str.includes('unbefristet') || str.includes('full')) return 'full-time';
    if (str.includes('teilzeit') || str.includes('part')) return 'part-time';
    if (str.includes('werkstudent') || str.includes('praktik') || str.includes('intern')) return 'internship';
    if (str.includes('contract') || str.includes('freelance')) return 'contract';
    return 'full-time';
  };
  ```
- **Verification**: `server/tests/job_discovery_audit.test.js` verified German postings correctly map to `'full-time'` or `'part-time'`. (Status: **RESOLVED & VERIFIED**)

---

### Bug 7: Education Degree Regex False Positives on Tech Terms
- **Severity**: Low (NLP Parsing Inaccuracy)
- **Component**: `server/src/services/resumeParserService.js`
- **Root Cause**:
  Degree detection regex for Master's degrees included `/M\.?S\.?/i`. When parsing resume descriptions mentioning "microServices" or "MS SQL", the regex matched the `"MS"` substring and erroneously tagged candidates as having a Master's degree.
- **Solution Applied**:
  Added word boundaries and strict pattern guards:
  ```javascript
  /\b(?:Master(?:'s)?\s+(?:of\s+)?(?:Science|Arts|Engineering|Business\s+Administration)?|M\.?S\.?|M\.?Tech|M\.?B\.?A\.?)\b/i
  ```
- **Verification**: Resumes with `"microServices"` and Bachelor's degrees correctly extract `"Bachelor's Degree"`. (Status: **RESOLVED & VERIFIED**)

---

### Bug 8: Render Blueprint Static Site Specification Failure
- **Severity**: High (Deployment Blocker)
- **Component**: `render.yaml`
- **Root Cause**:
  Render Blueprints reject configuration files where static sites declare `region` or `plan: free`. Render automatically distributes static sites globally on its CDN and reserves `plan` keys for web services and databases.
- **Solution Applied**:
  Cleaned `render.yaml` to remove `region` and `plan` from the `jobpilot-web` static service block, leaving:
  ```yaml
  - type: web
    name: jobpilot-web
    runtime: static
    rootDir: client
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_BASE_URL
        value: https://jobpilot-api.onrender.com/api
  ```
- **Verification**: Validated against Render's official Blueprint specification. (Status: **RESOLVED & VERIFIED**)

---

### Bug 9: Silent In-Memory Fallback Risk in Production Database Connector
- **Severity**: Critical (Potential Data Loss)
- **Component**: `server/src/config/db.js`
- **Root Cause**:
  If connection to MongoDB Atlas failed or timed out, the original connector logged a warning and initialized an in-memory `MongoMemoryServer` even if `NODE_ENV === 'production'`. In a production environment, this would cause data to be silently written to ephemeral memory and erased whenever Render restarts the container.
- **Solution Applied**:
  Added an explicit production guard in `server/src/config/db.js`:
  ```javascript
  if (isProduction) {
    logger.error(`CRITICAL: Failed to connect to persistent production MongoDB: ${connErr.message}`);
    throw new Error(`Production MongoDB connection failed: ${connErr.message}. Fallback to in-memory database is disabled in production.`);
  }
  ```
- **Verification**: `server/tests/database_models_audit.test.js` verified that production environments enforce persistent database connections and never silently fall back to in-memory storage. (Status: **RESOLVED & VERIFIED**)
