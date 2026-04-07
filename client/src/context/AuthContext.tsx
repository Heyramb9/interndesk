import { createContext, useContext, useState, ReactNode } from 'react'
import API_BASE_URL from '../apiConfig'
import { User, Role } from '../types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: Role; message?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; role?: Role; message?: string }>
  logout: () => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
  company?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('interndesk_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.user)
        localStorage.setItem('interndesk_user', JSON.stringify(data.user))
        localStorage.setItem('interndesk_token', data.token)
        return { success: true, role: data.user.role }
      }
      return { success: false, message: data.message }
    } catch (err) {
      return { success: false, message: 'Network error. Is the server running?' }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (json.success) {
        setUser(json.user)
        localStorage.setItem('interndesk_user', JSON.stringify(json.user))
        localStorage.setItem('interndesk_token', json.token)
        return { success: true, role: json.user.role }
      }
      return { success: false, message: json.message }
    } catch (err) {
      return { success: false, message: 'Network error. Is the server running?' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('interndesk_user')
    localStorage.removeItem('interndesk_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
