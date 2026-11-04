
import { useCallback, useEffect, useState } from 'react'
import { Send, Trash2, MessageSquare, RefreshCw } from 'lucide-react'

const API = 'http://localhost:5000/api'

export default function ProjectDiscussions({ projectId, token, myId }) {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const loadMessages = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true)

      const res = await fetch(`${API}/discussions/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not load discussions')

      setMessages(data)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId, token])

  useEffect(() => {
    loadMessages(true)

    const interval = setInterval(() => loadMessages(), 5000)
    return () => clearInterval(interval)
  }, [loadMessages])

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = message.trim()

    if (!text || sending) return

    setSending(true)
    setError('')

    try {
      const res = await fetch(`${API}/discussions/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Message could not be sent')

      setMessages((prev) => [...prev, data])
      setMessage('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return

    try {
      const res = await fetch(
        `${API}/discussions/${projectId}/${messageId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not delete message')

      setMessages((prev) => prev.filter((item) => item._id !== messageId))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-zinc-100">
            Project discussions
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Talk and collaborate with your project team.
          </p>
        </div>

        <button
          onClick={() => loadMessages(true)}
          title="Refresh discussions"
          className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/5"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-5 flex min-h-[350px] max-h-[520px] flex-col overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-4">
        {loading ? (
          <p className="m-auto text-sm text-zinc-500">Loading discussions...</p>
        ) : messages.length === 0 ? (
          <div className="m-auto text-center">
            <MessageSquare size={30} className="mx-auto text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-300">No discussions yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Start the conversation with your team.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((item) => {
              const ownMessage =
                String(item.author?._id) === String(myId)

              return (
                <div key={item._id} className="group flex gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/20 text-xs font-semibold text-accent-text">
                    {(item.author?.name || '?')
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">
                        {item.author?.name || 'Unknown user'}
                      </span>
                      <span className="text-[11px] text-zinc-600">
                        {new Date(item.createdAt).toLocaleString('en-IN')}
                      </span>
                      {ownMessage && (
                        <button
                          onClick={() => deleteMessage(item._id)}
                          title="Delete message"
                          className="ml-auto text-zinc-600 opacity-0 transition hover:text-red-300 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-400">
                      {item.message}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="mt-3 flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
          maxLength={2000}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-accent-text/60"
        />

        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={15} />
          Send
        </button>
      </form>
    </div>
  )
}
