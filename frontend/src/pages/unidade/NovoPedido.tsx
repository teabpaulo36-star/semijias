import { useState } from "react"
import { Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCartStore } from "@/store/cartStore"
import { useNavigate } from "react-router-dom"
import api from "@/api/client"

export default function NovoPedido() {
  const { itens, remover, atualizar, limpar, total } = useCartStore()
  const navigate = useNavigate()
  const [observacoes, setObservacoes] = useState("")
  const [loading, setLoading] = useState(false)

  async function confirmar() {
    if (itens.length === 0) return
    setLoading(true)
    try {
      await api.post("/pedidos/", {
        observacoes: observacoes || undefined,
        itens: itens.map(i => ({ produto_id: i.produto_id, quantidade_solicitada: i.quantidade })),
      })
      limpar()
      navigate("/unidade/pedidos")
    } catch (e: any) {
      alert(e.response?.data?.detail || "Erro ao criar pedido")
    } finally {
      setLoading(false)
    }
  }

  if (itens.length === 0) {
    return (
      <div className="p-8 text-center">
        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Carrinho vazio</h2>
        <p className="text-gray-500 mb-4">Adicione produtos no catálogo para fazer um pedido.</p>
        <Button onClick={() => navigate("/unidade/catalogo")}>Ir ao Catálogo</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Pedido</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Produto</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Qtd</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subtotal</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {itens.map(item => (
              <tr key={item.produto_id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{item.nome}</td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={e => atualizar(item.produto_id, Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-8"
                  />
                </td>
                <td className="px-4 py-3 text-gray-700">
                  R$ {(parseFloat(item.preco_venda) * item.quantidade).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => remover(item.produto_id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={2} className="px-4 py-3 font-semibold text-gray-700">Total estimado</td>
              <td colSpan={2} className="px-4 py-3 font-bold text-blue-600">
                R$ {total().toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="space-y-1">
          <Label>Observações</Label>
          <Input
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            placeholder="Ex: Pedido urgente, entregar até sexta..."
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate("/unidade/catalogo")}>
          Continuar comprando
        </Button>
        <Button onClick={confirmar} disabled={loading}>
          {loading ? "Enviando..." : "Confirmar Pedido"}
        </Button>
      </div>
    </div>
  )
}
