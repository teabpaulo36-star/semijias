import { useEffect, useState } from "react"
import { ShoppingCart, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProdutos, type Produto } from "@/api/produtos"
import { getCategorias, type Categoria } from "@/api/categorias"
import { useCartStore } from "@/store/cartStore"
import { useNavigate } from "react-router-dom"

export default function Catalogo() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState<number | "">("")
  const { itens, adicionar } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getProdutos({ somente_ativos: true }), getCategorias()]).then(([p, c]) => {
      setProdutos(p)
      setCategorias(c)
    })
  }, [])

  const produtosFiltrados = filtroCategoria
    ? produtos.filter(p => p.categoria?.id === filtroCategoria)
    : produtos

  const noCarrinho = (id: number) => itens.some(i => i.produto_id === id)
  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catálogo</h1>
        <Button onClick={() => navigate("/unidade/novo-pedido")} className="relative">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Carrinho
          {totalItens > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItens}
            </span>
          )}
        </Button>
      </div>

      {/* Filtro por categoria */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFiltroCategoria("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filtroCategoria === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Todos
        </button>
        {categorias.map(c => (
          <button
            key={c.id}
            onClick={() => setFiltroCategoria(c.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtroCategoria === c.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c.nome}
          </button>
        ))}
      </div>

      {/* Grade de produtos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {produtosFiltrados.map(p => (
          <div key={p.id} className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-2">
            {p.foto_url && p.foto_url !== "string" ? (
              <img src={p.foto_url} alt={p.nome} className="w-full h-32 object-cover rounded-md" />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-300 text-4xl">◇</div>
            )}
            <div>
              <p className="font-medium text-gray-900 text-sm">{p.nome}</p>
              {p.categoria && <p className="text-xs text-gray-400">{p.categoria.nome}</p>}
            </div>
            <p className="text-blue-600 font-semibold text-sm">
              R$ {parseFloat(p.preco_venda).toFixed(2)}
            </p>
            {p.estoque && (
              <p className="text-xs text-gray-400">Estoque: {p.estoque.quantidade}</p>
            )}
            <Button
              size="sm"
              variant={noCarrinho(p.id) ? "secondary" : "default"}
              className="mt-auto"
              onClick={() => adicionar({ produto_id: p.id, nome: p.nome, preco_venda: p.preco_venda })}
            >
              {noCarrinho(p.id) ? (
                <><Check className="h-3.5 w-3.5 mr-1" /> Adicionado</>
              ) : (
                <><Plus className="h-3.5 w-3.5 mr-1" /> Adicionar</>
              )}
            </Button>
          </div>
        ))}
        {produtosFiltrados.length === 0 && (
          <div className="col-span-4 py-12 text-center text-gray-400">Nenhum produto encontrado</div>
        )}
      </div>
    </div>
  )
}
