import { client } from './client'
import type { LoginDTO, AuthResponse } from '../types/auth'

export const authApi = {
  login:    (data: LoginDTO) => client.post<AuthResponse>('/auth/login', data),
  register: (data: LoginDTO) => client.post<AuthResponse>('/auth/register', data),
  logout:   ()               => localStorage.removeItem('token'),
}