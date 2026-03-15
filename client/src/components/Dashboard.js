import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI } from '../services/api';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showRecentlyDeleted, setShowRecentlyDeleted] = useState(false);
  const [recentlyDeletedTasks, setRecentlyDeletedTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    dueDate: ''
  });
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    username: '',
    avatar: '👤',
    bio: '',
    profileImage: null
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const profileData = localStorage.getItem('profile');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      const savedProfile = JSON.parse(localStorage.getItem('profile') || '{}');
      setUser(parsedUser);
      setProfileData({
        username: savedProfile.username || parsedUser.username || 'Demo User',
        avatar: savedProfile.avatar || '👤',
        bio: savedProfile.bio || '',
        profileImage: savedProfile.profileImage || null
      });
    }

    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create(newTask);
      
      setNewTask({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        dueDate: ''
      });
      setShowAddTask(false);
      fetchTasks();
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await tasksAPI.delete(taskId);
      
      // Show success message and add to recently deleted
      if (response.data.success) {
        setError(`Task "${response.data.task.title}" deleted. Click "Recently Deleted" to restore.`);
        // Load recently deleted tasks
        loadRecentlyDeleted();
      }
      
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const loadRecentlyDeleted = async () => {
    try {
      const response = await tasksAPI.getRecentlyDeleted();
      setRecentlyDeletedTasks(response.data);
    } catch (err) {
      console.error('Error loading recently deleted tasks:', err);
    }
  };

  const handleRestoreTask = async (taskId) => {
    try {
      await tasksAPI.restore(taskId);
      setError('Task restored successfully!');
      loadRecentlyDeleted();
      fetchTasks();
    } catch (err) {
      setError('Failed to restore task');
      console.error('Error restoring task:', err);
    }
  };

  const formatDeletedDate = (deletedAt) => {
    const deletedDate = new Date(deletedAt);
    const now = new Date();
    const diffTime = Math.abs(now - deletedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Deleted today';
    if (diffDays === 1) return 'Deleted yesterday';
    if (diffDays < 7) return `Deleted ${diffDays} days ago`;
    return `Deleted ${diffDays} days ago (will auto-restore soon)`;
  };

  const handleToggleComplete = async (taskId) => {
    try {
      // Find the task and determine new status
      const task = tasks.find(t => t._id === taskId);
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      
      // Update local state immediately for instant feedback
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t._id === taskId ? { ...t, status: newStatus } : t
        )
      );
      
      // Then update via API
      await tasksAPI.update(taskId, { status: newStatus });
      
      // Refresh to ensure consistency (optional, but good for safety)
      fetchTasks();
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
      // Revert to original state if API fails
      fetchTasks();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    navigate('/login');
  };

  const handleProfileUpdate = () => {
    // Update user data with profile info
    const updatedUser = {
      ...user,
      username: profileData.username,
      avatar: profileData.avatar,
      bio: profileData.bio,
      profileImage: profileData.profileImage
    };
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('profile', JSON.stringify(profileData));
    
    // Update state
    setUser(updatedUser);
    setShowProfile(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileData({ ...profileData, profileImage: null });
  };

  const avatars = ['👤', '👨', '👩', '🧑', '👦', '👧', '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍🚀', '👩‍🚀', '🧑‍🚀', '🦸', '🦸‍♂️', '🦸‍♀️', '🦹', '🦹‍♂️', '🦹‍♀️', '🎭', '🤖', '👽', '🤡', '💀', '🎃', '👻', '👹', '👺', '🤖', '🦾', '🦿', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'study': return '📚';
      case 'health': return '💪';
      default: return '📌';
    }
  };

  // Filter tasks based on filter and search
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          task.category === filter || 
                          task.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    highPriority: tasks.filter(t => t.priority === 'high').length
  };

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(true)}
                className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm overflow-hidden"
                title="Click to customize profile"
              >
                {profileData.profileImage ? (
                  <img 
                    src={profileData.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">{profileData.avatar}</span>
                )}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
                <p className="text-sm text-gray-600">Welcome back, {profileData.username}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStats(!showStats)}
                className="text-gray-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                📊
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">📁 Categories</h3>
              <div className="space-y-2">
                {[
                  { id: 'all', name: 'All Tasks', icon: '📋' },
                  { id: 'work', name: 'Work', icon: '💼' },
                  { id: 'personal', name: 'Personal', icon: '👤' },
                  { id: 'study', name: 'Study', icon: '📚' },
                  { id: 'health', name: 'Health', icon: '💪' },
                  { id: 'other', name: 'Other', icon: '📌' }
                ].map(category => (
                  <button
                    key={category.id}
                    onClick={() => setFilter(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filter === category.id 
                        ? 'bg-indigo-100 text-indigo-700 font-medium' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">🎯 Status</h3>
              <div className="space-y-2">
                {[
                  { id: 'all', name: 'All Status' },
                  { id: 'pending', name: '⏳ Pending' },
                  { id: 'in-progress', name: '🔄 In Progress' },
                  { id: 'completed', name: '✅ Completed' }
                ].map(status => (
                  <button
                    key={status.id}
                    onClick={() => setFilter(status.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filter === status.id 
                        ? 'bg-green-100 text-green-700 font-medium' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {status.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Recently Deleted */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <button
                onClick={() => {
                  setShowRecentlyDeleted(true);
                  loadRecentlyDeleted();
                }}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-red-100 text-red-700 font-medium"
              >
                🗑️ Recently Deleted
                {recentlyDeletedTasks.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {recentlyDeletedTasks.length}
                  </span>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Tasks auto-restore after 7 days
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Stats Section */}
            {showStats && (
              <section className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-3xl mb-2">✅</div>
                    <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-3xl mb-2">🔄</div>
                    <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-3xl mb-2">⏳</div>
                    <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="text-3xl mb-2">🔥</div>
                    <div className="text-2xl font-bold text-red-600">{taskStats.highPriority}</div>
                    <div className="text-sm text-gray-600">High Priority</div>
                  </div>
                </div>
              </section>
            )}

            {/* Search and Add */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <input
                  type="text"
                  placeholder="🔍 Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                />
                <button
                  onClick={() => setShowAddTask(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
                >
                  ✨ Add Task
                </button>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {filteredTasks.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-6">Create your first task to get started!</p>
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-indigo-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleComplete(task._id)}
                          className={`p-1 rounded transition-colors ${
                            task.status === 'completed' 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {task.status === 'completed' ? '✅' : '⭕'}
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {getCategoryIcon(task.category)} {task.category}
                      </span>
                    </div>
                    
                    {task.dueDate && (
                      <div className="text-sm text-gray-500">
                        📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">✨ Add New Task</h2>
            <form onSubmit={handleAddTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="work">💼 Work</option>
                  <option value="personal">👤 Personal</option>
                  <option value="study">📚 Study</option>
                  <option value="health">💪 Health</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Customize Profile</h2>
            
            {/* Profile Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  {profileData.profileImage ? (
                    <img 
                      src={profileData.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {profileData.avatar}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer mb-2"
                  >
                    📷 Upload Image
                  </label>
                  {profileData.profileImage && (
                    <button
                      onClick={removeProfileImage}
                      className="block w-full text-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      🗑️ Remove Image
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
                </div>
              </div>
            </div>

            {/* Avatar Selection (shown when no image) */}
            {!profileData.profileImage && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Choose Avatar</label>
                <div className="grid grid-cols-8 gap-2 mb-4 max-h-32 overflow-y-auto">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setProfileData({ ...profileData, avatar })}
                      className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                        profileData.avatar === avatar 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your username"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleProfileUpdate}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Profile
              </button>
              <button
                onClick={() => setShowProfile(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recently Deleted Modal */}
      {showRecentlyDeleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🗑️ Recently Deleted Tasks</h2>
            
            {recentlyDeletedTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-600">No recently deleted tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentlyDeletedTasks.map((item) => (
                  <div key={item.task._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.task.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.task.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{getCategoryIcon(item.task.category)} {item.task.category}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.task.priority)}`}>
                            {item.task.priority}
                          </span>
                          <span>{formatDeletedDate(item.deletedAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestoreTask(item.task._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ♻️ Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Deleted tasks are automatically restored after 7 days. 
                You can manually restore them anytime by clicking the "Restore" button.
              </p>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRecentlyDeleted(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
