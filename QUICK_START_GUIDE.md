# 🚀 Quick Start Guide

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

## ⚡ Quick Setup (5 minutes)

### **1. Backend Setup**
```bash
cd server
npm install
npm run dev
```

### **2. Frontend Setup**
```bash
cd client
npm install
npm start
```

### **3. Access the App**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🎯 Test the System

1. **Register** a new account
2. **Login** with your credentials
3. **Create tasks** with different categories and priorities
4. **Manage tasks** - edit, delete, and organize

## 🔧 Environment Setup

Create `.env` file in `server/` directory:
```
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

## 📱 Features to Test

- ✅ User registration and login
- ✅ Task creation and management
- ✅ Categories and priorities
- ✅ Due date functionality
- ✅ Responsive design
- ✅ Professional landing page

## 🐛 Common Issues

- **MongoDB not running**: Start MongoDB service
- **Port conflicts**: Change PORT in .env file
- **CORS errors**: Ensure both servers are running

## 📚 Full Documentation

See `SYSTEM_DOCUMENTATION.md` for detailed explanations of how everything works!
