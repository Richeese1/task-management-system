# Task Management System - Complete Documentation

## 📋 Overview

A full-stack task management application built with React, Node.js, Express, and MongoDB. This system demonstrates modern web development practices including JWT authentication, RESTful APIs, and responsive UI design.

## 🏗️ Architecture

### **Frontend (Client)**
- **Technology**: React 18 + Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT tokens stored in localStorage

### **Backend (Server)**
- **Technology**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: bcryptjs for password hashing

---

## 📁 Project Structure

```
task-management-system/
├── client/                     # React Frontend
│   ├── public/
│   │   └── index.html         # Main HTML template
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Landing.js     # Landing page
│   │   │   ├── Login.js       # Login form
│   │   │   ├── Register.js    # Registration form
│   │   │   └── Dashboard.js   # Main dashboard
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── services/          # API services
│   │   │   └── api.js         # Axios configuration
│   │   ├── App.js             # Main App component
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Global styles
│   ├── package.json           # Frontend dependencies
│   ├── tailwind.config.js     # Tailwind configuration
│   └── postcss.config.js      # PostCSS configuration
├── server/                     # Node.js Backend
│   ├── models/                # Mongoose models
│   │   ├── User.js            # User schema
│   │   └── Task.js            # Task schema
│   ├── routes/                # Express routes
│   │   ├── auth.js            # Authentication routes
│   │   └── tasks.js           # Task CRUD routes
│   ├── middleware/            # Custom middleware
│   │   └── auth.js            # JWT authentication
│   ├── .env                   # Environment variables
│   ├── server.js              # Server entry point
│   └── package.json           # Backend dependencies
└── README.md                  # Project documentation
```

---

## 🔧 Server-Side Explanation

### **1. Server Entry Point (`server.js`)**

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());                    // Enable CORS for frontend
app.use(express.json());           // Parse JSON bodies

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task-management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));    // Authentication routes
app.use('/api/tasks', require('./routes/tasks'));  // Task management routes

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Task Management System API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Key Points:**
- **CORS**: Allows frontend (localhost:3000) to communicate with backend (localhost:5000)
- **Environment Variables**: Securely stores database connection strings and secrets
- **Modular Routes**: Separates authentication and task management logic

### **2. Database Models**

#### **User Model (`models/User.js`)**
```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
```

**Features:**
- **Validation**: Ensures data integrity with required fields and constraints
- **Unique Fields**: Prevents duplicate usernames and emails
- **Password Storage**: Hashed passwords (never store plain text)

#### **Task Model (`models/Task.js`)**
```javascript
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'study', 'health', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
TaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
```

**Features:**
- **User Relationship**: Each task belongs to a specific user
- **Enum Fields**: Restricts values to predefined options
- **Auto Timestamps**: Automatically tracks creation and update times
- **Pre-save Hook**: Updates `updatedAt` field on every save

### **3. Authentication Routes (`routes/auth.js`)**

#### **User Registration**
```javascript
router.post('/register', [
  body('username').isLength({ min: 3 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

**Security Features:**
- **Input Validation**: Uses express-validator to sanitize inputs
- **Password Hashing**: bcryptjs with salt rounds for secure storage
- **JWT Tokens**: Stateless authentication with expiration
- **Error Handling**: Comprehensive error responses

#### **User Login**
```javascript
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

### **4. Task Routes (`routes/tasks.js`)**

#### **Authentication Middleware**
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
```

#### **Get All Tasks**
```javascript
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

#### **Create New Task**
```javascript
router.post('/', [
  authMiddleware,
  body('title').notEmpty().trim().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('category').optional().isIn(['work', 'personal', 'study', 'health', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['pending', 'in-progress', 'completed'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, priority, status, dueDate } = req.body;

    const task = new Task({
      userId: req.userId,
      title,
      description,
      category: category || 'other',
      priority: priority || 'medium',
      status: status || 'pending',
      dueDate: dueDate || null
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

---

## 🎨 Client-Side Explanation

### **1. Authentication Context (`context/AuthContext.js`)**

The AuthContext provides global authentication state management using React's Context API.

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Features:**
- **Global State**: Authentication state available throughout the app
- **Persistent Login**: Uses localStorage to maintain login across sessions
- **Error Handling**: Centralized error handling for auth operations
- **Loading States**: Manates loading states during async operations

### **2. API Service (`services/api.js`)**

Centralized API configuration with Axios interceptors for automatic token handling.

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Tasks API calls
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export default api;
```

**Features:**
- **Request Interceptor**: Automatically adds JWT token to all requests
- **Response Interceptor**: Handles 401 errors by logging out users
- **Centralized Configuration**: Single place for API configuration
- **Organized Endpoints**: Grouped by feature (auth, tasks)

### **3. Landing Page (`components/Landing.js`)**

Professional landing page showcasing the application features.

**Key Components:**
- **Hero Section**: Eye-catching headline with call-to-action
- **Features Grid**: 6 key features with icons and descriptions
- **Navigation**: Fixed header with sign-in/get started buttons
- **CTA Section**: Compelling call-to-action
- **Footer**: Professional footer with company information

**Design Features:**
- **Gradient Backgrounds**: Modern visual appeal
- **Responsive Design**: Works on all screen sizes
- **Hover Effects**: Interactive elements with smooth transitions
- **Accessibility**: Proper semantic HTML and ARIA attributes

### **4. Dashboard (`components/Dashboard.js`)**

Main application interface for task management.

**Features:**
- **Task Display**: Grid layout showing all user tasks
- **Add Task Modal**: Form for creating new tasks
- **Task Management**: Delete functionality with confirmation
- **Visual Indicators**: Color-coded priorities and statuses
- **User Info**: Display current user information

**State Management:**
```javascript
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [showAddTask, setShowAddTask] = useState(false);
const [newTask, setNewTask] = useState({
  title: '',
  description: '',
  category: 'other',
  priority: 'medium',
  dueDate: ''
});
```

**API Integration:**
```javascript
const fetchTasks = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/tasks', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setTasks(response.data);
  } catch (err) {
    setError('Failed to fetch tasks');
    console.error('Error fetching tasks:', err);
  } finally {
    setLoading(false);
  }
};
```

---

## 🔐 Security Features

### **Backend Security**
1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **JWT Authentication**: Stateless tokens with expiration
3. **Input Validation**: express-validator for all inputs
4. **CORS Configuration**: Properly configured for frontend domain
5. **Error Handling**: Generic error messages to prevent information leakage

### **Frontend Security**
1. **Token Storage**: localStorage (consider httpOnly cookies for production)
2. **Automatic Logout**: Handles expired tokens gracefully
3. **Input Sanitization**: Form validation and sanitization
4. **Route Protection**: Protected routes that require authentication

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas)

### **Installation Steps**

#### **1. Backend Setup**
```bash
cd server
npm install
```

#### **2. Environment Configuration**
```bash
cd server
copy .env.example .env
```
Edit `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/task-management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

#### **3. Frontend Setup**
```bash
cd client
npm install
```

#### **4. Start Development Servers**

**Backend (Terminal 1):**
```bash
cd server
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd client
npm start
```

#### **5. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### **Tasks**
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

---

## 🎯 Features Implemented

### **Core Features**
- ✅ User registration and login
- ✅ JWT authentication
- ✅ Task CRUD operations
- ✅ Task categories and priorities
- ✅ Due date management
- ✅ Responsive design
- ✅ Professional landing page

### **Advanced Features**
- ✅ Context API for state management
- ✅ Axios interceptors for API calls
- ✅ Form validation and error handling
- ✅ Loading states and user feedback
- ✅ Modern UI with Tailwind CSS

---

## 🔧 Future Enhancements

### **Potential Additions**
1. **Drag and Drop**: Task reordering functionality
2. **Search & Filter**: Advanced task filtering options
3. **Dark Mode**: Theme toggle functionality
4. **Real-time Updates**: WebSocket integration
5. **File Attachments**: Task file uploads
6. **Collaboration**: Shared tasks and projects
7. **Notifications**: Email and in-app notifications
8. **Analytics**: Task completion statistics
9. **Export/Import**: Task data export functionality
10. **Mobile App**: React Native mobile application

---

## 📝 Learning Outcomes

This project demonstrates:

### **Backend Skills**
- RESTful API design
- Database modeling with Mongoose
- JWT authentication implementation
- Input validation and security
- Error handling best practices

### **Frontend Skills**
- React hooks and context API
- Modern CSS with Tailwind
- State management patterns
- API integration with Axios
- Component-based architecture

### **Full-Stack Skills**
- Client-server communication
- Authentication flow
- Data modeling and relationships
- Responsive web design
- Deployment considerations

---

## 🐛 Troubleshooting

### **Common Issues**

#### **1. MongoDB Connection Error**
- Ensure MongoDB is running locally
- Check connection string in `.env` file
- Verify MongoDB Atlas credentials if using cloud

#### **2. CORS Errors**
- Ensure backend is running on port 5000
- Check CORS configuration in server.js
- Verify frontend is making requests to correct URL

#### **3. JWT Token Issues**
- Check JWT_SECRET in `.env` file
- Ensure tokens are being stored correctly in localStorage
- Verify token expiration time

#### **4. Tailwind CSS Not Working**
- Run `npm install` in client directory
- Check PostCSS and Tailwind configuration files
- Ensure CSS imports are correct in index.js

---

## 📚 Technologies Used

### **Frontend Stack**
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **React Context**: State management

### **Backend Stack**
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **express-validator**: Input validation

---

## 🎓 Conclusion

This Task Management System is a comprehensive full-stack application that demonstrates modern web development practices. It includes user authentication, data persistence, responsive design, and professional UI/UX. The code is well-structured, secure, and scalable, making it an excellent addition to any developer portfolio.

The system can be easily extended with additional features and demonstrates the skills required for modern web development roles.
