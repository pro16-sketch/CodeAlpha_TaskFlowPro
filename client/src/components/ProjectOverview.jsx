
function ProjectOverview({ project, tasks = [] }) {
  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'done').length
  const inProgress = tasks.filter(t => t.status === 'inprogress').length
  const pending = tasks.filter(t => t.status === 'todo').length

  const overdue = tasks.filter(t =>
    t.dueDate &&
    t.status !== 'done' &&
    new Date(t.dueDate) < new Date()
  ).length

  const progress = total
    ? Math.round((completed / total) * 100)
    : 0

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const upcomingTasks = [...tasks]
    .filter(t =>
      t.dueDate &&
      t.status !== 'done' &&
      new Date(t.dueDate) >= new Date()
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  const stats = [
    { label: 'Total Tasks', value: total },
    { label: 'Completed', value: completed },
    { label: 'In Progress', value: inProgress },
    { label: 'Pending', value: pending },
  ]

  return (
    <div className="space-y-6">

      {/* Project Information */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Project Overview
        </p>

        <h2 className="mt-2 font-serif text-3xl font-semibold text-zinc-100">
          {project.name}
        </h2>

        <p className="mt-3 text-sm text-zinc-400">
          {project.description || 'No project description available.'}
        </p>

        <div className="mt-5 flex flex-wrap gap-6 text-sm text-zinc-400">
          <span>Team members: {project.members?.length || 0}</span>
          <span>Tasks: {total}</span>
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-xs text-zinc-500">{stat.label}</p>
            <p className="mt-2 font-serif text-3xl text-zinc-100">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Progress */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-zinc-100">
            Project Progress
          </h3>
          <span className="text-lg font-semibold text-zinc-200">
            {progress}%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex justify-between text-xs text-zinc-500">
          <span>{completed} completed</span>
          <span>{pending} pending</span>
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          Overdue tasks: {overdue}
        </p>
      </section>

      {/* Recent Tasks and Deadlines */}
      <section className="grid gap-5 lg:grid-cols-2">

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-serif text-xl text-zinc-100">
            Recent Tasks
          </h3>

          <div className="mt-4 space-y-3">
            {recentTasks.length ? recentTasks.map(task => (
              <div
                key={task._id}
                className="flex items-center justify-between gap-3 border-b border-white/5 pb-3"
              >
                <span className="truncate text-sm text-zinc-300">
                  {task.title}
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {task.status}
                </span>
              </div>
            )) : (
              <p className="text-sm text-zinc-500">No tasks yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="font-serif text-xl text-zinc-100">
            Upcoming Deadlines
          </h3>

          <div className="mt-4 space-y-3">
            {upcomingTasks.length ? upcomingTasks.map(task => (
              <div
                key={task._id}
                className="flex items-center justify-between gap-3 border-b border-white/5 pb-3"
              >
                <span className="truncate text-sm text-zinc-300">
                  {task.title}
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {new Date(task.dueDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )) : (
              <p className="text-sm text-zinc-500">
                No upcoming deadlines.
              </p>
            )}
          </div>
        </div>

      </section>
    </div>
  )
}

export default ProjectOverview