import api from "./client"

export interface Categoria {
  id: number
  nome: string
  descricao: string | null
}

export const getCategorias = () => api.get<Categoria[]>("/categorias/").then(r => r.data)
export const criarCategoria = (dados: { nome: string; descricao?: string }) => api.post<Categoria>("/categorias/", dados).then(r => r.data)
export const atualizarCategoria = (id: number, dados: { nome?: string; descricao?: string }) => api.put<Categoria>(`/categorias/${id}`, dados).then(r => r.data)
export const deletarCategoria = (id: number) => api.delete(`/categorias/${id}`)
