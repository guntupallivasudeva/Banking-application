# Banking Application

A full-stack banking and loan management application with:

- Angular frontend for customers and admins
- Node.js + Express REST API backend
- MongoDB for persistent storage
- JWT-based authentication and role-based authorization

The app supports common banking workflows such as account management, deposits, withdrawals, transfers, loan applications, repayment tracking, and admin loan review/approval.

## Table of Contents

- Overview
- Core Features
- Tech Stack
- Architecture
- Project Structure
- Prerequisites
- Local Setup (Recommended)
- Docker Setup
- Environment Variables
- API Endpoints
- Deployment (Vercel)
- Testing
- Troubleshooting

## Overview

This project is organized as a monorepo with two main apps:

- frontend: Angular SPA for user/admin interfaces
- backend: Express API serving auth, account, loan, and admin operations

The frontend communicates with the backend through `/api/*` endpoints. The backend uses MongoDB via Mongoose models and middleware-protected routes.

## Core Features

### Customer Features

- User signup and login
- Open bank accounts (Savings, Current, Fixed)
- View personal accounts
- Deposit and withdraw funds
- Transfer funds between accounts
- Apply for loans
- View own loan details and repayment schedule
- Pay loan installments

### Admin Features

- Admin login
- View all loan applications
- Approve or decline loans
- View detailed loan + account context
- View repayment summaries across users

### Platform Features

- JWT token authentication (`Authorization: Bearer <token>`)
- Role checks for admin-only endpoints
- MongoDB transaction usage in transfer/payment/approval flows
- Health endpoint for uptime checks: `/api/health`

## Tech Stack

### Frontend

- Angular 20
- RxJS
- Angular Router
- TailwindCSS (configured)

### Backend

- Node.js (ES modules)
- Express 5
- Mongoose
- Joi validation
- JSON Web Tokens (`jsonwebtoken`)
- `bcryptjs` for password hashing

### Infrastructure

- MongoDB (local or Atlas)
- Docker and Docker Compose
- Vercel deployment support for frontend and backend

## Architecture

1. User interacts with Angular app.
2. Angular services call backend REST endpoints.
3. Backend validates request + auth token.
4. Controllers execute business logic and persist data via Mongoose.
5. Backend returns JSON responses to frontend.

Authentication and authorization:

- Auth middleware verifies JWT and attaches user payload to request.
- Admin middleware allows only `role === "admin"` on protected admin routes.

## Project Structure

```
Banking-application/
	backend/
		api/index.js                  # Vercel serverless handler
		src/
			app.js                      # Express app and route mounting
			index.js                    # Local runtime entry
			db.js                       # MongoDB connection helper
			controllers/                # Route handlers
			middleware/                 # Auth + admin guards
			models/                     # Mongoose schemas
			routes/                     # API route definitions
			utils/loanUtils.js          # Repayment schedule utility
	frontend/
		src/
			app/components/             # UI screens/components
			app/service/                # HTTP service layer
			app/guards/admin.guard.ts   # Admin route guard
			app/app.routes.ts           # Client-side routes
			index.html                  # Runtime API base injection
			environments/               # Angular env files
	docker-compose.yml
	DEPLOY-VERCEL.md
```

## Prerequisites

Install the following before setup:

- Node.js 18+
- npm 9+
- MongoDB (local) OR MongoDB Atlas connection string
- Docker Desktop (optional, for containerized setup)

## Local Setup (Recommended)

### 1. Install Dependencies

From project root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Backend Environment

Create file `backend/.env`:

```env
MONGODB_URL=mongodb://127.0.0.1:27017/banking-app
JWT_SECRET=replace_with_a_long_random_secret
PORT=8000
```

Notes:

- Use your MongoDB Atlas URI instead of local URI if preferred.
- `JWT_SECRET` must be set, otherwise protected endpoints cannot validate tokens.

### 3. Start Backend

```bash
cd backend
npm run dev
```

Backend default URL:

- http://localhost:8000/api
- Health check: http://localhost:8000/api/health

### 4. Start Frontend

In a new terminal:

```bash
cd frontend
npm start
```

Frontend default URL:

- http://localhost:4200

The frontend auto-targets `http://localhost:8000/api` on localhost via runtime API injection in `frontend/src/index.html`.

## Docker Setup

This repository includes `docker-compose.yml` with 3 services:

- `mongo` on port 27017
- `backend` on port 8000
- `frontend` on port 8080

### 1. Update Compose Environment Values

In `docker-compose.yml`, set real values for:

- `MONGODB_URL`
- `JWT_SECRET`

Example (local Docker network):

```yaml
environment:
	- MONGODB_URL=mongodb://mongo:27017/banking-app
	- JWT_SECRET=replace_with_a_long_random_secret
```

### 2. Build and Run

```bash
docker compose up --build
```

### 3. Access App

- Frontend: http://localhost:8080
- Backend API: http://localhost:8000/api

## Environment Variables

### Backend (`backend/.env`)

- `MONGODB_URL` (required): MongoDB connection string
- `JWT_SECRET` (required): secret used to sign and verify JWT
- `PORT` (optional): backend listening port (defaults to 8000)

### Frontend

Frontend API base is provided at runtime using `window.API_KEY` from `frontend/src/index.html`.

Default behavior:

- localhost -> `http://localhost:8000/api`
- non-localhost -> configured Vercel backend URL

## API Endpoints

Base URL:

- Local: `http://localhost:8000/api`

### Health

- `GET /health`

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/admin/login`
- `PUT /auth/:id` (auth required)
- `DELETE /auth/:id` (auth required)

### Accounts (auth required)

- `POST /accounts` -> create account
- `GET /accounts` -> list user accounts
- `POST /accounts/:id/deposit`
- `POST /accounts/:id/withdraw`
- `POST /accounts/transfer`
- `DELETE /accounts/:id`

### Loans (auth required)

- `POST /loans/apply`
- `GET /loans/myloans`
- `GET /loans/:id`
- `PATCH /loans/:id/status` (admin only)
- `GET /loans/:id/repayments`
- `POST /loans/:id/pay`

### Admin (auth + admin required)

- `GET /admin/loans`
- `PUT /admin/loans/:id/approve`
- `PUT /admin/loans/:id/decline`
- `GET /admin/loans/:id/details`
- `GET /admin/repayments`

## Deployment (Vercel)

This repository already contains Vercel config for both apps:

- frontend/vercel.json
- backend/vercel.json
- backend/api/index.js serverless handler

For full deployment steps, follow:

- DEPLOY-VERCEL.md

High-level flow:

1. Create separate Vercel projects for frontend and backend.
2. Set backend env vars (`MONGODB_URL`, `JWT_SECRET`) in Vercel.
3. Deploy backend and obtain public API URL.
4. Update frontend runtime API target to backend `/api` URL.
5. Deploy frontend.

## Testing

### Frontend

```bash
cd frontend
npm test
```

### Backend

There are currently no automated backend tests configured (`npm test` is a placeholder script).

## Troubleshooting

### Backend fails with "MONGODB_URL is not set"

- Confirm `backend/.env` exists and has `MONGODB_URL`.
- Ensure backend is started from the `backend` directory.

### 401 "Invalid or expired token"

- Login again and refresh token in local storage.
- Ensure requests send header: `Authorization: Bearer <token>`.
- Verify backend `JWT_SECRET` has not changed since token was issued.

### Frontend cannot reach backend in production

- Confirm `window.API_KEY` in `frontend/src/index.html` points to deployed backend `/api` URL.
- Verify CORS/network availability for backend endpoint.

### Docker backend cannot connect to MongoDB

- Use `mongodb://mongo:27017/<db-name>` inside Docker Compose backend env.
- Ensure `mongo` service is running.

## Notes

- This project includes CI/CD workflow references in `DEPLOY-VERCEL.md`.
- Keep secrets out of source control; use `.env` locally and Vercel project env vars in production.

