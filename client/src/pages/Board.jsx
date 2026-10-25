import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { request } from '../api'
import TaskModal from '../components/TaskModal'
import {
  LayoutDashboard, FolderKanban, CheckSquare, Bell, Settings,
  Search, Plus, MoreHorizontal, ArrowUpDown, SlidersHorizontal,
  Calendar, ChevronLeft, ChevronRight, Trash2, X,
} from 'lucide-react'

const COLUMNS = [
  { key: 'todo', title: 'To Do' },
  { key: 'inprogress', title: 'In Progress' },
  { key: 'done', title: 'Done' },
]

const PROJECT_COLORS = [
  'bg-sky-300', 'bg-slate-300', 'bg-cyan-300',
  'bg-blue-300', 'bg-zinc-300', 'bg-emerald-300',
]

const priorityStyle = {
  High: 'bg-red-400/15 text-red-300',
  Medium: 'bg-amber-300/15 text-amber-200',
  Low: 'bg-white/8 text-zinc-300',
}

const tones = ['bg-sky-800', 'bg-slate-600', 'bg-cyan-900', 'bg-blue-900', 'bg-zinc-600']

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-accent-text/60'

const initials = (name = '') =>
  name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

function Avatar({ name, index = 0, ring = 'ring-card' }) {
  return (
    <span
      title={name}
      className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ${ring} ${tones[index % tones.length]}`}
    >
      {initials(name)}
    </span>
  )
}

function AvatarStack({ names, ring }) {
  return (
    <div className="flex -space-x-2">
      {names.map((n, i) => (
        <Avatar key={i} name={n} index={i} ring={ring} />
      ))}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0d10] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-semibold text-zinc-100">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    await onCreate(name.trim())
    onClose()
  }

  return (
    <Modal title="New project" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className={inputClass}
          required
        />
        <button className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Create project
        </button>
      </form>
    </Modal>
  )
}

function NewTaskModal({ defaultStatus, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', description: '', priority: 'Medium',
    category: '', dueDate: '', subtasks: '',
  })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    await onCreate({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      category: form.category.trim() || undefined,
      dueDate: form.dueDate || undefined,
      status: defaultStatus,
      subtasks: form.subtasks
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((title) => ({ title })),
    })
    onClose()
  }

  return (
    <Modal title="New task" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input name="title" value={form.title} onChange={onChange} placeholder="Task title" className={inputClass} required autoFocus />
        <textarea name="description" value={form.description} onChange={onChange} placeholder="Description (optional)" rows={2} className={inputClass} />
        <div className="grid grid-cols-2 gap-3">
          <select name="priority" value={form.priority} onChange={onChange} className={inputClass}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <input name="category" value={form.category} onChange={onChange} placeholder="Category (e.g. Design)" className={inputClass} />
        </div>
        <input name="dueDate" type="date" value={form.dueDate} onChange={onChange} className={inputClass} />
        <textarea name="subtasks" value={form.subtasks} onChange={onChange} placeholder={'Subtasks (one per line)'} rows={3} className={inputClass} />
        <button className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black hover:opacity-90">
          Create task
        </button>
      </form>
    </Modal>
  )
}

function TaskCard({ task, colIndex, onMove, onDelete, onOpen }) {
  const subtasks = task.subtasks || []
  const done = subtasks.filter((s) => s.done).length
  const percent = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0
  const assignees = (task.assignees || []).map((a) => a.name)

  return (
    <div
  onClick={onOpen}
  className="group cursor-pointer rounded-xl border border-white/10 bg-white/6 p-4 transition hover:border-accent/50"
>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${priorityStyle[task.priority]}`}>
            {task.priority}
          </span>
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
            {task.category}
          </span>
        </div>
        <div
  onClick={(e) => e.stopPropagation()}
  className="flex gap-1 text-zinc-500 opacity-0 transition group-hover:opacity-100"
>
          {colIndex > 0 && (
            <button title="Move left" onClick={() => onMove(COLUMNS[colIndex - 1].key)} className="hover:text-zinc-100">
              <ChevronLeft size={15} />
            </button>
          )}
          {colIndex < COLUMNS.length - 1 && (
            <button title="Move right" onClick={() => onMove(COLUMNS[colIndex + 1].key)} className="hover:text-zinc-100">
              <ChevronRight size={15} />
            </button>
          )}
          <button title="Delete" onClick={onDelete} className="hover:text-red-300">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="mt-3 font-serif text-base font-semibold text-zinc-100">{task.title}</h3>
      {task.description && (
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{task.description}</p>
      )}

      {subtasks.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[11px] text-zinc-500">
            <span>Subtasks {done}/{subtasks.length}</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10">
            <div className="h-1.5 rounded-full bg-accent" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <AvatarStack names={assignees} ring="ring-card" />
        {task.dueDate && (
          <span className="flex items-center gap-1 text-[11px] text-zinc-500">
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
        )}
      </div>
    </div>
  )
}

function Sidebar({ user, logout, projects, activeId, onSelect, onNewProject }) {
  const nav = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: FolderKanban, label: 'Projects', active: true },
    { icon: CheckSquare, label: 'My Tasks' },
    { icon: Bell, label: 'Notifications' },
    { icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-white/3 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-black">T</span>
        <span className="font-serif text-xl font-semibold tracking-tight text-zinc-100">TaskFlow Pro</span>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-white/8 bg-black/30 px-3 py-2 text-sm text-zinc-500">
        <Search size={15} /> Search...
      </div>

      <nav className="mt-5 space-y-1">
        {nav.map(({ icon: Icon, label, active }) => (
          <div
            key={label}
            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${
              active ? 'bg-accent/25 text-accent-text' : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <Icon size={17} /> {label}
          </div>
        ))}
      </nav>

      <div className="mt-6 flex items-center justify-between px-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-600">Projects</p>
        <button onClick={onNewProject} title="New project" className="text-zinc-500 hover:text-accent-text">
          <Plus size={15} />
        </button>
      </div>
      <ul className="mt-2 space-y-1 overflow-y-auto">
        {projects.map((p) => (
          <li
            key={p._id}
            onClick={() => onSelect(p._id)}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
              p._id === activeId ? 'bg-white/5 text-zinc-100' : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${p.color}`} />
            <span className="truncate">{p.name}</span>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="px-3 py-1.5 text-xs text-zinc-600">No projects yet</li>
        )}
      </ul>

      <div className="mt-auto flex items-center gap-3 rounded-xl bg-black/30 p-3">
        <Avatar name={user?.name} index={0} ring="ring-base" />
        <div className="min-w-0 flex-1 text-xs">
          <p className="truncate font-medium text-zinc-200">{user?.name}</p>
          <button onClick={logout} className="text-zinc-500 hover:text-accent-text">Log out</button>
        </div>
      </div>
    </aside>
  )
}

function Board() {
  const { user, token, logout } = useAuth()

  const [projects, setProjects] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [taskModal, setTaskModal] = useState(null)
  const [projectModal, setProjectModal] = useState(false)
const [openTask, setOpenTask] = useState(null) 
  
  

  const tabs = ['Overview', 'Board', 'Discussions', 'Team', 'Files']
  const activeProject = projects.find((p) => p._id === activeId)

  const fetchProjects = async (selectId) => {
    try {
      const list = await request('/projects', { token })
      setProjects(list)
      setActiveId((current) => selectId || current || list[0]?._id || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async (projectId) => {
    try {
      setTasks(await request(`/projects/${projectId}/tasks`, { token }))
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (activeId) fetchTasks(activeId)
    else setTasks([])
  }, [activeId])

  const createProject = async (name) => {
    try {
      const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length]
      const project = await request('/projects', { method: 'POST', token, body: { name, color } })
      await fetchProjects(project._id)
    } catch (err) {
      setError(err.message)
    }
  }

  const createTask = async (payload) => {
    try {
      await request(`/projects/${activeId}/tasks`, { method: 'POST', token, body: payload })
      await fetchTasks(activeId)
    } catch (err) {
      setError(err.message)
    }
  }

  const moveTask = async (task, status) => {
    setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status } : t)))
    try {
      await request(`/tasks/${task._id}`, { method: 'PATCH', token, body: { status } })
    } catch (err) {
      setError(err.message)
      fetchTasks(activeId)
    }
  }

  const deleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    try {
      await request(`/tasks/${task._id}`, { method: 'DELETE', token })
      setTasks((prev) => prev.filter((t) => t._id !== task._id))
    } catch (err) {
      setError(err.message)
    }
  }
  const updateTask = (updated) => {
  setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
  setOpenTask(updated)
}

  const invite = async () => {
    const email = window.prompt('Email of the user to add (they must have signed up):')
    if (!email) return
    try {
      await request(`/projects/${activeId}/members`, { method: 'POST', token, body: { email } })
      await fetchProjects(activeId)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen text-zinc-200">
      <Sidebar
        user={user}
        logout={logout}
        projects={projects}
        activeId={activeId}
        onSelect={setActiveId}
        onNewProject={() => setProjectModal(true)}
      />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-red-400/10 px-4 py-2.5 text-sm text-red-300">
            {error}
            <button onClick={() => setError('')}><X size={15} /></button>
          </div>
        )}

        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : !activeProject ? (
          <div className="grid h-[70vh] place-items-center text-center">
            <div>
              <h2 className="font-serif text-4xl font-semibold italic text-zinc-100">Start your first project</h2>
              <p className="mt-2 text-sm text-zinc-500">Create a project to start adding tasks to your board.</p>
              <button
                onClick={() => setProjectModal(true)}
                className="mt-6 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-black hover:opacity-90"
              >
                + New project
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500">Projects / {activeProject.name}</p>
                <h2 className="mt-1 font-serif text-4xl font-semibold italic tracking-tight text-zinc-100">
                  {activeProject.name}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <AvatarStack names={activeProject.members.map((m) => m.name)} ring="ring-base" />
                <button
                  onClick={invite}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
                >
                  + Invite
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-6 border-b border-white/8 text-sm">
              {tabs.map((t) => (
                <span
                  key={t}
                  className={`cursor-pointer pb-3 ${
                    t === 'Board'
                      ? 'border-b-2 border-accent-text text-accent-text'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex rounded-lg border border-white/8 bg-black/30 p-1 text-xs">
                <span className="rounded-md bg-white/10 px-3 py-1.5 text-zinc-100">Kanban</span>
                <span className="px-3 py-1.5 text-zinc-500">List</span>
                <span className="px-3 py-1.5 text-zinc-500">Timeline</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button className="flex items-center gap-2 rounded-lg border border-white/8 px-3 py-2 text-zinc-400 hover:bg-white/5">
                  <ArrowUpDown size={14} /> Sort by
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-white/8 px-3 py-2 text-zinc-400 hover:bg-white/5">
                  <SlidersHorizontal size={14} /> Filter
                </button>
                <button
                  onClick={() => setTaskModal('todo')}
                  className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 font-semibold text-black hover:opacity-90"
                >
                  <Plus size={14} /> New Task
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {COLUMNS.map((col, colIndex) => {
                const colTasks = tasks.filter((t) => t.status === col.key)
                return (
                  <section key={col.key} className="rounded-2xl border border-white/8 bg-white/3 p-3 backdrop-blur-md">
                    <div className="mb-3 flex items-center justify-between px-1">
                      <h3 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-zinc-200">
                        {col.title}
                        <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[11px] text-zinc-400">
                          {colTasks.length}
                        </span>
                      </h3>
                      <div className="flex gap-2 text-zinc-500">
                        <Plus size={16} onClick={() => setTaskModal(col.key)} className="cursor-pointer hover:text-zinc-200" />
                        <MoreHorizontal size={16} className="cursor-pointer hover:text-zinc-200" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {colTasks.map((t) => (
                        <TaskCard
  key={t._id}
  task={t}
  colIndex={colIndex}
  onMove={(status) => moveTask(t, status)}
  onDelete={() => deleteTask(t)}
  onOpen={() => setOpenTask(t)}
/>
                      ))}
                      {colTasks.length === 0 && (
                        <p className="px-1 py-6 text-center text-xs text-zinc-600">No tasks here</p>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          </>
        )}
      </main>

      {projectModal && (
        <NewProjectModal onClose={() => setProjectModal(false)} onCreate={createProject} />
      )}
      {taskModal && (
        <NewTaskModal defaultStatus={taskModal} onClose={() => setTaskModal(null)} onCreate={createTask} />
      )}
      
      {openTask && (
        <TaskModal
          task={openTask}
          onClose={() => setOpenTask(null)}
          onUpdated={updateTask}
        />
      )}
    </div>
  )
}

export default Board