import api from "./client"
import type { Produto } from "./produtos"

export type StatusPedido = "PENDENTE" | "APROVADO" | "REJEITADO" | "ENTREGUE"

export interface ItemPedido {
  id: number
  produto_id: number
  quantidade_solicitada: number
  quantidade_aprovada: number | null
  produto: Produto
}

export interface Pedido {
  id: number
  unidade_id: number
  status: StatusPedido
  observacoes: string | null
  criado_em: string
  itens: ItemPedido[]
}

export const getPedidos = (status?: StatusPedido) =>
  api.get<Pedido[]>("/pedidos/", { params: status ? { status } : {} }).then(r => r.data)

export const aprovarPedido = (id: number, itens: { item_id: number; quantidade_aprovada: number }[]) =>
  api.patch<Pedido>(`/pedidos/${id}/aprovar`, { itens }).then(r => r.data)

export const rejeitarPedido = (id: number, observacoes?: string) =>
  api.patch<Pedido>(`/pedidos/${id}/rejeitar`, { observacoes }).then(r => r.data)
