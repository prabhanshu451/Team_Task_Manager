# TeamFlow — Team Task Manager

A full-stack collaborative task management application built with React, Node.js, Express, and MongoDB.

## 🚀 Live Demo
> Add your live Railway URL here after deployment

## 📁 GitHub Repository
> Add your GitHub repo URL here

---

## ✨ Features

### Authentication
- Signup with Name, Email, Password (bcrypt hashed)
- JWT-based secure login (7-day expiry)
- Protected routes on frontend and backend

### Project Management
- Create projects (creator auto-assigned Admin role)
- Admin can add/remove members by email
- Admin can assign roles (Admin / Member)
- View all projects you're a member of

### Task Management
- Create tasks with Title, Description, Due Date, Priority
- Assign tasks to project members
- Kanban board view: To Do / In Progress / Done
- Overdue task highlighting
- Admin: full CRUD on tasks
- Member: view & update status of assigned tasks only

### Dashboard
- Total task count
- Tasks by status (Pie chart)
- Tasks by priority (Bar chart)
- Tasks per team member (Horizontal bar chart)
- Overdue task count

### Role-Based Access Control
| Feature | Admin | Member |
|---|---|---|
| Create/Delete project | ✅ | ❌ |
| Add/Remove members | ✅ | ❌ |
| Create/Delete tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks) |
| View all tasks | ✅ | ❌ (own only) |

---

## 🛠 Tech Stack

**Frontend:** React 18, React Router v6, Recharts, Axios, Vite  
**Backend:** Node.js, Express.js  
**Database:** MongoDB (Mongoose)  
**Auth:** JWT + bcryptjs  
**Deployment:** Railway

---

## 📦 Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (free tier works)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm start
```

### 3. Frontend Setup (separate terminal)
```bash
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:5173`

---

## 🚂 Railway Deployment

### Step 1: MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) → Create free cluster
2. Create a database user
3. Whitelist all IPs: `0.0.0.0/0`
4. Copy connection string

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 3: Deploy on Railway
1. Go to [railway.app](https://railway.app) → New Project
2. Connect GitHub → Select your repo
3. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_random_secret_string
   NODE_ENV=production
   ```
4. Railway auto-detects build command (`npm run build`) and start (`npm start`)
5. Click **Deploy** — Railway gives you a public URL

### Step 4: Update Frontend URL (optional)
Set `FRONTEND_URL` env var to your Railway URL if you want to restrict CORS.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing (use a random 32+ char string) |
| `PORT` | Port number (Railway sets this automatically) |
| `FRONTEND_URL` | Frontend origin for CORS (optional, defaults to `*`) |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks?projectId=` | List tasks |
| POST | `/api/tasks` | Create task (Admin) |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (Admin) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard?projectId=` | Get project statistics |

---

## 📂 Project Structure

```
team-task-manager/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── ProjectDetail.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
├── package.json        ← root build script for Railway
├── railway.json
└── README.md
```

---

## 👤 Author
Built as part of a full-stack coding assessment.
