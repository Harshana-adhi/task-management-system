# Task Management System — Frontend

React single-page application for the Task Management System (INTE 21323 Group Project). Provides login, role-based dashboards, project/task management with drag-and-drop status updates, comments, attachments, and real-time notifications.

## Tech Stack

- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **State:** Zustand
- **Forms & validation:** React Hook Form + Zod
- **Styling:** Tailwind CSS v4
- **Drag & drop:** dnd-kit (used for the task board, e.g. To Do → In Progress → Completed)
- **Real-time:** Socket.io client
- **HTTP:** Axios
- **Notifications/toasts:** Sonner

## Setup Instructions

1. Move into the frontend folder:
   ```bash
   cd task-management-system/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file and fill in real values:
   ```bash
   cp .env.example .env
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Build for production:
   ```bash
   npm run build
   ```
6. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend REST API (e.g. `https://your-backend.onrender.com/api`) |
| `VITE_SOCKET_URL` | Base URL of the backend Socket.io server |

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |


## Deployment

- Hosted on **Cloudflare** (Node build, via `wrangler.toml`, with a custom domain) and on **Render** (Docker build, via Dockerfile, with a custom domain).
- Live demo (Frontend, Node build, hosted on Cloudflare): https://taskify.task-management-system.best
- Live demo (Frontend, Docker build, hosted on Render): https://taskifyd.task-management-system.best

