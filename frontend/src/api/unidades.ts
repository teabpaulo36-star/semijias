import api from "./client"

export interface Unidade {
  id: number
  nome: string
  responsavel: string | null
  email: string | null
  telefone: string | null
  cidade: string | null
  ativo: boolean
}

export const getUnidades = () => api.get<Unidade[]>("/unidades/").then(r => r.data)

export const criarUnidade = (dados: {
  nome: string
  responsavel?: string
  email?: string
  telefone?: string
  cidade?: string
}) => api.post<Unidade>("/unidades/", dados).then(r => r.data)

export const atualizarUnidade = (id: number, dados: Partial<Unidade>) =>
  api.put<Unidade>(`/unidades/${id}`, dados).then(r => r.data)

export const criarUsuarioUnidade = (unidade_id: number, dados: { email: string; senha: string; nome: string }) =>
  api.post(`/unidades/${unidade_id}/usuarios`, dados).then(r => r.data)
