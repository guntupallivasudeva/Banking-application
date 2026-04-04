# Vercel Deployment Guide (Frontend + Backend)

## What is already prepared in this repo

- Frontend Vercel config: `frontend/vercel.json`
- Backend Vercel config: `backend/vercel.json`
- Backend serverless entrypoint: `backend/api/index.js`
- Backend app split for serverless/local runtime:
  - `backend/src/app.js`
  - `backend/src/db.js`
  - `backend/src/index.js`
- GitHub Actions CI: `.github/workflows/ci.yml`
- GitHub Actions CD (frontend): `.github/workflows/deploy-frontend-vercel.yml`
- GitHub Actions CD (backend): `.github/workflows/deploy-backend-vercel.yml`

## One-time setup on Vercel

1. Create Vercel project for frontend
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist/banking-frontend`

2. Create Vercel project for backend
- Root directory: `backend`
- Framework preset: Other
- Build command: leave default

3. Add backend environment variables in Vercel (Backend project)
- `MONGODB_URL` = your Mongo Atlas connection string including database path
- `JWT_SECRET` = strong secret

## Wire frontend to backend URL

After backend is deployed, copy backend production URL, for example:
- `https://banking-backend-xyz.vercel.app`

Then update:
- `frontend/src/index.html`
- `frontend/src/app/service/authservice.ts`

Replace placeholder:
- `https://YOUR-BACKEND-DOMAIN/api`

With:
- `https://banking-backend-xyz.vercel.app/api`

## GitHub Actions secrets required

Add these repository secrets in GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_FRONTEND_PROJECT_ID`
- `VERCEL_BACKEND_PROJECT_ID`

## How deployment works after setup

- Push changes to `main`
- Frontend changes under `frontend/**` trigger frontend deployment
- Backend changes under `backend/**` trigger backend deployment

## Local development still works

Backend local run:
- Set values in `backend/.env`
- Run backend as before with `npm run dev` inside backend folder

Frontend local run:
- `npm start` inside frontend folder
