
const express = require('express')
const Project = require('../models/Project')
const Discussion = require('../models/Discussion')
const Notification = require('../models/Notification')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()
router.use(auth)

async function getProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId)
  if (!project) return { error: 'Project not found', status: 404 }

  const isOwner = String(project.owner) === String(userId)
  const isMember = project.members.some(
    (member) => String(member) === String(userId)
  )

  if (!isOwner && !isMember) {
    return { error: 'You are not a member of this project', status: 403 }
  }

  return { project }
}

// Get project discussions
router.get('/:projectId', async (req, res) => {
  try {
    const access = await getProjectAccess(req.params.projectId, req.userId)
    if (access.error) {
      return res.status(access.status).json({ message: access.error })
    }

    const messages = await Discussion.find({ project: access.project._id })
      .populate('author', 'name')
      .sort({ createdAt: 1 })
      .limit(200)

    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: 'Could not load discussions' })
  }
})

// Send a message
router.post('/:projectId', async (req, res) => {
  try {
    const access = await getProjectAccess(req.params.projectId, req.userId)
    if (access.error) {
      return res.status(access.status).json({ message: access.error })
    }

    const message = String(req.body.message || '').trim()

    if (!message) {
      return res.status(400).json({ message: 'Message cannot be empty' })
    }

    if (message.length > 2000) {
      return res.status(400).json({ message: 'Message cannot exceed 2000 characters' })
    }
    const recipients = access.project.members
  .map((member) => String(member))
  .filter((id) => id !== String(req.userId))

if (recipients.length) {
  try {
    const author = await User.findById(req.userId).select('name')

    await Notification.insertMany(
      recipients.map((recipient) => ({
        recipient,
        actor: req.userId,
        project: access.project._id,
        type: 'discussion',
        message: `${author?.name || 'A teammate'} posted a new discussion message`,
      }))
    )
  } catch (notificationError) {
    console.error('Discussion notification error:', notificationError)
  }
}

    const created = await Discussion.create({
      project: access.project._id,
      author: req.userId,
      message,
    })

    await created.populate('author', 'name')
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ message: 'Could not send message' })
  }
})

// Delete your own message
router.delete('/:projectId/:messageId', async (req, res) => {
  try {
    const access = await getProjectAccess(req.params.projectId, req.userId)
    if (access.error) {
      return res.status(access.status).json({ message: access.error })
    }

    const deleted = await Discussion.findOneAndDelete({
      _id: req.params.messageId,
      project: access.project._id,
      author: req.userId,
    })

    if (!deleted) {
      return res.status(404).json({
        message: 'Message not found or you cannot delete it',
      })
    }

    res.json({ message: 'Message deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Could not delete message' })
  }
})

module.exports = router
