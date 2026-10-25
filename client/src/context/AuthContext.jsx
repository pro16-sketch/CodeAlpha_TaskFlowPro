import { createContext, useContext, useEffect, useState } from 'react'
import { request } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Page reload par token se user wapas load karo
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    request('/auth/me', { token })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const saveSession = (data) => {
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const login = async (email, password) =>
    saveSession(await request('/auth/login', { method: 'POST', body: { email, password } }))

  const register = async (name, email, password) =>
    saveSession(await request('/auth/register', { method: 'POST', body: { name, email, password } }))

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)