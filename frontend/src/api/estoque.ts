import api from "./client"
import type { Produto } from "./produtos"

export interface EstoqueItem {
  produto_id: number
  quantidade: number
  quantidade_minima: number
  produto: Produto
}

export const getEstoque = () => api.get<EstoqueItem[]>("/estoque/").then(r => r.data)
export const atualizarEstoque = (produto_id: number, dados: { quantidade: number; quantidade_minima?: number }) =>
  api.patch<EstoqueItem>(`/estoque/${produto_id}`, dados).then(r => r.data)
