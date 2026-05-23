import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import './App.css'
import { useUsers } from './hooks/useUsers'
import { usersApi } from './api/users'
import type { CreateUserDTO } from './types/user'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.replace(/(\d{5})(\d{1,3})?/, (_, p1, p2) => (p2 ? `${p1}-${p2}` : p1))
}

function App() {
  const { users, loading, error, create, remove } = useUsers()
  const [form, setForm] = useState<CreateUserDTO>({
    name: '',
    email: '',
    phone: '',
    password: '',
    cep: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      emailRegex.test(form.email) &&
      form.password.length >= 6 &&
      form.cep.replace(/\D/g, '').length === 8 &&
      form.street.trim().length > 0 &&
      form.city.trim().length > 0 &&
      form.state.trim().length > 0
    )
  }, [form])

  const handleChange = (field: keyof CreateUserDTO) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = field === 'phone' ? formatPhone(event.target.value) : field === 'cep' ? formatCep(event.target.value) : event.target.value
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleCepLookup = async () => {
    const digits = form.cep.replace(/\D/g, '')
    if (digits.length !== 8) {
      setFormError('Informe um CEP válido de 8 dígitos.')
      return
    }

    setCepLoading(true)
    setFormError(null)
    try {
      const result = await usersApi.lookupCep(digits)
      setForm((current) => ({
        ...current,
        street: result.street,
        neighborhood: result.neighborhood,
        city: result.city,
        state: result.state,
        complement: result.complement || current.complement,
        cep: result.cep,
      }))
      setSuccessMessage('Endereço preenchido a partir do CEP.')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao consultar CEP.')
    } finally {
      setCepLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setSuccessMessage(null)

    if (!form.name.trim()) {
      setFormError('Nome é obrigatório.')
      return
    }
    if (!emailRegex.test(form.email)) {
      setFormError('Informe um e-mail válido.')
      return
    }
    if (form.password.length < 6) {
      setFormError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (form.cep.replace(/\D/g, '').length !== 8) {
      setFormError('Informe um CEP válido de 8 dígitos.')
      return
    }
    if (!form.street.trim() || !form.city.trim() || !form.state.trim()) {
      setFormError('Preencha o endereço completo após consultar o CEP.')
      return
    }

    try {
      await create(form)
      setSuccessMessage('Usuário criado com sucesso!')
      setForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        cep: '',
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: '',
      })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao criar usuário.')
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Cadastro de usuários</p>
          <h1>Cadastro rápido de clientes</h1>
          <p className="subtitle">
            Use o formulário para registrar um usuário e carregar o endereço automaticamente pelo CEP.
          </p>
        </div>
        <div className="status-panel">
          <span>{loading ? 'Carregando...' : `${users.length} usuários cadastrados`}</span>
          {error ? <strong className="error-tag">{error}</strong> : null}
        </div>
      </header>

      <section className="layout-grid">
        <article className="card form-card">
          <h2>Novo cadastro</h2>
          <form onSubmit={handleSubmit} noValidate>
            <label>
              Nome completo
              <input
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Nome completo"
                required
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="nome@empresa.com"
                required
              />
            </label>
            <label>
              Telefone
              <input
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="(DDD) 99999-9999"
              />
            </label>
            <label>
              CEP
              <div className="cep-row">
                <input
                  value={form.cep}
                  onChange={handleChange('cep')}
                  placeholder="00000-000"
                  required
                />
                <button type="button" onClick={handleCepLookup} disabled={cepLoading || form.cep.replace(/\D/g, '').length !== 8}>
                  {cepLoading ? 'Buscando...' : 'Buscar CEP'}
                </button>
              </div>
            </label>
            <label>
              Logradouro
              <input
                value={form.street}
                onChange={handleChange('street')}
                placeholder="Rua, avenida, praça..."
                required
              />
            </label>
            <label>
              Bairro
              <input
                value={form.neighborhood}
                onChange={handleChange('neighborhood')}
                placeholder="Bairro"
                required
              />
            </label>
            <label>
              Cidade
              <input
                value={form.city}
                onChange={handleChange('city')}
                placeholder="Cidade"
                required
              />
            </label>
            <label>
              UF
              <input
                value={form.state}
                onChange={handleChange('state')}
                placeholder="SP"
                maxLength={2}
                required
              />
            </label>
            <label>
              Complemento
              <input
                value={form.complement}
                onChange={handleChange('complement')}
                placeholder="Apartamento, bloco, complemento"
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </label>
            <div className="form-actions">
              {formError ? <span className="form-error">{formError}</span> : null}
              {successMessage ? <span className="form-success">{successMessage}</span> : null}
              <button type="submit" disabled={!canSubmit}>
                Criar registro
              </button>
            </div>
          </form>
        </article>

        <article className="card list-card">
          <div className="card-header">
            <h2>Lista de cadastros</h2>
            <span>Os registros são carregados da API e atualizados ao criar novos usuários.</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>CEP</th>
                  <th>Cidade</th>
                  <th>UF</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      Nenhum cadastro encontrado. Crie o primeiro usuário no formulário ao lado.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.cep || '—'}</td>
                      <td>{user.city || '—'}</td>
                      <td>{user.state || '—'}</td>
                      <td>
                        <button type="button" className="danger" onClick={() => remove(user.id)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  )
}

export default App
