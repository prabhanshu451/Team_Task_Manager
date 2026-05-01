# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

**Live App:** https://teamtaskmanager-production-909a.up.railway.app  
**GitHub:** https://github.com/prabhanshu451/Team_Task_Manager

---

## What it does

Users can create projects, assign tasks to team members, and track progress — all in one place. Access is role-based, so Admins stay in control while Members focus only on their assigned work.

---

## Features

**Authentication**
- Signup and login with JWT-based sessions
- Passwords hashed using bcrypt
- All routes protected on both frontend and backend

**Projects**
- Create a project and automatically become its Admin
- Add or remove team members by email
- Each member has a role — Admin or Member

**Tasks**
- Create tasks with title, description, due date, and priority
- Assign tasks to specific members
- Track with three statuses — To Do, In Progress, Done
- Overdue tasks are highlighted automatically

**Dashboard**
- Total tasks, completed, in-progress, and overdue at a glance
- Charts for tasks by status, priority, and per team member

**Role-Based Access**
- Admins — full control over tasks and members
- Members — can only view and update status of their own assigned tasks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Recharts, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |
| Deployment | Railway |

---

## API Overview

**Auth**
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

**Projects**
- `GET /api/projects`
- `POST /api/projects`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

**Tasks**
- `GET /api/tasks?projectId=`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

**Dashboard**
- `GET /api/dashboard?projectId=`

---

## Database Design

**User** — name, email, hashed password  
**Project** — name, description, creator, members with roles  
**Task** — title, description, due date, priority, status, project ref, assignee ref

---

## Folder Structure

```
Team_Task_Manager/
├── backend/
│   ├── models/        # User, Project, Task schemas
│   ├── routes/        # auth, projects, tasks, dashboard
│   ├── middleware/    # JWT auth middleware
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/     # Login, Signup, Projects, ProjectDetail
│   │   ├── components/# Layout, TaskModal
│   │   ├── context/   # Auth context
│   │   └── api/       # Axios client
│   └── index.html
├── railway.json
└── README.md
```
