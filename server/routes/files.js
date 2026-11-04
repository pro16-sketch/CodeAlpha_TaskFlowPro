const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const Project = require('../models/Project')
const ProjectFile = require('../models/ProjectFile')
const auth = require('../middleware/auth')

const router = express.Router()
router.use(auth)

const uploadDir = path.join(__dirname, '../uploads/project-files')
fs.mkdirSync(uploadDir, { recursive: true })

const allowedExtensions = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.ppt', '.pptx', '.txt', '.csv',
  '.png', '.jpg', '.jpeg', '.webp', '.zip',
])

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    cb(null, `${crypto.randomUUID()}${extension}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase()
    if (!allowedExtensions.has(extension)) {
      return cb(new Error('This file type is not allowed'))
    }
    cb(null, true)
  },
})

async function getProject(req, res) {
  const project = await Project.findById(req.params.projectId)

  if (!project) {
    res.status(404).json({ message: 'Project not found' })
    return null
  }

  const isMember = project.members.some(
    (member) => member.toString() === req.userId
  )

  if (!isMember) {
    res.status(403).json({ message: 'You are not a member of this project' })
    return null
  }

  return project
}

// List project files
router.get('/:projectId', async (req, res) => {
  try {
    const project = await getProject(req, res)
    if (!project) return

    const files = await ProjectFile.find({ project: project._id })
      .populate('uploadedBy', 'name email')
      .sort('-createdAt')

    res.json(files)
  } catch (err) {
    res.status(500).json({ message: 'Could not load project files' })
  }
})

// Upload a file
router.post('/:projectId', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.code === 'LIMIT_FILE_SIZE'
          ? 'File size must be 20 MB or less'
          : err.message,
      })
    }
    next()
  })
}, async (req, res) => {
  let uploadedPath

  try {
    const project = await getProject(req, res)
    if (!project) {
      if (req.file) fs.unlinkSync(req.file.path)
      return
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file' })
    }

    uploadedPath = req.file.path

    const file = await ProjectFile.create({
      project: project._id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.userId,
    })

    await file.populate('uploadedBy', 'name email')
    res.status(201).json(file)
  } catch (err) {
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      fs.unlinkSync(uploadedPath)
    }
    res.status(500).json({ message: 'File upload failed' })
  }
})

// Download a file
router.get('/:projectId/:fileId/download', async (req, res) => {
  try {
    const project = await getProject(req, res)
    if (!project) return

    const file = await ProjectFile.findOne({
      _id: req.params.fileId,
      project: project._id,
    })

    if (!file) return res.status(404).json({ message: 'File not found' })

    const filePath = path.join(uploadDir, file.storedName)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Stored file is missing' })
    }

    res.download(filePath, file.originalName)
  } catch (err) {
    res.status(500).json({ message: 'Download failed' })
  }
})

// Delete a file (project owner only)
router.delete('/:projectId/:fileId', async (req, res) => {
  try {
    const project = await getProject(req, res)
    if (!project) return

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: 'Only the project owner can delete files',
      })
    }

    const file = await ProjectFile.findOne({
      _id: req.params.fileId,
      project: project._id,
    })

    if (!file) return res.status(404).json({ message: 'File not found' })

    const filePath = path.join(uploadDir, file.storedName)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    await file.deleteOne()
    res.json({ message: 'File deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'File deletion failed' })
  }
})

module.exports = router