# PlantBoard — Mini Project Manager

> **Technical Assessment Submission**  
> **Prepared for:** The Web Plant  
> **Candidate / Developer:** Potterhead45  
> **Repository:** [https://github.com/Potterhead45/the-web-plant](https://github.com/Potterhead45/the-web-plant)  
> **Branch:** `main`

---

## 1. Project Overview

**PlantBoard** is a modern, high-performance SaaS Mini Project Manager designed to give product teams, project managers, and engineers clear visibility and control over their work.

Engineered specifically as a full-stack technical assessment for **The Web Plant**, PlantBoard demonstrates industry-grade application architecture, strict multi-tenant data isolation, robust authentication with secure cookies, real-time progress calculations, interactive Kanban boards, and zero-compromise type safety across the entire stack.

### Key Highlights
- **Product Branding**: PlantBoard with a clean, forest-green accent, neutral backgrounds, and refined typography.
- **Assessment Attribution**: Developed specifically for the technical evaluation by **The Web Plant** (without implying official ownership or publishing by The Web Plant).
- **Architecture**: Modular Express backend with Mongoose & Zod, coupled with a Next.js (App Router) TypeScript frontend powered by Redux Toolkit and Tailwind CSS.
- **Security-First**: HttpOnly, SameSite, Secure JWT cookie authentication, bcrypt password hashing, input validation, and user ownership authorization on every protected resource.
- **Quality Assured**: 23 automated tests verifying authentication, project CRUD, task operations, status & date filtering, sorting, validation failures, and strict user isolation.

---

## 2. Technology Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router, Turbopack, Partial Prerendering)
- **Library**: [React](https://react.dev/) 19 (Hooks, Suspense, Error Boundaries)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & React-Redux
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **HTTP Client**: [Axios](https://axios-http.com/) (configured with `withCredentials: true` and interceptors)
- **Form & Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime & Framework**: [Node.js](https://nodejs.org/) v24 & [Express](https://expressjs.com/) 5
- **Language**: [TypeScript](https://www.typescriptlang.org/) (ESM, NodeNext)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) 9
- **Validation**: [Zod](https://zod.dev/) request body, query, and parameter middleware
- **Authentication**: JWT (`jsonwebtoken`) delivered via secure `HttpOnly` cookies + `Authorization: Bearer` fallback
- **Password Security**: `bcryptjs` (salt rounds: 10, pre-save hashing, passwords excluded from query results by default)
- **Security Middlewares**: [Helmet](https://helmetjs.github.io/), [CORS](https://expressjs.com/en/resources/middleware/cors.html) with origin allowlisting, [express-rate-limit](https://express-rate-limit.mintlify.app/)
- **Testing**: Node.js built-in test runner (`node:test`, `assert/strict`), `supertest`, and `mongodb-memory-server`

---

## 3. Features & Capabilities

### 🔐 Authentication & Session Security
- User registration with name, email, and password.
- Secure login and instant password comparison via bcrypt.
- JWT issue via **HttpOnly cookies** (preventing XSS token theft) with SameSite protection.
- Session verification endpoint (`GET /api/auth/me`).
- Graceful logout endpoint that clears authentication cookies.
- Authentication rate limiting to block brute-force attempts.
- Route protection in Next.js: unauthenticated visitors are automatically redirected to `/login`, while logged-in users are redirected away from auth pages directly into `/dashboard`.

### 📁 Project Management
- **Create Projects**: Project title and optional rich description.
- **List & Search**: Live multi-field regex search across title and description, with sorting by created date, updated date, or title.
- **Live Progress Tracking**: Automated progress percentage calculated from actual task completion counts in the database.
- **Task Counters**: Real-time breakdown of total, to do, in-progress, and done tasks.
- **Cascade Deletion**: Deleting a project cleanly and safely deletes all associated tasks in MongoDB.
- **Ownership Isolation**: Complete database-level guarantee that users can only view, update, or delete their own projects.

### 📋 Task Management & Kanban Board
- **Three-Column Kanban Board**: Visual workflow across `To Do`, `In Progress`, and `Done` with drag-and-drop support and one-click quick moves.
- **Table / List View**: Alternative high-density list view displaying title, status, project name, and due date.
- **Due Date Scheduling**: Set or clear deadlines with overdue alerts highlighted in rose.
- **Multi-Dimensional Filters**:
  - Filter by Status: All, To Do, In Progress, Done
  - Filter by Due Date: All, Overdue Only, Due Today, Upcoming (next 7 days), Has Due Date, No Due Date
  - Filter by Project: Scope tasks to a specific project or view cross-project
- **Sorting**: Order tasks by due date (earliest/latest), title (A-Z), or creation date.
- **Task Ownership Enforcement**: Strict validation ensuring users cannot inject tasks into foreign projects or alter another user's task.

### 📊 Dashboard Analytics
- Grounded, live calculations (no fabricated mockups):
  - Total Projects Count
  - Total Tasks Count
  - Completed Tasks & Completion Percentage
  - In Progress Tasks
  - Pending (To Do) Tasks
  - Overdue Tasks Alert Counter
- **Upcoming Deadlines Widget**: Immediate view of tasks due within the upcoming 7 days.
- **Recent Projects Widget**: Quick navigation to recently modified projects with individual progress bars.

---

## 4. Architecture & Folder Structure

```
The-Web-Plant-Assessment/
├── .gitignore                    # Global git ignore (ignoring .env, node_modules, build outputs)
├── package.json                  # Root workspace convenience scripts
├── README.md                     # Comprehensive project documentation
│
├── backend/                      # Node.js + Express 5 + TypeScript + MongoDB API
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Backend dependencies and scripts
│   ├── tsconfig.json             # TypeScript NodeNext ESM configuration
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts            # Environment variable validation & defaults
│   │   │   └── db.ts             # Mongoose connection & disconnect handler
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── project.controller.ts
│   │   │   ├── task.controller.ts
│   │   │   └── health.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts       # JWT cookie & header extraction
│   │   │   ├── validate.middleware.ts   # Zod body/query/param validation
│   │   │   ├── error.middleware.ts      # Centralized error handler
│   │   │   ├── notFound.middleware.ts   # 404 handler
│   │   │   └── rateLimit.middleware.ts  # Express rate limiter
│   │   ├── models/
│   │   │   ├── user.model.ts            # User schema & bcrypt hook
│   │   │   ├── project.model.ts         # Project schema & user index
│   │   │   └── task.model.ts            # Task schema & compound indexes
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── project.routes.ts
│   │   │   ├── task.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts          # Auth business logic
│   │   │   ├── project.service.ts       # Project aggregation & cascade
│   │   │   └── task.service.ts          # Task filtering, stats & queries
│   │   ├── utils/
│   │   │   ├── apiResponse.ts           # Standard JSON response helper
│   │   │   ├── errors.ts                # AppError, BadRequest, Unauthorized, NotFound
│   │   │   └── token.ts                 # JWT signing, verify & cookie options
│   │   ├── app.ts                       # Express app creation & middleware wiring
│   │   └── server.ts                    # Server bootstrap & graceful shutdown
│   └── tests/
│       ├── setup.ts                     # In-memory MongoMemoryServer lifecycle
│       ├── auth.test.ts                 # Registration, login, me, logout tests
│       ├── project.test.ts              # Project CRUD, stats & isolation tests
│       ├── task.test.ts                 # Task CRUD, filters, overdue & stats tests
│       └── health.test.ts               # Health endpoint check
│
└── frontend/                     # Next.js 16 + React 19 + TypeScript + Tailwind
    ├── .env.example              # Frontend environment variables template
    ├── package.json              # Frontend dependencies and scripts
    ├── tsconfig.json             # TypeScript Next.js configuration
    └── src/
        ├── app/
        │   ├── globals.css              # Tailwind CSS styles & theme
        │   ├── layout.tsx               # Root layout & Redux provider
        │   ├── page.tsx                 # Landing page
        │   ├── login/page.tsx           # Login page with demo autofill
        │   ├── signup/page.tsx          # Registration page
        │   ├── dashboard/page.tsx       # Live analytics dashboard
        │   ├── projects/page.tsx        # Projects catalog & search
        │   ├── projects/[id]/page.tsx   # Project details, Kanban & List views
        │   ├── tasks/page.tsx           # Cross-project task management
        │   └── settings/page.tsx        # Profile & assessment specs
        ├── components/
        │   ├── dashboard/               # StatCard, UpcomingDeadlines, RecentProjects
        │   ├── layout/                  # Sidebar, Navbar, AppLayout
        │   ├── projects/                # ProjectCard, ProjectFormModal
        │   ├── providers/               # ReduxProvider, AuthProvider
        │   ├── tasks/                   # KanbanBoard, TaskCard, TaskListView, TaskFormModal
        │   └── ui/                      # Modal, ConfirmDialog, ProgressBar, Badge, EmptyState, Toast
        ├── lib/
        │   ├── axios.ts                 # Axios instance with credentials & interceptors
        │   └── types.ts                 # TypeScript domain interfaces
        └── store/
            ├── index.ts                 # Redux Toolkit store configuration
            ├── hooks.ts                 # Typed useAppDispatch & useAppSelector
            └── slices/
                ├── authSlice.ts         # User session & auth thunks
                ├── projectsSlice.ts     # Projects state & CRUD thunks
                ├── tasksSlice.ts        # Tasks state, stats & CRUD thunks
                └── uiSlice.ts           # Global toast notifications
```

---

## 5. Prerequisites

Before running the application, make sure you have installed:
- **Node.js**: v18.0.0 or later (Tested on Node.js v24.19.0)
- **npm**: v9.0.0 or later (Tested on npm 11.17.0)
- **MongoDB**: Either a local MongoDB instance running on port `27017` or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.

---

## 6. Environment Configuration

### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Default configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/plantboard
JWT_SECRET=plantboard_super_secret_jwt_key_2026_dev_secure
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000
```

> **Using MongoDB Atlas**:  
> To connect to MongoDB Atlas, replace `MONGODB_URI` with your connection string:  
> `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/plantboard?retryWrites=true&w=majority`

### Frontend (`frontend/.env.local`)
Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Default configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 7. Installation & Local Startup

### Option A: Quick Root Workflow

From the project root:

```bash
# 1. Install dependencies for both apps
npm --prefix backend install
npm --prefix frontend install

# 2. Start the Backend API (runs on http://localhost:5000)
npm run dev:backend

# 3. In a second terminal, start the Frontend (runs on http://localhost:3000)
npm run dev:frontend
```

### Option B: Separate Terminal Startup

**Terminal 1 — Backend**:
```bash
cd backend
npm install
npm run dev
```
*The API will start at `http://localhost:5000`. You can verify health at `http://localhost:5000/api/health`.*

**Terminal 2 — Frontend**:
```bash
cd frontend
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 8. REST API Documentation

### Base URL: `http://localhost:5000/api`

### Health Check
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Returns service status, timestamp, and uptime | No |

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Request Body | Auth Required |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & sets HttpOnly cookie | `{ name, email, password }` | No |
| `POST` | `/api/auth/login` | Authenticate & sets HttpOnly cookie | `{ email, password }` | No |
| `POST` | `/api/auth/logout` | Clears authentication cookie | None | No |
| `GET` | `/api/auth/me` | Fetches current user profile | None | **Yes** |

### Projects (`/api/projects`)
| Method | Endpoint | Description | Query / Body | Auth Required |
|---|---|---|---|---|
| `GET` | `/api/projects` | List user projects with task stats & progress | `?search=&sortBy=&order=` | **Yes** |
| `POST` | `/api/projects` | Create a new project | `{ title, description }` | **Yes** |
| `GET` | `/api/projects/:id` | Get project details & task counts | None | **Yes** |
| `PUT` | `/api/projects/:id` | Update project title or description | `{ title, description }` | **Yes** |
| `DELETE` | `/api/projects/:id` | Delete project and cascade-delete tasks | None | **Yes** |

### Project Tasks (`/api/projects/:projectId/tasks`)
| Method | Endpoint | Description | Query / Body | Auth Required |
|---|---|---|---|---|
| `GET` | `/api/projects/:projectId/tasks` | Get tasks belonging to project | `?status=&dueDate=&sortBy=&order=&search=` | **Yes** |
| `POST` | `/api/projects/:projectId/tasks` | Create task inside project | `{ title, description, status, dueDate }` | **Yes** |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Query / Body | Auth Required |
|---|---|---|---|---|
| `GET` | `/api/tasks` | List all tasks across projects | `?status=&dueDate=&sortBy=&order=&projectId=&search=` | **Yes** |
| `GET` | `/api/tasks/dashboard-stats` | Aggregated dashboard metrics | None | **Yes** |
| `GET` | `/api/tasks/:id` | Get single task details | None | **Yes** |
| `PUT` | `/api/tasks/:id` | Update task details/status/dueDate | `{ title, description, status, dueDate, projectId }` | **Yes** |
| `DELETE` | `/api/tasks/:id` | Delete a task | None | **Yes** |

---

## 9. Automated Testing & Verification

The project includes automated integration tests that run against an in-memory MongoDB server (`mongodb-memory-server`), testing full request/response lifecycles without requiring an external database.

### Running Backend Tests
```bash
cd backend
npm test
```

**Test Suite Coverage (23 Passing Tests)**:
1. `POST /api/auth/register` — registers user and sets HttpOnly cookie.
2. `POST /api/auth/register` — rejects duplicate email with `409 Conflict`.
3. `POST /api/auth/register` — enforces Zod validation (email format, password min length, name).
4. `POST /api/auth/login` — logs in existing user and returns token.
5. `POST /api/auth/login` — rejects incorrect password with `401 Unauthorized`.
6. `POST /api/auth/login` — rejects nonexistent email with `401 Unauthorized`.
7. `GET /api/auth/me` — verifies session via cookie or `Authorization: Bearer` header.
8. `GET /api/auth/me` — rejects unauthenticated requests with `401`.
9. `POST /api/auth/logout` — clears authentication cookie.
10. `GET /api/health` — returns operational status and timestamp.
11. `POST /api/projects` — creates project.
12. `POST /api/projects` — validates required fields.
13. `GET /api/projects` — lists user projects with computed task counts and progress %.
14. `GET /api/projects` — filters projects by search keyword.
15. `PUT /api/projects/:id` — updates project details.
16. `CRITICAL: Project Ownership Isolation` — guarantees User B cannot read, update, or delete User A's project (returns `403 Forbidden`).
17. `DELETE /api/projects/:id` — deletes project and cascade-deletes all associated tasks.
18. `POST /api/projects/:projectId/tasks` — creates task with status and dueDate.
19. `PUT /api/tasks/:id` — updates status and clears dueDate.
20. `DELETE /api/tasks/:id` — removes task.
21. `CRITICAL: Task Ownership Isolation` — guarantees User B cannot read, update, delete, or create tasks in User A's project.
22. `GET /api/tasks` — filters by status, due date (`overdue`, `today`, `upcoming`), and sorting.
23. `GET /api/tasks/dashboard-stats` — computes accurate real-time dashboard statistics.

### Running Backend Typecheck & Build
```bash
cd backend
npm run typecheck
npm run build
```

### Running Frontend Lint & Build
```bash
cd frontend
npm run lint
npm run build
```

All 9 routes prerender cleanly with zero ESLint errors and zero TypeScript warnings.

---

## 10. Deployment Guidelines

### Frontend (Vercel)
1. Push project to GitHub.
2. Import repository in [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Configure environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-api.onrender.com/api`
5. Deploy.

### Backend (Render / Railway)
1. Create a Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set **Root Directory** to `backend`.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Configure environment variables:
   - `PORT`: `5000` (or leave default assigned by platform)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/plantboard?retryWrites=true&w=majority`
   - `JWT_SECRET`: A long, cryptographically secure random string
   - `JWT_EXPIRES_IN`: `1d`
   - `CLIENT_URL`: `https://your-plantboard-frontend.vercel.app`

---

## 11. Assessment Attribution

- **Organization**: The Web Plant
- **Project**: PlantBoard Mini Project Manager
- **Status**: Completed full-stack technical assessment
