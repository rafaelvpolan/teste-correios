import { useState, useEffect } from 'react'

interface UseFetchReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useFetch<T>(fn: () => Promise<T>): UseFetchReturn<T> {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError]     = useState<string | null>(null)

  const fetch = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const result = await fn()
      setData(result)
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  return { data, loading, error, refetch: fetch }
}