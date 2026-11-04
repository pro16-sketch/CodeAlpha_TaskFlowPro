
import { Users, UserPlus, Trash2, Crown } from 'lucide-react'

export default function ProjectTeam({ project, myId, onInvite, onRemoveMember }) {
  const isOwner = project.owner === myId

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Project Team</p>
          <h2 className="mt-2 font-serif text-3xl text-zinc-100">Members</h2>
          <p className="mt-2 text-sm text-zinc-500">
            {project.members.length} people working on this project
          </p>
        </div>

        {isOwner && (
          <button
            onClick={onInvite}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black"
          >
            <UserPlus size={16} />
            Invite Member
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {project.members.map((member, index) => (
          <div
            key={member._id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/20 font-semibold text-accent-text">
                {member.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              {member._id === project.owner ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
                  <Crown size={13} /> Owner
                </span>
              ) : (
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-400">
                  Member
                </span>
              )}
            </div>

            <h3 className="mt-4 font-medium text-zinc-100">{member.name}</h3>
            <p className="mt-1 truncate text-sm text-zinc-500">{member.email}</p>

            {isOwner && member._id !== project.owner && (
              <button
                onClick={() => {
                  if (window.confirm(`Remove ${member.name} from this project?`)) {
                    onRemoveMember(member._id)
                  }
                }}
                className="mt-5 flex items-center gap-2 text-xs text-red-300 hover:text-red-200"
              >
                <Trash2 size={14} /> Remove member
              </button>
            )}
          </div>
        ))}
      </div>

      {project.members.length === 0 && (
        <div className="py-12 text-center text-zinc-500">
          <Users className="mx-auto mb-3" size={32} />
          No team members found.
        </div>
      )}
    </div>
  )
}
