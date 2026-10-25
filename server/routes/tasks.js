const express = require('express')
const Project = require('../models/Project')
const Task = require('../models/Task')
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

// Task update (title, status, priority, subtasks, etc.)
router.patch('/:id', async (req, res) => {
  const task = await loadTask(req, res)
  if (!task) return

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

// Task delete
router.delete('/:id', async (req, res) => {
  const task = await loadTask(req, res)
  if (!task) return
  await task.deleteOne()
  res.json({ message: 'Task deleted' })
})

module.exports = router