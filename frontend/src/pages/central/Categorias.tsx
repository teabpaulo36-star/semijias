import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCategorias, criarCategoria, atualizarCategoria, deletarCategoria, type Categoria } from "@/api/categorias"

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [loading, setLoading] = useState(false)

  async function carregar() {
    const data = await getCategorias()
    setCategorias(data)
  }

  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setEditando(null)
    setNome("")
    setDescricao("")
    setOpen(true)
  }

  function abrirEditar(cat: Categoria) {
    setEditando(cat)
    setNome(cat.nome)
    setDescricao(cat.descricao || "")
    setOpen(true)
  }

  async function salvar() {
    setLoading(true)
    try {
      if (editando) {
        await atualizarCategoria(editando.id, { nome, descricao })
      } else {
        await criarCategoria({ nome, descricao })
      }
      setOpen(false)
      carregar()
    } finally {
      setLoading(false)
    }
  }

  async function excluir(id: number) {
    if (!confirm("Excluir esta categoria?")) return
    await deletarCategoria(id)
    carregar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <Button onClick={abrirNovo}>
          <Plus className="h-4 w-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Descrição</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{cat.nome}</td>
                <td className="px-4 py-3 text-gray-500">{cat.descricao || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button size="icon" variant="ghost" onClick={() => abrirEditar(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => excluir(cat.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Nenhuma categoria cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Anéis" />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Opcional" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={loading || !nome}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
