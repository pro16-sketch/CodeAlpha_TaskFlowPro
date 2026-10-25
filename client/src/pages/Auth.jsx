import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth({ mode }) {
  const isSignup = mode === 'signup'
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isSignup) await register(form.name, form.email, form.password)
      else await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const input =
    'w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-accent-text/60'

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/4 p-8 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-black">T</span>
          <span className="font-serif text-xl font-semibold text-zinc-100">TaskFlow Pro</span>
        </div>

        <h1 className="mt-6 font-serif text-3xl font-semibold text-zinc-100">
          {isSignup ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {isSignup ? 'Start managing projects with your team.' : 'Log in to continue to your board.'}
        </p>

        <div className="mt-6 space-y-3">
          {isSignup && (
            <input name="name" placeholder="Full name" value={form.name} onChange={onChange} className={input} required />
          )}
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} className={input} required />
          <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={onChange} className={input} required />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>
        )}

        <button
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}
        </button>

        <p className="mt-5 text-center text-xs text-zinc-500">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isSignup ? '/login' : '/signup'} className="text-accent-text hover:underline">
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </p>
      </form>
    </div>
  )
}