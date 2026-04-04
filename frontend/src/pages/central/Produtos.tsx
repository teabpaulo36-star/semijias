import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getProdutos, criarProduto, atualizarProduto, desativarProduto, type Produto } from "@/api/produtos"
import { getCategorias, type Categoria } from "@/api/categorias"

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nome: "", descricao: "", preco_custo: "", preco_venda: "", categoria_id: "", foto_url: "" })

  async function carregar() {
    const [p, c] = await Promise.all([getProdutos({ somente_ativos: false }), getCategorias()])
    setProdutos(p)
    setCategorias(c)
  }

  useEffect(() => { carregar() }, [])

  function abrirNovo() {
    setEditando(null)
    setForm({ nome: "", descricao: "", preco_custo: "", preco_venda: "", categoria_id: "", foto_url: "" })
    setOpen(true)
  }

  function abrirEditar(p: Produto) {
    setEditando(p)
    setForm({
      nome: p.nome,
      descricao: p.descricao || "",
      preco_custo: p.preco_custo,
      preco_venda: p.preco_venda,
      categoria_id: p.categoria?.id?.toString() || "",
      foto_url: p.foto_url || "",
    })
    setOpen(true)
  }

  async function salvar() {
    setLoading(true)
    try {
      const dados = {
        nome: form.nome,
        descricao: form.descricao || undefined,
        preco_custo: parseFloat(form.preco_custo),
        preco_venda: parseFloat(form.preco_venda),
        categoria_id: form.categoria_id ? parseInt(form.categoria_id) : undefined,
        foto_url: form.foto_url || undefined,
      }
      if (editando) {
        await atualizarProduto(editando.id, dados)
      } else {
        await criarProduto(dados)
      }
      setOpen(false)
      carregar()
    } finally {
      setLoading(false)
    }
  }

  async function desativar(id: number) {
    if (!confirm("Desativar este produto?")) return
    await desativarProduto(id)
    carregar()
  }

  const set = (campo: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [campo]: e.target.value }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <Button onClick={abrirNovo}><Plus className="h-4 w-4 mr-2" /> Novo Produto</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Custo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Venda</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estoque</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.nome}</td>
                <td className="px-4 py-3 text-gray-500">{p.categoria?.nome || "—"}</td>
                <td className="px-4 py-3 text-gray-700">R$ {parseFloat(p.preco_custo).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-700">R$ {parseFloat(p.preco_venda).toFixed(2)}</td>
                <td className="px-4 py-3">
                  {p.estoque ? (
                    <span className={p.estoque.quantidade <= p.estoque.quantidade_minima ? "text-red-600 font-medium" : "text-gray-700"}>
                      {p.estoque.quantidade}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.ativo ? "success" : "secondary"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button size="icon" variant="ghost" onClick={() => abrirEditar(p)}><Pencil className="h-4 w-4" /></Button>
                    {p.ativo && (
                      <Button size="icon" variant="ghost" onClick={() => desativar(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {produtos.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Nenhum produto cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={set("nome")} placeholder="Nome do produto" />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Input value={form.descricao} onChange={set("descricao")} placeholder="Opcional" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Preço de Custo *</Label>
                <Input type="number" step="0.01" value={form.preco_custo} onChange={set("preco_custo")} placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <Label>Preço de Venda *</Label>
                <Input type="number" step="0.01" value={form.preco_venda} onChange={set("preco_venda")} placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <select
                value={form.categoria_id}
                onChange={set("categoria_id")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sem categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>URL da Foto</Label>
              <Input value={form.foto_url} onChange={set("foto_url")} placeholder="https://..." />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={loading || !form.nome || !form.preco_custo || !form.preco_venda}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
