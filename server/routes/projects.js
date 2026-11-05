const express = require('express')
const Project = require('../models/Project')
const Task = require('../models/Task')
const Comment = require('../models/Comment')
const User = require('../models/User')
const auth = require('../middleware/auth')
const router = express.Router()

// Is router ke saare routes ke liye login zaroori
router.use(auth)

// Project load karo, aur check karo ki user member hai ya nahi
async function loadProject(req, res) {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      res.status(404).json({ message: 'Project not found' })
      return null
    }
    if (!project.members.some((m) => m.toString() === req.userId)) {
      res.status(403).json({ message: 'You are not a member of this project' })
      return null
    }
    return project
  } catch {
    res.status(400).json({ message: 'Invalid project id' })
    return null
  }
}

// Mere saare projects
router.get('/', async (req, res) => {
  const projects = await Project.find({ members: req.userId })
    .populate('members', 'name email')
    .sort('-createdAt')
  res.json(projects)
})

// Naya project
router.post('/', async (req, res) => {
  const { name, description, color } = req.body
  if (!name) return res.status(400).json({ message: 'Project name is required' })

  const project = await Project.create({
    name,
    description,
    color,
    owner: req.userId,
    members: [req.userId],
  })
  res.status(201).json(project)
})

// Ek project ki detail
router.get('/:id', async (req, res) => {
  const project = await loadProject(req, res)
  if (!project) return
  await project.populate('members', 'name email')
  res.json(project)
})

// Project delete (sirf owner)
router.delete('/:id', async (req, res) => {
  const project = await loadProject(req, res)
  if (!project) return
  if (project.owner.toString() !== req.userId) {
    return res.status(403).json({ message: 'Only the owner can delete this project' })
  }
    const taskIds = (await Task.find({ project: project._id }).select('_id')).map((t) => t._id)
  await Comment.deleteMany({ task: { $in: taskIds } })
  await Task.deleteMany({ project: project._id })
  await project.deleteOne()
  res.json({ message: 'Project deleted' })
})

// Member add karo email se (sirf owner)
router.post('/:id/members', async (req, res) => {
  const project = await loadProject(req, res)
  if (!project) return
  if (project.owner.toString() !== req.userId) {
    return res.status(403).json({ message: 'Only the owner can add members' })
  }
  const user = await User.findOne({ email: req.body.email?.toLowerCase() })
  if (!user) return res.status(404).json({ message: 'No user with that email' })

 const alreadyMember = project.members.some(
  (m) => m.toString() === user._id.toString()
)

if (!alreadyMember) {
  project.members.push(user._id)
  await project.save()

  try {
    await Notification.create({
      recipient: user._id,
      actor: req.userId,
      project: project._id,
      type: 'project_invite',
      message: `You have been added to project: ${project.name}`,
    })
  } catch (notificationError) {
    console.error('Project invitation notification error:', notificationError)
  }
}
  await project.populate('members', 'name email')
  res.json(project)
})

// Project ke saare tasks
router.get('/:id/tasks', async (req, res) => {
  const project = await loadProject(req, res)
  if (!project) return
  const tasks = await Task.find({ project: project._id })
    .populate('assignees', 'name email')
    .sort('createdAt')
  res.json(tasks)
})

// Project mein naya task
router.post('/:id/tasks', async (req, res) => {
  const project = await loadProject(req, res)
  if (!project) return

  const { title, description, status, priority, category, dueDate, assignees, subtasks } = req.body
  if (!title) return res.status(400).json({ message: 'Task title is required' })

  try {
    const task = await Task.create({
      project: project._id,
      title,
      description,
      status,
      priority,
      category,
      dueDate,
      assignees,
      subtasks,
      createdBy: req.userId,
    })
  const assignedUsers = (task.assignees || [])
  .map((id) => String(id))
  .filter((id) => id !== String(req.userId))

if (assignedUsers.length) {
  try {
    await Notification.insertMany(
      assignedUsers.map((recipient) => ({
        recipient,
        actor: req.userId,
        project: project._id,
        task: task._id,
        type: 'task_assigned',
        message: `Task assignment updated: ${task.title}`,
      }))
    )
  } catch (notificationError) {
    console.error('Task creation notification error:', notificationError)
  }
}
    res.status(201).json(task)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})
// Project ka naam badalna (sirf owner)
router.patch('/:id', async (req, res) => {
  const project = await loadProject(req, res)
  if (!project) return
  if (project.owner.toString() !== req.userId) {
    return res.status(403).json({ message: 'Only the owner can rename this project' })
  }
  const name = req.body.name?.trim()
  if (!name) return res.status(400).json({ message: 'Project name is required' })

  project.name = name
  await project.save()
  res.json(project)
})

// Member ko project se hatana (sirf owner)
router.delete('/:id/members/:userId', async (req, res) => {
  const project = await loadProject(req, res)
  if (!project) return
  if (project.owner.toString() !== req.userId) {
    return res.status(403).json({ message: 'Only the owner can remove members' })
  }
  if (req.params.userId === project.owner.toString()) {
    return res.status(400).json({ message: 'The owner cannot be removed' })
  }

  project.members = project.members.filter((m) => m.toString() !== req.params.userId)
  await project.save()
  await Task.updateMany({ project: project._id }, { $pull: { assignees: req.params.userId } })

  await project.populate('members', 'name email')
  res.json(project)
})

module.exports = router