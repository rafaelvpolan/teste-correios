import { useState } from 'react'
import { authApi } from '../api/auth'
import type { LoginDTO, AuthResponse } from '../types/auth'

interface UseAuthReturn {
  user: AuthResponse['user'] | null
  loading: boolean
  error: string | null
  login: (data: LoginDTO) => Promise<void>
  logout: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser]       = useState<AuthResponse['user'] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError]     = useState<string | null>(null)

  const login = async (data: LoginDTO): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const res = await authApi.login(data)
      localStorage.setItem('token', res.token)
      setUser(res.user)
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = (): void => {
    authApi.logout()
    setUser(null)
  }

  return { user, loading, error, login, logout }
}