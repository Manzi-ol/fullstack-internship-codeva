# Level 3 - Advanced Full-Stack Development

## Tasks Completed
- **Task 1**: Full MERN Stack Application (auth, DB, frontend integration)
- **Task 2**: WebSockets with Socket.io (real-time notifications)
- **Task 3**: GraphQL API with Apollo Server

## Project: Product Manager (Full-Featured MERN App)

### Backend - Express + MongoDB + Socket.io + GraphQL
Advanced backend with REST API, GraphQL API, and WebSocket support.

**REST Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | No | Register (emits real-time event) |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/products | No | List products (pagination, sort, filter) |
| GET | /api/products/:id | No | Single product |
| POST | /api/products | Yes | Create (emits socket event) |
| PUT | /api/products/:id | Yes | Update (emits socket event) |
| DELETE | /api/products/:id | Yes | Delete (emits socket event) |
| GET | /api/notifications | Yes | Recent notifications |
| PUT | /api/notifications/:id/read | Yes | Mark notification read |

**GraphQL Endpoint:** `/graphql`
- Queries: products, product, me, notifications
- Mutations: signup, login, createProduct, updateProduct, deleteProduct, markNotificationRead

**WebSocket Events:**
- `product_created` - When a new product is added
- `product_updated` - When a product is modified
- `product_deleted` - When a product is removed
- `user_joined` - When a new user signs up

**How to Run:**
```bash
cd level3/backend
cp .env.example .env   # Edit with your MongoDB URI and JWT secret
npm install
npm start
# Server runs on http://localhost:5000
# GraphQL Playground at http://localhost:5000/graphql
```

### Frontend - React + Socket.io + Apollo Client
Full-featured React SPA with real-time updates and GraphQL demo.

**How to Run:**
```bash
cd level3/frontend
npm install
npm start
# App runs on http://localhost:3000
```

**Features:**
- All Level 2 features plus:
- Real-time notification bell with unread count
- Live product updates via WebSockets
- GraphQL Demo page showing queries and mutations
- Product detail page
- Pagination controls
- Socket.io connection management

**Pages:**
- `/` - Dashboard with real-time product list
- `/login` - Login
- `/signup` - Signup
- `/products/new` - Add product (protected)
- `/products/edit/:id` - Edit product (protected)
- `/products/:id` - Product detail
- `/graphql-demo` - GraphQL interactive demo

## Tech Stack
- Node.js, Express.js, MongoDB, Mongoose
- bcryptjs, jsonwebtoken, express-validator
- Socket.io (server + client)
- Apollo Server v4, GraphQL
- React, React Router, Axios, Context API
- @apollo/client for GraphQL frontend
