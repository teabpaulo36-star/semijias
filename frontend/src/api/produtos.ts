import api from "./client"
import type { Categoria } from "./categorias"

export interface Estoque {
  quantidade: number
  quantidade_minima: number
}

export interface Produto {
  id: number
  nome: string
  descricao: string | null
  preco_custo: string
  preco_venda: string
  foto_url: string | null
  ativo: boolean
  categoria: Categoria | null
  estoque: Estoque | null
}

export const getProdutos = (params?: { categoria_id?: number; somente_ativos?: boolean }) =>
  api.get<Produto[]>("/produtos/", { params }).then(r => r.data)

export const criarProduto = (dados: {
  nome: string
  descricao?: string
  preco_custo: number
  preco_venda: number
  categoria_id?: number
  foto_url?: string
}) => api.post<Produto>("/produtos/", dados).then(r => r.data)

export const atualizarProduto = (id: number, dados: Partial<{
  nome: string
  descricao: string
  preco_custo: number
  preco_venda: number
  categoria_id: number
  foto_url: string
  ativo: boolean
}>) => api.put<Produto>(`/produtos/${id}`, dados).then(r => r.data)

export const desativarProduto = (id: number) => api.delete(`/produtos/${id}`)
