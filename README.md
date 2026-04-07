# Intern Desk

> A full-stack intern management platform connecting Interns, Mentors, and Managers.

## Project Structure

```
interndesk/
├── client/          # React + Vite + TypeScript frontend
├── server/          # Node.js + Express backend (scaffolded)
└── database/        # SQL schema and migrations
```

## Quick Start (Frontend only)

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`

### Demo Accounts

| Role    | Email               | Password |
|---------|---------------------|----------|
| Intern  | intern@demo.com     | demo123  |
| Mentor  | mentor@demo.com     | demo123  |
| Manager | manager@demo.com    | demo123  |

## Tech Stack

### Frontend (`/client`)
- **React 18** + **TypeScript**
- **Vite** (bundler)
- **React Router v6** (routing)
- Pure CSS (no Tailwind / component libraries)
- Google Fonts: Playfair Display + DM Sans

### Backend (`/server`) — to be implemented
- Node.js + Express + TypeScript
- JWT authentication
- Role-based access control

### Database (`/database`)
- PostgreSQL (SQL schema provided)
- 14 tables covering users, tasks, messages, reviews, and more

## Pages

| Route       | Component           | Description                     |
|-------------|---------------------|---------------------------------|
| `/`         | LandingPage         | Marketing homepage               |
| `/login`    | LoginPage           | Sign-in form                    |
| `/register` | RegisterPage        | Registration with role select   |
| `/intern`   | InternDashboard     | Full intern workspace           |
| `/mentor`   | MentorDashboard     | Mentor management view          |
| `/manager`  | ManagerDashboard    | Admin / program manager view    |

## Features

- ✅ Pixel-perfect recreation of all original HTML designs
- ✅ Fully interactive: tasks, modals, toasts, schedule events
- ✅ Role-based routing & protected routes
- ✅ Auth context with session persistence
- ✅ Responsive sidebar (collapses to icons on small screens)
- ✅ Animated progress bars, floating hero cards
- ✅ Add/remove interns, post announcements, send messages (UI)
