// Mock API for Vercel deployment demo
const mockTasks = [
  {
    _id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive README and setup guides',
    category: 'work',
    priority: 'high',
    status: 'in-progress',
    dueDate: '2026-03-20',
    createdAt: '2026-03-15T00:00:00.000Z'
  },
  {
    _id: '2',
    title: 'Review pull requests',
    description: 'Check and approve pending PRs',
    category: 'work',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-03-18',
    createdAt: '2026-03-15T00:00:00.000Z'
  },
  {
    _id: '3',
    title: 'Update portfolio',
    description: 'Add new projects to portfolio website',
    category: 'personal',
    priority: 'low',
    status: 'completed',
    dueDate: '2026-03-25',
    createdAt: '2026-03-15T00:00:00.000Z'
  },
  {
    _id: '4',
    title: 'Learn TypeScript',
    description: 'Complete TypeScript course and practice',
    category: 'study',
    priority: 'medium',
    status: 'in-progress',
    dueDate: '2026-03-30',
    createdAt: '2026-03-15T00:00:00.000Z'
  },
  {
    _id: '5',
    title: 'Gym workout',
    description: 'Complete weekly workout routine',
    category: 'health',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-03-17',
    createdAt: '2026-03-15T00:00:00.000Z'
  }
];

export const mockApi = {
  // Get all tasks
  getTasks: () => {
    return Promise.resolve({ data: mockTasks });
  },

  // Create new task
  createTask: (taskData) => {
    const newTask = {
      _id: Date.now().toString(),
      ...taskData,
      createdAt: new Date().toISOString()
    };
    mockTasks.push(newTask);
    return Promise.resolve({ data: newTask });
  },

  // Delete task
  deleteTask: (taskId) => {
    const index = mockTasks.findIndex(task => task._id === taskId);
    if (index > -1) {
      mockTasks.splice(index, 1);
    }
    return Promise.resolve({ data: {} });
  }
};

// Mock authentication
export const mockAuth = {
  login: (email, password) => {
    return Promise.resolve({
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          username: 'demo-user',
          email: email
        }
      }
    });
  },

  register: (username, email, password) => {
    return Promise.resolve({
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          username: username,
          email: email
        }
      }
    });
  }
};
