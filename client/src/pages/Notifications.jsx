
import { useAuth } from '../context/AuthContext'
import { Sidebar } from './Board'
import NotificationCenter from '../components/NotificationCenter'

export default function Notifications() {
  const { user, token, logout } = useAuth()

  return (
    <div className="flex min-h-screen text-zinc-200">
      <Sidebar
        user={user}
        logout={logout}
        projects={[]}
        activeId={null}
        onSelect={() => {}}
        onNewProject={() => {}}
        page="notifications"
      />

      <main className="min-w-0 flex-1 p-6 lg:p-8">
        <NotificationCenter token={token} />
      </main>
    </div>
  )
}
