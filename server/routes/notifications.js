
const express = require('express')
const Notification = require('../models/Notification')
const auth = require('../middleware/auth')

const router = express.Router()
router.use(auth)

// Get your notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.userId,
    })
      .populate('actor', 'name')
      .populate('project', 'name')
      .populate('task', 'title description')
      .sort({ createdAt: -1 })
      .limit(100)

    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: 'Could not load notifications' })
  }
})

// Mark one notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId },
      { read: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json(notification)
  } catch (err) {
    res.status(500).json({ message: 'Could not update notification' })
  }
})

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { read: true }
    )

    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Could not update notifications' })
  }
})

// Delete one notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId,
    })

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json({ message: 'Notification deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Could not delete notification' })
  }
})

module.exports = router
