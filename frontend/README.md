# TaskFlow — Frontend

React (Vite) + Tailwind CSS frontend for the Task Management System.

> Full project documentation (setup, scripts, screenshots, contributions) is completed in Phase 9. This is a minimal note so the team can run what's built so far.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # adjust VITE_API_URL / VITE_SOCKET_URL if needed
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Design system (Phase 1)

- Tailwind v4, configured in `src/index.css` via `@theme` (brand color scale, status/priority color tokens, fonts).
- Class-based dark mode — toggle lives in the navbar, state in `src/store/useThemeStore.js`.
- Shared building blocks in `src/components/common/` (Button, Input, Modal, Loader, Table, Badge, Toast). Build new UI out of these rather than one-off styles.
- `StatusBadge` / `PriorityBadge` in `Badge.jsx` are the single source of truth for status/priority colors — reuse them everywhere a status or priority is shown (table, Kanban, task detail).
- Global state: Zustand stores in `src/store/` (`useAuthStore`, `useThemeStore`, `useNotificationStore`, `useUIStore`).
- API calls: import the shared `api` instance from `src/lib/axios.js` — it already attaches the JWT and handles 401s.
