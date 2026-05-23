import { useState, useEffect } from 'react'
import { usersApi } from '../api/users'
import type { User, CreateUserDTO, UpdateUserDTO } from '../types/user'

interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  create: (data: CreateUserDTO) => Promise<void>
  update: (id: number, data: UpdateUserDTO) => Promise<void>
  remove: (id: number) => Promise<void>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchUsers = async (): Promise<void> => {
      try {
        const data = await usersApi.getAll()
        setUsers(data)
      } catch (err) {
        if (err instanceof Error) setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()

    return () => controller.abort()
  }, [])

  const create = async (data: CreateUserDTO): Promise<void> => {
    try {
      const novo = await usersApi.create(data)
      setUsers(prev => [...prev, novo])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar usuário.'
      setError(message)
      throw new Error(message)
    }
  }

  const update = async (id: number, data: UpdateUserDTO): Promise<void> => {
    try {
      const atualizado = await usersApi.update(id, data)
      setUsers(prev => prev.map(u => u.id === id ? atualizado : u))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar usuário.'
      setError(message)
      throw new Error(message)
    }
  }

  const remove = async (id: number): Promise<void> => {
    try {
      await usersApi.remove(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover usuário.'
      setError(message)
      throw new Error(message)
    }
  }

  return { users, loading, error, create, update, remove }
}