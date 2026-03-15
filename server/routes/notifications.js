const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const authMiddleware = require('../middleware/auth');

// Get user notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.userId);
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send task completion email (when user completes a task)
router.post('/task-completed/:taskId', authMiddleware, async (req, res) => {
  try {
    await notificationService.sendTaskCompletionEmail(req.params.taskId, req.userId);
    res.json({ message: 'Completion email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
