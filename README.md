# Task Management System

A full-stack task management application built with React, Node.js, Express, and MongoDB.

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

## Features

- User authentication (register/login)
- Create, read, update, delete tasks
- Task categories and priorities
- Due dates and search functionality
- Drag and drop task reordering
- Dark mode toggle

## Project Structure

```
task-management-system/
├── client/          # React frontend
├── server/          # Node.js backend
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install dependencies for both client and server
3. Set up environment variables
4. Start the development servers

### Environment Variables

Create a `.env` file in the server directory:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Scripts

### Client (React)
```bash
cd client
npm start
```

### Server (Node.js)
```bash
cd server
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Tasks
- GET /api/tasks
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
