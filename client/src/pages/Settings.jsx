
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { request } from '../api'
import { Sidebar } from './Board'
import {
  UserRound,
  LockKeyhole,
  Bell,
  Monitor,
  Save,
  Moon,
  Sun,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
} from 'lucide-react'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-sky-300/60 focus:ring-2 focus:ring-sky-300/10'

const cardClass =
  'rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6'

const sectionTitle =
  'text-base font-semibold tracking-wide text-zinc-100'

export default function Settings() {
  const { user, token, logout, updateUser } = useAuth()

  const [theme, setTheme] = useState(
    () => localStorage.getItem('taskflow-theme') || 'dark'
  )

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const [notifications, setNotifications] = useState(
    () => localStorage.getItem('taskflow-notifications') !== 'false'
  )

  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle(
      'light-mode',
      theme === 'light'
    )
    localStorage.setItem('taskflow-theme', theme)
  }, [theme])

  useEffect(() => {
    setName(user?.name || '')
    setEmail(user?.email || '')
  }, [user])

  const showFeedback = (successMessage = '', errorMessage = '') => {
    setMessage(successMessage)
    setError(errorMessage)
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    showFeedback()
    setProfileSaving(true)

    try {
      const updatedUser = await request('/auth/profile', {
        method: 'PUT',
        token,
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
        },
      })

      updateUser(updatedUser)
      showFeedback('Your profile has been updated successfully.')
    } catch (err) {
      showFeedback('', err.message || 'Unable to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    showFeedback()

    if (newPassword.length < 6) {
      showFeedback('', 'New password must contain at least 6 characters.')
      return
    }

    setPasswordSaving(true)

    try {
      const result = await request('/auth/password', {
        method: 'PUT',
        token,
        body: {
          currentPassword,
          newPassword,
        },
      })

      setCurrentPassword('')
      setNewPassword('')
      showFeedback(result.message || 'Password changed successfully.')
    } catch (err) {
      showFeedback('', err.message || 'Unable to change password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const toggleNotifications = (enabled) => {
    setNotifications(enabled)
    localStorage.setItem('taskflow-notifications', String(enabled))
  }

  return (
    <div className="flex min-h-screen bg-base text-zinc-100">
      <Sidebar
        user={user}
        logout={logout}
        projects={[]}
        activeId={null}
        onSelect={() => {}}
        onNewProject={() => {}}
        page="settings"
      />

      <main className="min-w-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
              Workspace preferences
            </p>

            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight">
              Settings
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Manage your account, security and application preferences.
            </p>
          </div>

          {/* Feedback */}
          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
              <CheckCircle2 size={18} />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Profile */}
          <section className={cardClass}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-sky-300/10 p-3 text-sky-300">
                <UserRound size={21} />
              </div>

              <div>
                <h2 className={sectionTitle}>Profile information</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Update your personal account details.
                </p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Full name
                </label>

                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Email address
                </label>

                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="flex items-center gap-2 rounded-xl bg-sky-200 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={16} />
                {profileSaving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </section>

          {/* Security */}
          <section className={`${cardClass} mt-5`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-amber-300/10 p-3 text-amber-300">
                <LockKeyhole size={21} />
              </div>

              <div>
                <h2 className={sectionTitle}>Security</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Keep your account secure with a strong password.
                </p>
              </div>
            </div>

            <form onSubmit={changePassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Current password
                </label>

                <div className="relative">
                  <input
                    className={`${inputClass} pr-12`}
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                    aria-label="Toggle current password visibility"
                  >
                    {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  New password
                </label>

                <div className="relative">
                  <input
                    className={`${inputClass} pr-12`}
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
                    aria-label="Toggle new password visibility"
                  >
                    {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                <p className="mt-2 text-xs text-zinc-600">
                  Minimum 6 characters.
                </p>
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/5 disabled:opacity-50"
              >
                {passwordSaving ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </section>

          {/* Appearance */}
          <section className={`${cardClass} mt-5`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-violet-300/10 p-3 text-violet-300">
                <Monitor size={21} />
              </div>

              <div>
                <h2 className={sectionTitle}>Appearance</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Choose how TaskFlow Pro looks on your device.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-3 rounded-xl border p-4 transition ${
                  theme === 'dark'
                    ? 'border-sky-300/50 bg-sky-300/10 text-sky-200'
                    : 'border-white/10 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <Moon size={19} />
                <span className="text-sm font-medium">Dark mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-3 rounded-xl border p-4 transition ${
                  theme === 'light'
                    ? 'border-sky-300/50 bg-sky-300/10 text-sky-200'
                    : 'border-white/10 text-zinc-400 hover:bg-white/5'
                }`}
              >
                <Sun size={19} />
                <span className="text-sm font-medium">Light mode</span>
              </button>
            </div>
          </section>

          {/* Notifications */}
          <section className={`${cardClass} mt-5`}>
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-300/10 p-3 text-emerald-300">
                <Bell size={21} />
              </div>

              <div>
                <h2 className={sectionTitle}>Notifications</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Manage your notification display preference.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/10 p-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Show notifications
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Save your preference on this device.
                </p>
              </div>

              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => toggleNotifications(e.target.checked)}
                className="h-5 w-5 accent-sky-300"
              />
            </label>
          </section>

          {/* Account */}
          <section className={`${cardClass} mt-5`}>
            <div className="mb-5">
              <h2 className={sectionTitle}>Account</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Manage your current session.
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 rounded-xl border border-red-400/20 px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-400/10"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </section>

          <p className="py-8 text-center text-xs text-zinc-600">
            TaskFlow Pro · Account Settings
          </p>
        </div>
      </main>
    </div>
  )
}
