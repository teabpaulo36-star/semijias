import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getPedidos, aprovarPedido, rejeitarPedido, type Pedido, type StatusPedido } from "@/api/pedidos"

const statusVariant: Record<StatusPedido, "warning" | "success" | "destructive" | "secondary"> = {
  PENDENTE: "warning",
  APROVADO: "success",
  REJEITADO: "destructive",
  ENTREGUE: "secondary",
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filtro, setFiltro] = useState<StatusPedido | "">("")
  const [modalPedido, setModalPedido] = useState<Pedido | null>(null)
  const [modalRejeitar, setModalRejeitar] = useState<Pedido | null>(null)
  const [quantidades, setQuantidades] = useState<Record<number, string>>({})
  const [obsRejeicao, setObsRejeicao] = useState("")
  const [loading, setLoading] = useState(false)

  async function carregar() {
    const data = await getPedidos(filtro as StatusPedido || undefined)
    setPedidos(data)
  }

  useEffect(() => { carregar() }, [filtro])

  function abrirAprovar(p: Pedido) {
    setModalPedido(p)
    const qtds: Record<number, string> = {}
    p.itens.forEach(item => { qtds[item.id] = item.quantidade_solicitada.toString() })
    setQuantidades(qtds)
  }

  function abrirRejeitar(p: Pedido) {
    setModalRejeitar(p)
    setObsRejeicao("")
  }

  async function confirmarAprovacao() {
    if (!modalPedido) return
    setLoading(true)
    try {
      const itens = modalPedido.itens.map(item => ({
        item_id: item.id,
        quantidade_aprovada: parseInt(quantidades[item.id] || "0"),
      }))
      await aprovarPedido(modalPedido.id, itens)
      setModalPedido(null)
      carregar()
    } catch (e: any) {
      alert(e.response?.data?.detail || "Erro ao aprovar pedido")
    } finally {
      setLoading(false)
    }
  }

  async function confirmarRejeicao() {
    if (!modalRejeitar) return
    setLoading(true)
    try {
      await rejeitarPedido(modalRejeitar.id, obsRejeicao || undefined)
      setModalRejeitar(null)
      carregar()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <select
          value={filtro}
          onChange={e => setFiltro(e.target.value as StatusPedido | "")}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="PENDENTE">Pendentes</option>
          <option value="APROVADO">Aprovados</option>
          <option value="REJEITADO">Rejeitados</option>
          <option value="ENTREGUE">Entregues</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Pedido</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Unidade</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Itens</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">#{p.id}</td>
                <td className="px-4 py-3 text-gray-500">Unidade {p.unidade_id}</td>
                <td className="px-4 py-3 text-gray-500">{p.itens.length} item(s)</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {p.status === "PENDENTE" && (
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" onClick={() => abrirAprovar(p)}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Aprovar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => abrirRejeitar(p)}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeitar
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhum pedido encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Aprovar */}
      <Dialog open={!!modalPedido} onOpenChange={() => setModalPedido(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aprovar Pedido #{modalPedido?.id}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <p className="text-sm text-gray-500">Defina a quantidade aprovada para cada item:</p>
            {modalPedido?.itens.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.produto.nome}</p>
                  <p className="text-xs text-gray-400">
                    Solicitado: {item.quantidade_solicitada} &nbsp;|&nbsp;
                    Estoque: {item.produto.estoque?.quantidade ?? "—"}
                  </p>
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="0"
                    max={item.quantidade_solicitada}
                    value={quantidades[item.id] ?? ""}
                    onChange={e => setQuantidades(q => ({ ...q, [item.id]: e.target.value }))}
                  />
                </div>
              </div>
            ))}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setModalPedido(null)}>Cancelar</Button>
              <Button onClick={confirmarAprovacao} disabled={loading}>
                {loading ? "Aprovando..." : "Confirmar Aprovação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Rejeitar */}
      <Dialog open={!!modalRejeitar} onOpenChange={() => setModalRejeitar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Pedido #{modalRejeitar?.id}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Motivo (opcional)</label>
              <Input
                value={obsRejeicao}
                onChange={e => setObsRejeicao(e.target.value)}
                placeholder="Ex: Estoque insuficiente"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setModalRejeitar(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirmarRejeicao} disabled={loading}>
                {loading ? "Rejeitando..." : "Confirmar Rejeição"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
