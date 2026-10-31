const express = require('express')
const Project = require('../models/Project')
const Task = require('../models/Task')
const Comment = require('../models/Comment')
const auth = require('../middleware/auth')

const router = express.Router()
router.use(auth)

// Task load karo aur check karo ki user uske project ka member hai
async function loadTask(req, res) {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      res.status(404).json({ message: 'Task not found' })
      return null
    }
    const project = await Project.findById(task.project)
    if (!project || !project.members.some((m) => m.toString() === req.userId)) {
      res.status(403).json({ message: 'You are not a member of this project' })
      return null
    }
    return task
  } catch {
    res.status(400).json({ message: 'Invalid task id' })
    return null
  }
}
// Mujhe assign hue tasks (saare projects se)
router.get('/mine', async (req, res) => {
  const projects = await Project.find({ members: req.userId }).select('_id')
  const tasks = await Task.find({
    assignees: req.userId,
    project: { $in: projects.map((p) => p._id) },
  })
    .populate('project', 'name color')
    .sort('-createdAt')
  res.json(tasks)
})

// Dashboard ke liye: mere projects aur unke saare tasks
router.get('/overview', async (req, res) => {
  const projects = await Project.find({ members: req.userId }).select('name color')
  const tasks = await Task.find({ project: { $in: projects.map((p) => p._id) } })
    .select('project status dueDate assignees')
  res.json({ projects, tasks })
})

// Task update (title, status, priority, subtasks, etc.)
router.patch('/:id', async (req, res) => {
  const task = await loadTask(req, res)
  if (!task) return
   if (req.body.assignees !== undefined) {
    const project = await Project.findById(task.project)
    const memberIds = project.members.map((m) => m.toString())
    const list = req.body.assignees
    if (!Array.isArray(list) || !list.every((id) => memberIds.includes(String(id)))) {
      return res.status(400).json({ message: 'Assignees must be members of this project' })
    }
  }

  const allowed = ['title', 'description', 'status', 'priority', 'category', 'dueDate', 'assignees', 'subtasks']
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field]
  })

  try {
    await task.save()
    await task.populate('assignees', 'name email')
    res.json(task)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Task delete (uske comments bhi)
router.delete('/:id', async (req, res) => {
  const task = await loadTask(req, res)
  if (!task) return
  await Comment.deleteMany({ task: task._id })
  await task.deleteOne()
  res.json({ message: 'Task deleted' })
})

// Task ke saare comments
router.get('/:id/comments', async (req, res) => {
  const task = await loadTask(req, res)
  if (!task) return
  const comments = await Comment.find({ task: task._id })
    .populate('author', 'name')
    .sort('createdAt')
  res.json(comments)
})

// Naya comment
router.post('/:id/comments', async (req, res) => {
  const task = await loadTask(req, res)
  if (!task) return

  const text = req.body.text?.trim()
  if (!text) return res.status(400).json({ message: 'Comment cannot be empty' })

  try {
    const comment = await Comment.create({ task: task._id, author: req.userId, text })
    await comment.populate('author', 'name')
    res.status(201).json(comment)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Comment delete (sirf likhne wala)
router.delete('/:id/comments/:commentId', async (req, res) => {
  const task = await loadTask(req, res)
  if (!task) return

  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, task: task._id })
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can delete only your own comments' })
    }
    await comment.deleteOne()
    res.json({ message: 'Comment deleted' })
  } catch {
    res.status(400).json({ message: 'Invalid comment id' })
  }
})

module.exports = router