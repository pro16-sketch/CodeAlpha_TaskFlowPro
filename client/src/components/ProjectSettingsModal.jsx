import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-accent-text/60'

export default function ProjectSettingsModal({ project, myId, onClose, onRename, onRemoveMember, onDelete }) {
  const isOwner = project.owner === myId
  const [name, setName] = useState(project.name)
  const [busy, setBusy] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    if (!name.trim() || name.trim() === project.name) return
    setBusy(true)
    await onRename(name.trim())
    setBusy(false)
  }

  const remove = (m) => {
    if (window.confirm(`Remove ${m.name} from this project?`)) onRemoveMember(m._id)
  }

  const destroy = () => {
    if (window.confirm(`Delete "${project.name}" and all its tasks? This cannot be undone.`)) onDelete()
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0d10] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl font-semibold text-zinc-100">Project settings</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={save} className="mt-5">
          <label className="text-xs uppercase tracking-wider text-zinc-500">Project name</label>
          <div className="mt-2 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner}
              className={`${inputClass} disabled:opacity-50`}
            />
            {isOwner && (
              <button
                disabled={busy}
                className="rounded-lg bg-accent px-4 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
              >
                Save
              </button>
            )}
          </div>
          {!isOwner && <p className="mt-2 text-xs text-zinc-600">Only the project owner can change these settings.</p>}
        </form>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Members ({project.members.length})</p>
          <ul className="mt-2 space-y-2">
            {project.members.map((m) => (
              <li key={m._id} className="flex items-center justify-between rounded-lg bg-white/4 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-100">
                    {m.name}
                    {m._id === project.owner && (
                      <span className="ml-2 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] text-accent-text">Owner</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{m.email}</p>
                </div>
                {isOwner && m._id !== project.owner && (
                  <button onClick={() => remove(m)} title="Remove member" className="text-zinc-500 hover:text-red-300">
                    <Trash2 size={15} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isOwner && (
          <div className="mt-8 rounded-xl border border-red-400/20 p-4">
            <p className="text-sm font-medium text-red-300">Danger zone</p>
            <p className="mt-1 text-xs text-zinc-500">Deleting a project removes all its tasks and comments.</p>
            <button
              onClick={destroy}
              className="mt-3 rounded-lg border border-red-400/40 px-4 py-2 text-sm text-red-300 hover:bg-red-400/10"
            >
              Delete project
            </button>
          </div>
        )}
      </div>
    </div>
  )
}