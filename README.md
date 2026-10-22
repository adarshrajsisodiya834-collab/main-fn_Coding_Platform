# main( ) — Code. Practise. Grow.

A full-stack online coding and practice platform with a brutalist, responsive UI. This repository includes a React/Vite frontend, FastAPI backend, relational data model, authentication, Judge0 execution integration, problem classification, user submission history, admin analytics, feedback collection, and deployment configuration.

## Included

- Six language options: C, C++, Java, Python, JavaScript, C#.
- Monaco editor, custom stdin, execution output and error states.
- Guest code execution; account-backed submission history and dashboard.
- Registration/login with bcrypt password hashing and JWT sessions.
- Pattern/topic/difficulty filters and a seeded starter problem library.
- Admin-only analytics and user-management APIs; real charts from database records.
- Feedback form, basic policy pages, FAQ, About, Features, Learn, responsive navigation.
- Ad/plugin placement placeholders for later AdSense/Cuelinks integration.
- PostgreSQL-compatible SQLAlchemy models; SQLite for local development.
- Vercel SPA rewrite and Docker backend deployment template.

## Local setup

Requirements: Python 3.12 and Node.js 20+.

### 1. Backend

```bash
cd backend
py -3.12 -m venv .venv     
.venv\Scripts\Activate.ps1          # Windows PowerShell
source .venv/bin/activate           # macOS/Linux: 
pip install -r requirements.txt
cp .env.example .env                # Windows: copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

SQLite database `codex.db` is created automatically and the initial problem library is seeded. Open `http://localhost:8000/docs` to inspect the API and `http://localhost:8000/api/health` for health status.

For an admin account, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before the first start. Use a strong password of at least 12 characters. Bootstrap only creates the admin when the configured email does not already exist. Never deploy with the example JWT secret.

### 2. Frontend

In another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Set `VITE_API_URL` to your backend's `/api` base URL for deployment.

### 3. Code execution

The frontend calls the backend, which calls Judge0. Configure `JUDGE0_API_URL` and, if your chosen provider requires it, `JUDGE0_API_KEY` on the backend only. Never put execution-provider credentials in `VITE_*` variables. The default URL is the public Judge0 CE endpoint; public endpoints can be rate-limited or unavailable, so use a provider whose current terms and quotas suit your usage before launch.

The execution API sets resource-limit fields and applies a basic per-process IP rate limit. For a public deployment, add a shared edge/API rate limiter and use a dedicated Judge0 instance or provider with explicit quotas. Confirm the provider accepts the submitted resource-limit fields before production.

## Deployment outline

### Frontend (Vercel)
1. Push this repository to GitHub.
2. Import the repository into Vercel and set the project root to `frontend`.
3. Build command: `npm run build`; output directory: `dist`.
4. Set `VITE_API_URL` to the deployed backend URL plus `/api`, for example `https://your-api.example.com/api`.
5. `frontend/vercel.json` handles client-side route rewrites.

### Backend (Docker host)
1. Deploy `backend/Dockerfile` to a host that supports a persistent web service.
2. Set `DATABASE_URL` to a managed PostgreSQL connection string.
3. Set a long random `JWT_SECRET`, `FRONTEND_ORIGINS` to the exact deployed frontend origin, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and Judge0 settings.
4. Ensure the database is backed up and TLS is enabled.
5. Verify `/api/health`, registration/login, each language, rate limits, and admin-only routes from the deployed origin.

Free-tier providers change their limits and may sleep or impose quotas. Verify the current terms, cold-start behaviour, storage persistence, and execution quotas before relying on a provider. Do not assume that a Vercel frontend can safely run arbitrary submitted code itself.

## Important production review items

- **Automated judging:** the current submission endpoint executes the submitted source and records its result, but it deliberately does not claim `Accepted` for the seeded LeetCode-style problems. Reliable automatic judging requires language-specific function harnesses, curated test cases, hidden tests, output normalisation, and per-problem time/memory limits. Implement and test those before marketing the platform as a full online judge.
- **Policy pages:** the included privacy/terms pages are starter copy, not legal advice. Replace them with reviewed policies and real operator contact details before launch.
- **Admin:** configure bootstrap credentials securely and verify that the account has the `admin` role. Admin analytics show database-backed activity, not synthetic sample figures.
- **Rate limiting:** in-process throttling is a safety net, not a distributed abuse-prevention system. Add provider/edge-level limits before public traffic.
- **Monitoring:** configure logs, error reporting, backups, and alerts appropriate to the selected host.
- **Ads/affiliate:** the UI reserves space only. Provider approval, consent handling, actual integration, and policy compliance are still required before ads are activated.
- **Data migration:** SQLAlchemy creates missing tables on startup; use Alembic migrations before making schema changes on a persistent production database.

## Quality checks

```bash
# frontend
cd frontend && npm install && npm run build
# backend
cd backend && pip install -r requirements.txt && python -m compileall app
```

## Stack

React, Vite, Monaco Editor, React Router, Recharts, Lucide, Axios, FastAPI, SQLAlchemy, PostgreSQL/SQLite, JWT, bcrypt, Judge0.
