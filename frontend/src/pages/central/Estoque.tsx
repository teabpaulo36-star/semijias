import { useEffect, useState } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getEstoque, atualizarEstoque, type EstoqueItem } from "@/api/estoque"

export default function Estoque() {
  const [itens, setItens] = useState<EstoqueItem[]>([])
  const [open, setOpen] = useState(false)
  const [selecionado, setSelecionado] = useState<EstoqueItem | null>(null)
  const [quantidade, setQuantidade] = useState("")
  const [qtdMinima, setQtdMinima] = useState("")
  const [loading, setLoading] = useState(false)

  async function carregar() {
    const data = await getEstoque()
    setItens(data)
  }

  useEffect(() => { carregar() }, [])

  function abrirAjuste(item: EstoqueItem) {
    setSelecionado(item)
    setQuantidade(item.quantidade.toString())
    setQtdMinima(item.quantidade_minima.toString())
    setOpen(true)
  }

  async function salvar() {
    if (!selecionado) return
    setLoading(true)
    try {
      await atualizarEstoque(selecionado.produto_id, {
        quantidade: parseInt(quantidade),
        quantidade_minima: parseInt(qtdMinima),
      })
      setOpen(false)
      carregar()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estoque Central</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Produto</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Quantidade</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Mínimo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => {
              const critico = item.quantidade <= item.quantidade_minima
              return (
                <tr key={item.produto_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.produto.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{item.produto.categoria?.nome || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={critico ? "text-red-600 font-bold" : "text-gray-700"}>
                      {item.quantidade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.quantidade_minima}</td>
                  <td className="px-4 py-3">
                    <Badge variant={critico ? "destructive" : "success"}>
                      {critico ? "Crítico" : "OK"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="icon" variant="ghost" onClick={() => abrirAjuste(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              )
            })}
            {itens.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhum produto no estoque</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Estoque — {selecionado?.produto.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Quantidade</Label>
              <Input type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} min="0" />
            </div>
            <div className="space-y-1">
              <Label>Quantidade Mínima</Label>
              <Input type="number" value={qtdMinima} onChange={e => setQtdMinima(e.target.value)} min="0" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
