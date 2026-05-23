export interface User {
  id: number
  name: string
  email: string
  created_at?: string
}

export interface CreateUserDTO {
  name: string
  email: string
  password: string
}

export interface UpdateUserDTO {
  name?: string
  email?: string
}export interface LoginDTO {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}