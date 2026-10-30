import { useEffect, useState } from 'react'
import { X, Send, Trash2, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { request } from '../api'

const priorityStyle = {
  High: 'bg-red-400/15 text-red-300',
  Medium: 'bg-amber-300/15 text-amber-200',
  Low: 'bg-white/8 text-zinc-300',
}

const STATUS_LABEL = { todo: 'To Do', inprogress: 'In Progress', done: 'Done' }

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function TaskModal({ task,members = [], onClose, onUpdated }) {
  const { user, token } = useAuth()
  const myId = user?.id || user?._id

  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const subtasks = task.subtasks || []
  const done = subtasks.filter((s) => s.done).length
  const percent = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0
    

  const assigneeIds = (task.assignees || []).map((a) => a._id || a)

  const toggleAssignee = async (memberId) => {
    const next = assigneeIds.includes(memberId)
      ? assigneeIds.filter((id) => id !== memberId)
      : [...assigneeIds, memberId]
    try {
      const updated = await request(`/tasks/${task._id}`, {
        method: 'PATCH',
        token,
        body: { assignees: next },
      })
      onUpdated(updated)
    } catch (err) {
      setError(err.message)
    }
  }
  useEffect(() => {
    request(`/tasks/${task._id}/comments`, { token })
      .then(setComments)
      .catch((err) => setError(err.message))
  }, [task._id])

  const toggleSubtask = async (index) => {
    const next = subtasks.map((s, i) => (i === index ? { ...s, done: !s.done } : s))
    try {
      const updated = await request(`/tasks/${task._id}`, {
        method: 'PATCH',
        token,
        body: { subtasks: next },
      })
      onUpdated(updated)
    } catch (err) {
      setError(err.message)
    }
  }

  const addComment = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    try {
      const c = await request(`/tasks/${task._id}/comments`, {
        method: 'POST',
        token,
        body: { text },
      })
      setComments((prev) => [...prev, c])
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const removeComment = async (id) => {
    try {
      await request(`/tasks/${task._id}/comments/${id}`, { method: 'DELETE', token })
      setComments((prev) => prev.filter((c) => c._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d10]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-white/8 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${priorityStyle[task.priority]}`}>
                {task.priority}
              </span>
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">{task.category}</span>
              <span className="rounded-md bg-accent/20 px-2 py-0.5 text-[11px] text-accent-text">
                {STATUS_LABEL[task.status]}
              </span>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
              <X size={18} />
            </button>
          </div>
          <h3 className="mt-3 font-serif text-2xl font-semibold text-zinc-100">{task.title}</h3>
          {task.description && <p className="mt-2 text-sm text-zinc-400">{task.description}</p>}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {error && (
            <p className="rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>
          )}
          <section>
            <h4 className="font-serif text-lg font-semibold text-zinc-200">Assignees</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {members.map((m) => {
                const on = assigneeIds.includes(m._id)
                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => toggleAssignee(m._id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      on
                        ? 'border-accent bg-accent/25 text-accent-text'
                        : 'border-white/10 text-zinc-400 hover:bg-white/5'
                    }`}
                  >
                    {m.name}
                  </button>
                )
              })}
            </div>
          </section>

          {subtasks.length > 0 && (
            <section>
              <div className="mb-2 flex justify-between text-xs text-zinc-500">
                <span>Subtasks {done}/{subtasks.length}</span>
                <span>{percent}%</span>
              </div>
              <div className="mb-3 h-1.5 rounded-full bg-white/10">
                <div className="h-1.5 rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
              </div>
              <ul className="space-y-1.5">
                {subtasks.map((s, i) => (
                  <li
                    key={s._id || i}
                    onClick={() => toggleSubtask(i)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5"
                  >
                    <span
                      className={`grid h-4 w-4 place-items-center rounded border ${
                        s.done ? 'border-accent bg-accent text-black' : 'border-white/20'
                      }`}
                    >
                      {s.done && <Check size={12} />}
                    </span>
                    <span className={s.done ? 'text-zinc-500 line-through' : 'text-zinc-200'}>{s.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h4 className="font-serif text-lg font-semibold text-zinc-200">
              Discussion <span className="text-sm text-zinc-500">{comments.length}</span>
            </h4>
            <ul className="mt-3 space-y-3">
              {comments.map((c) => (
                <li key={c._id} className="group rounded-xl bg-white/4 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-200">{c.author?.name}</span>
                    <span className="flex items-center gap-2 text-zinc-500">
                      {timeAgo(c.createdAt)}
                      {c.author?._id === myId && (
                        <button
                          onClick={() => removeComment(c._id)}
                          title="Delete"
                          className="opacity-0 transition hover:text-red-300 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-zinc-300">{c.text}</p>
                </li>
              ))}
              {comments.length === 0 && (
                <li className="py-4 text-center text-xs text-zinc-600">No comments yet. Start the discussion.</li>
              )}
            </ul>
          </section>
        </div>

        {/* Comment box */}
        <form onSubmit={addComment} className="flex gap-2 border-t border-white/8 p-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={1000}
            className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-accent-text/60"
          />
          <button
            disabled={busy || !text.trim()}
            className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-black transition hover:opacity-90 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}