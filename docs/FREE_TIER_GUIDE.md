# JobPilot AI - Zero-Cost Infrastructure & Free-Tier Guide

JobPilot AI is engineered to run at **$0.00** total monthly operational cost. This document details every free-tier service and public API integrated into the platform.

---

## 1. Public Job API Sources

Every job in JobPilot AI originates from authentic public job feeds without requiring paid scrapers, proxies, or authentication keys.

| Source | Endpoint Type | Authentication | Rate Limit | Terms of Use |
| :--- | :--- | :--- | :--- | :--- |
| **Remotive API** | Public JSON REST endpoint (`https://remotive.com/api/remote-jobs`) | None required | ~1 req / sec | Free public access for job boards and aggregators |
| **Greenhouse Boards** | Public company board API (`https://boards-api.greenhouse.io/v1/boards/{token}/jobs`) | None required | ~10 req / min per IP | Official public endpoint provided by Greenhouse for public career boards |
| **Lever Postings** | Public postings API (`https://api.lever.co/v0/postings/{company}`) | None required | Reasonable rate limit | Official public endpoint provided by Lever for job listings |
| **Arbeitnow API** | Open Job Board API (`https://www.arbeitnow.com/api/job-board-api`) | None required | Standard HTTP headers | Free open API for European and remote tech jobs |

---

## 2. Infrastructure Free Tiers

### Frontend: Cloudflare Pages
- **Cost**: $0.00 / month
- **Builds**: 500 builds / month
- **Bandwidth**: Unlimited
- **Requests**: Unlimited
- **Global Edge**: 300+ edge locations

### Backend: Node.js on Render / Railway Free
- **Cost**: $0.00 / month
- **RAM**: 512MB
- **CPU**: 0.1 vCPU shared
- **Limitations**: Free web services sleep after 15 minutes of inactivity; spin-up takes ~30 seconds.

### Database: MongoDB Atlas (M0 Free Tier)
- **Cost**: $0.00 / month
- **Storage**: 512MB (sufficient for ~150,000 job postings)
- **Connections**: 500 simultaneous connections
- **RAM**: Shared

### Local Dev Database: In-Memory MongoDB Server
- **Cost**: $0.00
- **Requirements**: None! Runs embedded in Node.js with zero external software required.

---

## 3. Rate Limit Management & Deduplication Strategy

To operate responsibly within public API rate limits:
1. **Deduplication Hash**: Every job posting receives a SHA-256 hash derived from `normalizedCompany::normalizedTitle::normalizedUrl`. Duplicate jobs are discarded before database writes.
2. **Backoff & Timeouts**: All adapter HTTP calls have 10-second timeouts and graceful catch blocks. If an API is temporarily slow, it logs the status in `SyncLog` and continues without crashing.
3. **Scheduled Ingestion**: Cron jobs run every 6 hours (`0 */6 * * *`) to avoid excessive polling.
