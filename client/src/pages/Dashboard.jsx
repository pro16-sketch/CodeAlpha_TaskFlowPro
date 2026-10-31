import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { request } from '../api'
import { Sidebar } from './Board'

export default function Dashboard() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ projects: [], tasks: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    request('/tasks/overview', { token })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const myId = user?.id || user?._id
  const { projects, tasks } = data
  const now = new Date()

  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter(
    (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now
  ).length
  const mine = tasks.filter((t) => t.assignees.includes(myId) && t.status !== 'done').length
  const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  const rows = projects.map((p) => {
    const list = tasks.filter((t) => t.project === p._id)
    const d = list.filter((t) => t.status === 'done').length
    return { ...p, total: list.length, done: d, percent: list.length ? Math.round((d / list.length) * 100) : 0 }
  })

  const cards = [
    { label: 'Projects', value: projects.length },
    { label: 'Assigned to me', value: mine },
    { label: 'Completed', value: done },
    { label: 'Overdue', value: overdue, warn: overdue > 0 },
  ]

  return (
    <div className="flex min-h-screen text-zinc-200">
      <Sidebar
        user={user}
        logout={logout}
        projects={projects}
        activeId={null}
        onSelect={(id) => navigate(`/?project=${id}`)}
        onNewProject={() => navigate('/?new=1')}
        page="dashboard"
      />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-400/10 px-4 py-2.5 text-sm text-red-300">{error}</div>
        )}

        <p className="text-xs text-zinc-500">Overview</p>
        <h2 className="mt-1 font-serif text-4xl font-semibold italic tracking-tight text-zinc-100">
          Welcome back, {user?.name?.split(' ')[0]}
        </h2>

        {loading ? (
          <p className="mt-6 text-zinc-500">Loading...</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {cards.map((c) => (
                <div key={c.label} className="rounded-2xl border border-white/8 bg-white/3 px-4 py-4 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500">{c.label}</p>
                  <p className={`mt-1 font-serif text-4xl font-semibold ${c.warn ? 'text-red-300' : 'text-zinc-100'}`}>
                    {c.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/8 bg-white/3 p-5 backdrop-blur-md">
              <div className="mb-2 flex justify-between text-sm text-zinc-400">
                <span>Overall progress</span>
                <span>{percent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10">
                <div className="h-2.5 rounded-full bg-accent transition-all" style={{ width: `${percent}%` }} />
              </div>
            </div>

            <h3 className="mt-8 font-serif text-2xl font-semibold text-zinc-200">Your projects</h3>
            <ul className="mt-3 space-y-3">
              {rows.map((p) => (
                <li
                  key={p._id}
                  onClick={() => navigate(`/?project=${p._id}`)}
                  className="cursor-pointer rounded-2xl border border-white/8 bg-white/3 p-4 transition hover:border-accent/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-zinc-100">
                      <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
                      {p.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {p.done}/{p.total} tasks · {p.percent}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-white/10">
                    <div className="h-1.5 rounded-full bg-accent" style={{ width: `${p.percent}%` }} />
                  </div>
                </li>
              ))}
              {rows.length === 0 && (
                <li className="py-6 text-center text-sm text-zinc-600">No projects yet. Create one from the sidebar.</li>
              )}
            </ul>
          </>
        )}
      </main>
    </div>
  )
}