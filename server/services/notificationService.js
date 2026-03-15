const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('./emailService');

class NotificationService {
  constructor() {
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔔 Notification service started');

    // Check for deadline reminders every hour
    cron.schedule('0 * * * *', async () => {
      await this.checkDeadlineReminders();
    });

    // Check for overdue tasks every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.checkOverdueTasks();
    });

    // Initial check on startup
    this.checkDeadlineReminders();
  }

  async checkDeadlineReminders() {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Find tasks due in next 24 hours
      const tasksDueSoon = await Task.find({
        dueDate: {
          $gte: now,
          $lte: tomorrow
        },
        status: { $ne: 'completed' }
      }).populate('userId');

      // Find tasks due in next week
      const tasksDueNextWeek = await Task.find({
        dueDate: {
          $gte: tomorrow,
          $lte: nextWeek
        },
        status: { $ne: 'completed' }
      }).populate('userId');

      // Process 24-hour reminders
      for (const task of tasksDueSoon) {
        await this.createReminder(task, '24_hours');
      }

      // Process 1-week reminders
      for (const task of tasksDueNextWeek) {
        await this.createReminder(task, '1_week');
      }

    } catch (error) {
      console.error('Error checking deadline reminders:', error);
    }
  }

  async checkOverdueTasks() {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Find tasks that became overdue in the last 24 hours
      const overdueTasks = await Task.find({
        dueDate: {
          $gte: yesterday,
          $lte: now
        },
        status: { $ne: 'completed' }
      }).populate('userId');

      for (const task of overdueTasks) {
        await this.createOverdueNotification(task);
      }

    } catch (error) {
      console.error('Error checking overdue tasks:', error);
    }
  }

  async createReminder(task, reminderType) {
    try {
      // Check if reminder already exists
      const existingNotification = await Notification.findOne({
        taskId: task._id,
        type: 'deadline_reminder',
        sent: true
      });

      if (existingNotification) return;

      // Create notification
      const notification = new Notification({
        userId: task.userId._id,
        taskId: task._id,
        type: 'deadline_reminder',
        title: `Deadline Reminder: ${task.title}`,
        message: reminderType === '24_hours' 
          ? `Your task "${task.title}" is due tomorrow!`
          : `Your task "${task.title}" is due next week.`,
        email: task.userId.email,
        scheduledFor: new Date()
      });

      await notification.save();

      // Send email
      const success = await emailService.sendDeadlineReminder(
        task.userId.email,
        task.userId.username,
        task.title,
        task.dueDate
      );

      if (success) {
        notification.sent = true;
        notification.sentAt = new Date();
        await notification.save();
      }

    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  }

  async createOverdueNotification(task) {
    try {
      // Check if overdue notification already exists
      const existingNotification = await Notification.findOne({
        taskId: task._id,
        type: 'task_overdue',
        sent: true
      });

      if (existingNotification) return;

      // Create notification
      const notification = new Notification({
        userId: task.userId._id,
        taskId: task._id,
        type: 'task_overdue',
        title: `Task Overdue: ${task.title}`,
        message: `Your task "${task.title}" was due on ${new Date(task.dueDate).toLocaleDateString()}`,
        email: task.userId.email,
        scheduledFor: new Date()
      });

      await notification.save();

      // Send email (you could create a separate email template for overdue)
      const success = await emailService.sendDeadlineReminder(
        task.userId.email,
        task.userId.username,
        task.title + ' (OVERDUE)',
        task.dueDate
      );

      if (success) {
        notification.sent = true;
        notification.sentAt = new Date();
        await notification.save();
      }

    } catch (error) {
      console.error('Error creating overdue notification:', error);
    }
  }

  async sendTaskCompletionEmail(taskId, userId) {
    try {
      const task = await Task.findById(taskId);
      const user = await User.findById(userId);

      if (!task || !user) return;

      await emailService.sendTaskCompleted(
        user.email,
        user.username,
        task.title
      );

      // Create notification record
      const notification = new Notification({
        userId: user._id,
        taskId: task._id,
        type: 'task_completed',
        title: `Task Completed: ${task.title}`,
        message: `Congratulations! You completed "${task.title}"`,
        email: user.email,
        sent: true,
        sentAt: new Date(),
        scheduledFor: new Date()
      });

      await notification.save();

    } catch (error) {
      console.error('Error sending task completion email:', error);
    }
  }

  async getUserNotifications(userId) {
    try {
      const notifications = await Notification.find({ userId })
        .populate('taskId')
        .sort({ createdAt: -1 })
        .limit(50);

      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }
}

module.exports = new NotificationService();
