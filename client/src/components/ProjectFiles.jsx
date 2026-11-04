
import { useEffect, useState } from 'react'
import { Upload, Download, Trash2, File, RefreshCw } from 'lucide-react'

const API = 'http://localhost:5000/api'

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProjectFiles({ projectId, token, isOwner }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const loadFiles = async () => {
    try {
      setError('')
      const res = await fetch(`${API}/files/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not load files')
      setFiles(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    loadFiles()
  }, [projectId, token])

  const uploadFile = async (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch(`${API}/files/${projectId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')

      setFiles((prev) => [data, ...prev])
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const downloadFile = async (file) => {
    try {
      setError('')
      const res = await fetch(
        `${API}/files/${projectId}/${file._id}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Download failed')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.originalName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteFile = async (file) => {
    if (!window.confirm(`Delete "${file.originalName}"?`)) return

    try {
      setError('')
      const res = await fetch(
        `${API}/files/${projectId}/${file._id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Delete failed')

      setFiles((prev) => prev.filter((item) => item._id !== file._id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-zinc-100">
            Project files
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Shared documents and resources for this project.
          </p>
        </div>

        <label className={`flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:opacity-90 ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
          {uploading ? <RefreshCw size={15} className="animate-spin" /> : <Upload size={15} />}
          {uploading ? 'Uploading...' : 'Upload file'}
          <input
            type="file"
            className="hidden"
            onChange={uploadFile}
            disabled={uploading}
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-zinc-500">
        Maximum file size: 20 MB. Supported: PDF, Office documents, images, TXT, CSV and ZIP.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        {loading ? (
          <p className="p-8 text-center text-sm text-zinc-500">Loading files...</p>
        ) : files.length === 0 ? (
          <div className="p-10 text-center">
            <File size={30} className="mx-auto text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-300">No files uploaded yet</p>
            <p className="mt-1 text-xs text-zinc-500">Upload your first project file.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {files.map((file) => (
              <div key={file._id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/5 text-zinc-400">
                  <File size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {file.originalName}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatSize(file.size)} · {file.uploadedBy?.name || 'Unknown'} ·{' '}
                    {new Date(file.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <button
                  onClick={() => downloadFile(file)}
                  title="Download"
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                >
                  <Download size={16} />
                </button>

                {isOwner && (
                  <button
                    onClick={() => deleteFile(file)}
                    title="Delete"
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-red-400/10 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
