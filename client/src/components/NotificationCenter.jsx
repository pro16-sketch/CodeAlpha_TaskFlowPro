
import { useCallback, useEffect, useState } from 'react'
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react'

const API = 'http://localhost:5000/api'

const icons = {
  project_invite: '📁',
  task_assigned: '✅',
  discussion: '💬',
  mention: '📢',
  task_update: '🔄',
}

export default function NotificationCenter({ token }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const unreadCount = notifications.filter((item) => !item.read).length

  const loadNotifications = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)

      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Could not load notifications')

      setNotifications(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadNotifications(true)
    const interval = setInterval(() => loadNotifications(), 10000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  const markRead = async (id) => {
    try {
      const res = await fetch(`${API}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not update notification')

      setNotifications((prev) =>
        prev.map((item) => item._id === id ? data : item)
      )
    } catch (err) {
      setError(err.message)
    }
  }

  const markAllRead = async () => {
    setBusy(true)
    try {
      const res = await fetch(`${API}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not update notifications')

      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`${API}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not delete notification')

      setNotifications((prev) => prev.filter((item) => item._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto mt-5 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-zinc-100">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => loadNotifications(true)}
            title="Refresh"
            className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/5"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={markAllRead}
            disabled={!unreadCount || busy}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-40"
          >
            <CheckCheck size={15} /> Mark all read
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        {loading ? (
          <p className="p-8 text-center text-sm text-zinc-500">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={30} className="mx-auto text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-300">You're all caught up</p>
            <p className="mt-1 text-xs text-zinc-500">New updates will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {notifications.map((item) => (
              <div
                key={item._id}
                className={`flex items-start gap-3 p-4 ${item.read ? '' : 'bg-accent/[0.04]'}`}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/5 text-lg">
                  {icons[item.type] || '🔔'}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-200">{item.message}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.actor?.name ? `By ${item.actor.name} · ` : ''}
                    {item.project?.name ? `${item.project.name} · ` : ''}
                    {new Date(item.createdAt).toLocaleString('en-IN')}
                  </p>
                  {!item.read && (
                    <button
                      onClick={() => markRead(item._id)}
                      className="mt-2 text-xs text-accent-text hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>

                <button
                  onClick={() => deleteNotification(item._id)}
                  title="Delete notification"
                  className="shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-red-400/10 hover:text-red-300"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
