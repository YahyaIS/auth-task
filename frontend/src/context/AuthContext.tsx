import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import axios from 'axios'
import api, { setAccessToken } from '../api/axios'

const API_URL = import.meta.env.VITE_API_URL

interface User {
  _id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const initialize = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      setState((prev) => ({ ...prev, isLoading: false }))
      return
    }

    try {
      const refreshResponse = await axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken },
      )

      const { access_token, refresh_token } = refreshResponse.data
      setAccessToken(access_token)
      localStorage.setItem('refreshToken', refresh_token)

      const meResponse = await api.get<User>('/auth/me')

      setState({
        user: meResponse.data,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch {
      setAccessToken(null)
      localStorage.removeItem('refreshToken')
      window.location.href = '/signin'
    }
  }, [])

  useEffect(() => {
    initialize()
  }, [initialize])

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<{
      user: User
      access_token: string
      refresh_token: string
    }>('/auth/signin', { email, password })

    const { user, access_token, refresh_token } = response.data
    setAccessToken(access_token)
    localStorage.setItem('refreshToken', refresh_token)

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await api.post<{
        user: User
        access_token: string
        refresh_token: string
      }>('/auth/signup', { name, email, password })

      const { user, access_token, refresh_token } = response.data
      setAccessToken(access_token)
      localStorage.setItem('refreshToken', refresh_token)

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    },
    [],
  )

  const logout = useCallback(() => {
    setAccessToken(null)
    localStorage.removeItem('refreshToken')

    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })

    window.location.href = '/signin'
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...state, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
