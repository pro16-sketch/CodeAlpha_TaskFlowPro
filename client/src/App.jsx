import {
  LayoutDashboard, FolderKanban, CheckSquare, Bell, Settings,
  Search, Star, Plus, MoreHorizontal, MessageSquare, Paperclip,
  ArrowUpDown, SlidersHorizontal, Calendar,
} from 'lucide-react'
import { projects, columns, team } from './data'

const priorityStyle = {
  High: 'bg-red-400/15 text-red-300',
  Medium: 'bg-amber-300/15 text-amber-200',
  Low: 'bg-white/8 text-zinc-300',
}

const tones = ['bg-sky-800', 'bg-slate-600', 'bg-cyan-900', 'bg-blue-900', 'bg-zinc-600']

function Avatar({ initials, index = 0, ring = 'ring-card' }) {
  return (
    <span
      className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ${ring} ${tones[index % tones.length]}`}
    >
      {initials}
    </span>
  )
}

function AvatarStack({ list, ring }) {
  return (
    <div className="flex -space-x-2">
      {list.map((a, i) => (
        <Avatar key={a} initials={a} index={i} ring={ring} />
      ))}
    </div>
  )
}

function TaskCard({ task }) {
  const percent = Math.round((task.done / task.total) * 100)
  return (
    <div className="rounded-xl border border-white/10 bg-white/6 p-4 transition hover:border-accent/50 hover:bg-white/6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${priorityStyle[task.priority]}`}>
            {task.priority}
          </span>
          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
            {task.category}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500">{task.id}</span>
      </div>

      <h3 className="mt-3 font-serif text-base font-semibold text-zinc-100">{task.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{task.desc}</p>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-[11px] text-zinc-500">
          <span>Subtasks {task.done}/{task.total}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10">
          <div className="h-1.5 rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <AvatarStack list={task.assignees} ring="ring-card" />
        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1"><Calendar size={12} />{task.due}</span>
          <span className="flex items-center gap-1"><Paperclip size={12} />{task.files}</span>
          <span className="flex items-center gap-1"><MessageSquare size={12} />{task.comments}</span>
        </div>
      </div>
    </div>
  )
}

function Sidebar() {
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

      <p className="mt-6 px-3 text-[11px] uppercase tracking-[0.2em] text-zinc-600">Favourites</p>
      <ul className="mt-2 space-y-1">
        {projects.favourites.map((p) => (
          <li key={p.name} className="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5">
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${p.color}`} /> {p.name}
            </span>
            <Star size={13} className="fill-amber-400 text-amber-400" />
          </li>
        ))}
      </ul>

      <p className="mt-6 px-3 text-[11px] uppercase tracking-wider text-zinc-600">All Projects</p>
      <ul className="mt-2 space-y-1">
        {projects.all.map((p, i) => (
          <li
            key={p.name}
            className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
              i === 0 ? 'bg-white/5 text-zinc-100' : 'text-zinc-400 hover:bg-white/5'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${p.color}`} /> {p.name}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-3 rounded-xl bg-black/30 p-3">
        <Avatar initials="RK" index={0} ring="ring-base" />
        <div className="text-xs">
          <p className="font-medium text-zinc-200">Rahul K.</p>
          <p className="text-zinc-500">Project Owner</p>
        </div>
      </div>
    </aside>
  )
}

function App() {
  const tabs = ['Overview', 'Board', 'Discussions', 'Team', 'Files']

  return (
    <div className="flex min-h-screen text-zinc-200">
      <Sidebar />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        {/* Top bar */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-zinc-500">Projects / Website Revamp</p>
            <h2 className="mt-1 flex items-center gap-3 font-serif text-4xl font-semibold italic tracking-tight text-zinc-100">
              Website Revamp
              <Star size={18} className="fill-amber-400 text-amber-400" />
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <AvatarStack list={team} ring="ring-base" />
            <button className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5">
              + Invite
            </button>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Toolbar */}
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
            <button className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 font-semibold text-black hover:opacity-90">
              <Plus size={14} /> New Task
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {columns.map((col) => (
            <section key={col.title} className="rounded-2xl border border-white/8 bg-white/3 p-3 backdrop-blur-md">
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-zinc-200">
                  {col.title}
                  <span className="rounded-md bg-white/8 px-1.5 py-0.5 text-[11px] text-zinc-400">
                    {col.tasks.length}
                  </span>
                </h3>
                <div className="flex gap-2 text-zinc-500">
                  <Plus size={16} className="cursor-pointer hover:text-zinc-200" />
                  <MoreHorizontal size={16} className="cursor-pointer hover:text-zinc-200" />
                </div>
              </div>
              <div className="space-y-3">
                {col.tasks.map((t) => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App