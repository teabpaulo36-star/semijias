import { useEffect, useState } from "react"
import { Plus, Pencil, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getUnidades, criarUnidade, atualizarUnidade, criarUsuarioUnidade, type Unidade } from "@/api/unidades"

export default function Unidades() {
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [openUnidade, setOpenUnidade] = useState(false)
  const [openUsuario, setOpenUsuario] = useState(false)
  const [editando, setEditando] = useState<Unidade | null>(null)
  const [unidadeSelecionada, setUnidadeSelecionada] = useState<Unidade | null>(null)
  const [loading, setLoading] = useState(false)

  const [formUnidade, setFormUnidade] = useState({ nome: "", responsavel: "", email: "", telefone: "", cidade: "" })
  const [formUsuario, setFormUsuario] = useState({ nome: "", email: "", senha: "" })
  const [erro, setErro] = useState("")

  async function carregar() {
    const data = await getUnidades()
    setUnidades(data)
  }

  useEffect(() => { carregar() }, [])

  function abrirNova() {
    setEditando(null)
    setFormUnidade({ nome: "", responsavel: "", email: "", telefone: "", cidade: "" })
    setOpenUnidade(true)
  }

  function abrirEditar(u: Unidade) {
    setEditando(u)
    setFormUnidade({
      nome: u.nome,
      responsavel: u.responsavel || "",
      email: u.email || "",
      telefone: u.telefone || "",
      cidade: u.cidade || "",
    })
    setOpenUnidade(true)
  }

  function abrirNovoUsuario(u: Unidade) {
    setUnidadeSelecionada(u)
    setFormUsuario({ nome: "", email: "", senha: "" })
    setErro("")
    setOpenUsuario(true)
  }

  const setU = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormUnidade(f => ({ ...f, [campo]: e.target.value }))

  const setUsu = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormUsuario(f => ({ ...f, [campo]: e.target.value }))

  async function salvarUnidade() {
    setLoading(true)
    try {
      const dados = {
        nome: formUnidade.nome,
        responsavel: formUnidade.responsavel || undefined,
        email: formUnidade.email || undefined,
        telefone: formUnidade.telefone || undefined,
        cidade: formUnidade.cidade || undefined,
      }
      if (editando) {
        await atualizarUnidade(editando.id, dados)
      } else {
        await criarUnidade(dados)
      }
      setOpenUnidade(false)
      carregar()
    } finally {
      setLoading(false)
    }
  }

  async function salvarUsuario() {
    if (!unidadeSelecionada) return
    setLoading(true)
    setErro("")
    try {
      await criarUsuarioUnidade(unidadeSelecionada.id, formUsuario)
      setOpenUsuario(false)
      alert(`Usuário ${formUsuario.email} criado com sucesso!`)
    } catch (e: any) {
      setErro(e.response?.data?.detail || "Erro ao criar usuário")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Unidades</h1>
        <Button onClick={abrirNova}><Plus className="h-4 w-4 mr-2" /> Nova Unidade</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Responsável</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cidade</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {unidades.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.nome}</td>
                <td className="px-4 py-3 text-gray-500">{u.responsavel || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{u.cidade || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{u.email || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={u.ativo ? "success" : "secondary"}>{u.ativo ? "Ativa" : "Inativa"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <Button size="icon" variant="ghost" onClick={() => abrirEditar(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => abrirNovoUsuario(u)} title="Adicionar usuário">
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {unidades.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhuma unidade cadastrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Unidade */}
      <Dialog open={openUnidade} onOpenChange={setOpenUnidade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Unidade" : "Nova Unidade"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input value={formUnidade.nome} onChange={setU("nome")} placeholder="Nome da loja" />
            </div>
            <div className="space-y-1">
              <Label>Responsável</Label>
              <Input value={formUnidade.responsavel} onChange={setU("responsavel")} placeholder="Nome do responsável" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Cidade</Label>
                <Input value={formUnidade.cidade} onChange={setU("cidade")} placeholder="São Paulo" />
              </div>
              <div className="space-y-1">
                <Label>Telefone</Label>
                <Input value={formUnidade.telefone} onChange={setU("telefone")} placeholder="(11) 99999-9999" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={formUnidade.email} onChange={setU("email")} placeholder="loja@email.com" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpenUnidade(false)}>Cancelar</Button>
              <Button onClick={salvarUnidade} disabled={loading || !formUnidade.nome}>
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Usuário */}
      <Dialog open={openUsuario} onOpenChange={setOpenUsuario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário — {unidadeSelecionada?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Nome *</Label>
              <Input value={formUsuario.nome} onChange={setUsu("nome")} placeholder="Nome completo" />
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" value={formUsuario.email} onChange={setUsu("email")} placeholder="usuario@email.com" />
            </div>
            <div className="space-y-1">
              <Label>Senha *</Label>
              <Input type="password" value={formUsuario.senha} onChange={setUsu("senha")} placeholder="Senha de acesso" />
            </div>
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpenUsuario(false)}>Cancelar</Button>
              <Button onClick={salvarUsuario} disabled={loading || !formUsuario.nome || !formUsuario.email || !formUsuario.senha}>
                {loading ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
