import { create } from "zustand"

export interface CartItem {
  produto_id: number
  nome: string
  preco_venda: string
  quantidade: number
}

interface CartState {
  itens: CartItem[]
  adicionar: (item: Omit<CartItem, "quantidade">) => void
  remover: (produto_id: number) => void
  atualizar: (produto_id: number, quantidade: number) => void
  limpar: () => void
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  itens: [],
  adicionar: (item) => {
    const existente = get().itens.find(i => i.produto_id === item.produto_id)
    if (existente) {
      set(s => ({
        itens: s.itens.map(i =>
          i.produto_id === item.produto_id ? { ...i, quantidade: i.quantidade + 1 } : i
        ),
      }))
    } else {
      set(s => ({ itens: [...s.itens, { ...item, quantidade: 1 }] }))
    }
  },
  remover: (produto_id) =>
    set(s => ({ itens: s.itens.filter(i => i.produto_id !== produto_id) })),
  atualizar: (produto_id, quantidade) =>
    set(s => ({
      itens: s.itens.map(i => i.produto_id === produto_id ? { ...i, quantidade } : i),
    })),
  limpar: () => set({ itens: [] }),
  total: () => get().itens.reduce((acc, i) => acc + parseFloat(i.preco_venda) * i.quantidade, 0),
}))
