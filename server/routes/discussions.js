
const express = require('express')
const Project = require('../models/Project')
const Discussion = require('../models/Discussion')
const Notification = require('../models/Notification')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()
router.use(auth)

// Check project access
async function getProjectAccess(projectId, userId) {
  const project = await Project.findById(projectId)

  if (!project) {
    return { error: 'Project not found', status: 404 }
  }

  const isOwner = String(project.owner) === String(userId)

  const isMember = project.members.some(
    (member) => String(member) === String(userId)
  )

  if (!isOwner && !isMember) {
    return {
      error: 'You are not a member of this project',
      status: 403,
    }
  }

  return { project }
}

// Get project discussions
router.get('/:projectId', async (req, res) => {
  try {
    const access = await getProjectAccess(
      req.params.projectId,
      req.userId
    )

    if (access.error) {
      return res.status(access.status).json({
        message: access.error,
      })
    }

    const messages = await Discussion.find({
      project: access.project._id,
    })
      .populate('author', 'name')
      .sort({ createdAt: 1 })
      .limit(200)

    return res.json(messages)
  } catch (err) {
    console.error('Discussion fetch error:', err)

    return res.status(500).json({
      message: 'Could not load discussions',
    })
  }
})

// Send message + notifications
router.post('/:projectId', async (req, res) => {
  try {
    const access = await getProjectAccess(
      req.params.projectId,
      req.userId
    )

    if (access.error) {
      return res.status(access.status).json({
        message: access.error,
      })
    }

    const message = String(req.body.message || '').trim()

    if (!message) {
      return res.status(400).json({
        message: 'Message cannot be empty',
      })
    }

    if (message.length > 2000) {
      return res.status(400).json({
        message: 'Message cannot exceed 2000 characters',
      })
    }

    // Save discussion message
    const created = await Discussion.create({
      project: access.project._id,
      author: req.userId,
      message,
    })

    await created.populate('author', 'name')

    // Get all project users including owner
    const projectUserIds = [
      access.project.owner,
      ...access.project.members,
    ]

    const users = await User.find({
      _id: { $in: projectUserIds },
    }).select('_id name email')

    // Detect @mentions
    const mentionedUsers = users.filter((user) => {
      if (String(user._id) === String(req.userId)) {
        return false
      }

      const nameTag = `@${user.name}`
      const emailTag = `@${user.email}`

      return (
        message.toLowerCase().includes(nameTag.toLowerCase()) ||
        message.toLowerCase().includes(emailTag.toLowerCase())
      )
    })

    // Get notification recipients
    const recipients = [
      access.project.owner,
      ...access.project.members,
    ]
      .map((id) => String(id))
      .filter(
        (id, index, self) =>
          id !== String(req.userId) &&
          self.indexOf(id) === index
      )

    // Debug information
    console.log('DISCUSSION MESSAGE:', message)

    console.log(
      'PROJECT USERS:',
      users.map((user) => ({
        id: String(user._id),
        name: user.name,
        email: user.email,
      }))
    )

    console.log(
      'MENTIONED USERS:',
      mentionedUsers.map((user) => user.name)
    )

    // Normal discussion notifications
    if (recipients.length) {
      try {
        const discussionNotifications = recipients.map(
          (recipient) => ({
            recipient,
            actor: req.userId,
            project: access.project._id,
            type: 'discussion',
            message: `${created.author?.name || 'A teammate'} posted a new discussion message`,
            discussionMessage: created.message,
          })
        )

        await Notification.insertMany(
          discussionNotifications
        )

        console.log(
          'Discussion notifications sent:',
          recipients
        )
      } catch (error) {
        console.error(
          'Discussion notification failed:',
          error
        )
      }
    }

    // Mention notifications
    if (mentionedUsers.length) {
      try {
        const mentionNotifications = mentionedUsers.map(
          (user) => ({
            recipient: user._id,
            actor: req.userId,
            project: access.project._id,
            type: 'mention',
            message: `You were mentioned in a discussion by ${created.author?.name || 'a teammate'}`,
            discussionMessage: created.message,
          })
        )

        await Notification.insertMany(
          mentionNotifications
        )

        console.log(
          'Mention notifications sent:',
          mentionedUsers.map((user) => user.name)
        )
      } catch (error) {
        console.error(
          'Mention notification failed:',
          error
        )
      }
    } else {
      console.log(
        'No users matched the mention:',
        message
      )
    }

    return res.status(201).json(created)

  } catch (err) {
    console.error('Discussion error:', err)

    return res.status(500).json({
      message: 'Could not send message',
    })
  }
})

// Delete your own message
router.delete('/:projectId/:messageId', async (req, res) => {
  try {
    const access = await getProjectAccess(
      req.params.projectId,
      req.userId
    )

    if (access.error) {
      return res.status(access.status).json({
        message: access.error,
      })
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

    return res.json({
      message: 'Message deleted',
    })

  } catch (err) {
    console.error('Discussion delete error:', err)

    return res.status(500).json({
      message: 'Could not delete message',
    })
  }
})

module.exports = router
