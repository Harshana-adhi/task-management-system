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

## Screenshots

> Add screenshots to `frontend/public/screenshots/` and reference them below.

**Light mode**

![Dashboard - light](public/screenshots/dashboard-light.png)

**Dark mode**

![Dashboard - dark](public/screenshots/dashboard-dark.png)

## Deployment

- Hosted on **Cloudflare** (via `wrangler.toml`), with a custom domain configured.
- Live demo: `<your-cloudflare-url>`

## Team Contributions

| Name | Module / Feature |
|---|---|
| _Add team member_ | _e.g. Auth pages, Task board UI_ |
| _Add team member_ | _e.g. Project management views_ |
| _Add team member_ | _e.g. Notifications, real-time integration_ |
