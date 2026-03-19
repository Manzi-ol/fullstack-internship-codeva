# Level 1 - Basic Full-Stack Development

## Tasks Completed
- **Task 1**: Development Environment Setup (Node.js, npm, Git)
- **Task 2**: Simple REST API with Express (CRUD operations)
- **Task 3**: Frontend with HTML, CSS, and JavaScript

## Project: Product Manager (Basic)

### Backend - REST API
A simple Express.js REST API with in-memory data storage.

**Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get single product |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |

**How to Run:**
```bash
cd level1/backend
npm install
npm start
# Server runs on http://localhost:5000
```

### Frontend - Vanilla HTML/CSS/JS
A responsive webpage that interacts with the REST API.

**How to Run:**
1. Start the backend first
2. Open `level1/frontend/index.html` in your browser

**Features:**
- Dynamic product cards
- Add/Edit/Delete products via forms
- Responsive grid layout
- Loading states and error handling
- XSS protection

## Tech Stack
- Node.js, Express.js
- HTML5, CSS3, Vanilla JavaScript
- Fetch API
