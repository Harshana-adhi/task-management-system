# Task Management System

A full-stack web application that allows users to create, manage, and track tasks collaboratively in real time. Built for the INTE 21323 Group Project.

The system supports:
- User registration, authentication, and role-based access control (Admin, Project Manager, Collaborator)
- Project creation and membership management
- Task creation, assignment, prioritization, and deadline tracking
- Status tracking (To Do → In Progress → Completed)
- Collaboration via comments and file attachments
- Real-time notifications over WebSockets
- Secure API communication (JWT, HTTPS, parameterized queries, input validation)

## Architecture

```
┌─────────────┐        HTTPS / REST        ┌──────────────┐        SQL        ┌──────────────┐
│   Frontend   │ ─────────────────────────▶ │   Backend    │ ─────────────────▶ │  PostgreSQL   │
│  React + Vite │ ◀───────────────────────── │ Express + JWT│ ◀───────────────── │  (Supabase)   │
│  (Cloudflare) │      Socket.io (WS)        │   (Render)   │                    └──────────────┘
└─────────────┘                              └──────┬───────┘
                                                     │
                                                     ▼
                                            Supabase Storage
                                           (task attachments)
```

## Deployment Architecture

![Deployment Diagram](docs/deployment-diagram.svg)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Zustand, React Router |
| Backend | Node.js, Express, Socket.io |
| Database | PostgreSQL (hosted on Supabase) |
| File storage | Supabase Storage |
| Auth | JWT, bcrypt |
| Frontend hosting | Cloudflare |
| Backend hosting | Render |
| CI | GitHub Actions |

## Project Structure

```
task-management-system/
├── backend/    # Express REST API — see backend/README.md
├── frontend/   # React SPA — see frontend/README.md
├── database/   # SQL schemas and seed data
└── .github/workflows/  # CI pipelines
```

## Live Demo

- **Frontend:** `<your-cloudflare-url>`
- **Backend API:** `<your-render-url>`
- **API Docs (Swagger):** `<your-render-url>/api-docs`

## Documentation

- [Backend README](./backend/README.md) — setup, environment variables, API docs, Docker, deployment
- [Frontend README](./frontend/README.md) — setup, environment variables, scripts, screenshots

## Database

See `/database/schemas` for the full PostgreSQL schema (roles, users, projects, project_members, tasks, task_assignments, comments, attachments, notifications) and `/database/seeds` for seed data.

## Version Control

- Feature branches per contributor
- Pull requests with merge commits
- Meaningful commit messages

## Team Contributions

| Name | Contribution |
|---|---|
| _Add team member_ | _e.g. Backend — Auth, Projects_ |
| _Add team member_ | _e.g. Backend — Tasks, Notifications_ |
| _Add team member_ | _e.g. Frontend — UI, real-time integration_ |
| _Add team member_ | _e.g. Database design, DevOps/CI_ |
