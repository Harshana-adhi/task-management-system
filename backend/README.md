# Task Management System — Backend

REST API for the Task Management System (Web Development Group Project). Provides authentication and role-based access control, project and task management, comments, file attachments, and real-time notifications over WebSockets.

## Tech Stack

- **Runtime:** Node.js, Express 5
- **Database:** PostgreSQL (hosted on Supabase)
- **Auth:** JWT (`jsonwebtoken`), password hashing with `bcrypt`
- **Real-time:** Socket.io
- **File storage:** Supabase Storage (uploads handled in-memory via `multer`, then pushed to a Supabase bucket)
- **Validation:** Joi
- **Security:** Helmet, CORS allow-list, express-rate-limit on login
- **Email:** Resend (password reset / notification emails)
- **Docs:** Swagger / OpenAPI (`swagger-jsdoc` + `swagger-ui-express`)

## Folder Structure

Follows a clean, modular MVC-style structure as required by the SRS:

```
backend/src/
├── config/         # env config, Swagger/OpenAPI setup
├── controllers/    # request handlers — parse input, call services, shape responses
├── services/       # business logic and database queries
├── repositories/   # lower-level data access used by services
├── routes/         # Express route definitions + Swagger JSDoc annotations
├── middlewares/     # authenticate/authorize, validation, rate limiting, upload, error handling
├── validators/      # Joi schemas
├── sockets/         # Socket.io notification logic
├── jobs/             # scheduled tasks (e.g. deadline checker)
├── utils/
└── server.js         # app entry point
```

## Setup Instructions

1. Clone the repository and move into the backend folder:
   ```bash
   git clone https://github.com/Harshana-adhi/task-management-system.git
   cd task-management-system/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file and fill in real values:
   ```bash
   cp .env.example .env
   ```
4. Run in development mode (auto-restarts with nodemon):
   ```bash
   npm run dev
   ```
5. Or run in production mode:
   ```bash
   npm start
   ```

The server starts on `http://localhost:5000` by default (configurable via `PORT`).

## Environment Variables

See `.env.example` for the full list. Required:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Supabase pooler) |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `PORT` | Port the API listens on |
| `FRONTEND_URL` | Allowed CORS origin for the deployed/local frontend |
| `RESEND_API_KEY` | API key for sending emails via Resend |
| `EMAIL_FROM` | Sender address for outgoing emails |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_BUCKET` | Storage bucket name for attachments |

## API Documentation

Full interactive API documentation is available via Swagger UI:

- **Local:** `http://localhost:5000/api-docs`
- **Live:** `<your-render-url>/api-docs`

Every endpoint (auth, users, projects, tasks, comments, attachments, notifications) is documented with request bodies, parameters, and response codes (400/401/403/404/409/500) directly from the route files.

## Running with Docker

```bash
docker build -t tms-backend .
docker run -p 5000:5000 --env-file .env tms-backend
```

## Running Tests / CI

A GitHub Actions workflow (`.github/workflows/backend-ci.yml`) runs install + test + Docker build on every push/PR touching `backend/`. Note: the current `npm test` script is a placeholder — replace it with a real test command once a test suite is added, since CI will otherwise report it as a known gap.

## Deployment

- Hosted on **Render**, with auto-deploy on push to `develop`.
- CORS is locked to `FRONTEND_URL` in production.
- Live demo: `https://task-management-system-backend-spcl.onrender.com`


