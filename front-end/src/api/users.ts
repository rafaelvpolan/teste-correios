import { client } from './client'
import type { User, CreateUserDTO, UpdateUserDTO, CepLookupResponse } from '../types/user'

export const usersApi = {
  lookupCep: (cep: string)             => client.get<CepLookupResponse>(`/cep/${cep}`),
  getAll:  ()                          => client.get<User[]>('/users'),
  getById: (id: number)                => client.get<User>(`/users/${id}`),
  create:  (data: CreateUserDTO)       => client.post<User>('/users', data),
  update:  (id: number, data: UpdateUserDTO) => client.put<User>(`/users/${id}`, data),
  remove:  (id: number)                => client.delete<void>(`/users/${id}`),
}