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

// Store recently deleted tasks
const recentlyDeleted = [];

export const mockApi = {
  // Get all tasks
  getTasks: () => {
    // Check for tasks to restore (deleted more than 7 days ago)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Auto-restore tasks deleted more than 7 days ago
    const toRestore = recentlyDeleted.filter(item => 
      new Date(item.deletedAt) < sevenDaysAgo
    );
    
    toRestore.forEach(item => {
      mockTasks.push(item.task);
      const index = recentlyDeleted.findIndex(d => d.task._id === item.task._id);
      if (index > -1) {
        recentlyDeleted.splice(index, 1);
      }
    });
    
    return Promise.resolve({ data: mockTasks });
  },

  // Create new task
  createTask: (taskData) => {
    const newTask = {
      _id: Date.now().toString(),
      ...taskData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    mockTasks.push(newTask);
    return Promise.resolve({ data: newTask });
  },

  // Update task (for marking as complete)
  updateTask: (taskId, taskData) => {
    const index = mockTasks.findIndex(task => task._id === taskId);
    if (index > -1) {
      mockTasks[index] = { ...mockTasks[index], ...taskData };
      return Promise.resolve({ data: mockTasks[index] });
    }
    return Promise.resolve({ data: null });
  },

  // Delete task (move to recently deleted)
  deleteTask: (taskId) => {
    const index = mockTasks.findIndex(task => task._id === taskId);
    if (index > -1) {
      const deletedTask = mockTasks.splice(index, 1)[0];
      // Add to recently deleted with timestamp
      recentlyDeleted.push({
        task: deletedTask,
        deletedAt: new Date().toISOString()
      });
      return Promise.resolve({ data: { success: true, task: deletedTask } });
    }
    return Promise.resolve({ data: { success: false } });
  },

  // Get recently deleted tasks
  getRecentlyDeleted: () => {
    return Promise.resolve({ data: recentlyDeleted });
  },

  // Restore deleted task
  restoreTask: (taskId) => {
    const index = recentlyDeleted.findIndex(item => item.task._id === taskId);
    if (index > -1) {
      const restoredTask = recentlyDeleted.splice(index, 1)[0].task;
      mockTasks.push(restoredTask);
      return Promise.resolve({ data: restoredTask });
    }
    return Promise.resolve({ data: null });
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
