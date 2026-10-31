import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { request } from '../api'
import { Sidebar } from './Board'

const priorityStyle = {
  High: 'bg-red-400/15 text-red-300',
  Medium: 'bg-amber-300/15 text-amber-200',
  Low: 'bg-white/8 text-zinc-300',
}

export default function MyTasks() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([request('/tasks/mine', { token }), request('/projects', { token })])
      .then(([t, p]) => {
        setTasks(t)
        setProjects(p)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const changeStatus = async (task, status) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status } : t)))
    try {
      await request(`/tasks/${task._id}`, { method: 'PATCH', token, body: { status } })
    } catch (err) {
      setError(err.message)
    }
  }

  const sorted = [...tasks].sort((a, b) => {
    if ((a.status === 'done') !== (b.status === 'done')) return a.status === 'done' ? 1 : -1
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

  const isOverdue = (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date()

  return (
    <div className="flex min-h-screen text-zinc-200">
      <Sidebar
        user={user}
        logout={logout}
        projects={projects}
        activeId={null}
        onSelect={(id) => navigate(`/?project=${id}`)}
        onNewProject={() => navigate('/?new=1')}
        page="mytasks"
      />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-400/10 px-4 py-2.5 text-sm text-red-300">{error}</div>
        )}

        <p className="text-xs text-zinc-500">Assigned to you</p>
        <h2 className="mt-1 font-serif text-4xl font-semibold italic tracking-tight text-zinc-100">My Tasks</h2>

        {loading ? (
          <p className="mt-6 text-zinc-500">Loading...</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {sorted.map((t) => (
              <li
                key={t._id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${t.project?.color}`} />
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => navigate(`/?project=${t.project?._id}`)}
                >
                  <p
                    className={`truncate text-sm font-medium ${
                      t.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-100'
                    }`}
                  >
                    {t.title}
                  </p>
                  <p className="text-xs text-zinc-500">{t.project?.name}</p>
                </div>

                <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${priorityStyle[t.priority]}`}>
                  {t.priority}
                </span>

                {t.dueDate && (
                  <span className={`text-xs ${isOverdue(t) ? 'text-red-300' : 'text-zinc-500'}`}>
                    {new Date(t.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                )}

                <select
                  value={t.status}
                  onChange={(e) => changeStatus(t, e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-zinc-300 outline-none"
                >
                  <option value="todo" className="bg-black">To Do</option>
                  <option value="inprogress" className="bg-black">In Progress</option>
                  <option value="done" className="bg-black">Done</option>
                </select>
              </li>
            ))}
            {sorted.length === 0 && (
              <li className="py-10 text-center text-sm text-zinc-600">
                Nothing assigned to you yet. Open a task on a board and assign it to yourself.
              </li>
            )}
          </ul>
        )}
      </main>
    </div>
  )
}