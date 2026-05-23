export interface CepLookupResponse {
  cep: string
  street: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  cep?: string
  street?: string
  neighborhood?: string
  city?: string
  state?: string
  complement?: string
  created_at?: string
}

export interface CreateUserDTO {
  name: string
  email: string
  phone?: string
  password: string
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  complement?: string
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  phone?: string
  cep?: string
  street?: string
  neighborhood?: string
  city?: string
  state?: string
  complement?: string
}
