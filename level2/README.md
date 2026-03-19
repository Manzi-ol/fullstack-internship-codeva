# Level 2 - Intermediate Full-Stack Development

## Tasks Completed
- **Task 1**: Frontend with React (functional components, state management)
- **Task 2**: Authentication & Authorization (JWT, bcrypt, role-based access)
- **Task 3**: Database Integration (MongoDB with Mongoose)

## Project: Product Manager (with Auth & Database)

### Backend - Express + MongoDB + JWT
Full REST API with MongoDB persistence and JWT authentication.

**Auth Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | No | Register new user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get current user |

**Product Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | No | Get all products |
| GET | /api/products/:id | No | Get single product |
| POST | /api/products | Yes | Create product |
| PUT | /api/products/:id | Yes | Update product (owner/admin) |
| DELETE | /api/products/:id | Yes | Delete product (owner/admin) |

**How to Run:**
```bash
cd level2/backend
cp .env.example .env   # Edit with your MongoDB URI and JWT secret
npm install
npm start
# Server runs on http://localhost:5000
```

### Frontend - React
Modern React SPA with authentication and CRUD operations.

**How to Run:**
```bash
cd level2/frontend
npm install
npm start
# App runs on http://localhost:3000
```

**Features:**
- React functional components with hooks
- Context API for auth state management
- Protected routes
- Login/Signup pages
- Product CRUD with search and category filters
- Responsive design

## Tech Stack
- Node.js, Express.js, MongoDB, Mongoose
- bcryptjs, jsonwebtoken, express-validator
- React, React Router, Axios, Context API
