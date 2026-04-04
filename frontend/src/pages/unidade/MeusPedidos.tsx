import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { getPedidos, type Pedido, type StatusPedido } from "@/api/pedidos"

const statusVariant: Record<StatusPedido, "warning" | "success" | "destructive" | "secondary"> = {
  PENDENTE: "warning",
  APROVADO: "success",
  REJEITADO: "destructive",
  ENTREGUE: "secondary",
}

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [expandido, setExpandido] = useState<number | null>(null)

  useEffect(() => {
    getPedidos().then(setPedidos)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h1>

      <div className="space-y-3">
        {pedidos.map(p => (
          <div key={p.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
              onClick={() => setExpandido(expandido === p.id ? null : p.id)}
            >
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-900">Pedido #{p.id}</span>
                <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                <span className="text-sm text-gray-500">{p.itens.length} item(s)</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                </span>
                <span className="text-gray-400">{expandido === p.id ? "▲" : "▼"}</span>
              </div>
            </button>

            {expandido === p.id && (
              <div className="border-t border-gray-100">
                {p.observacoes && (
                  <p className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                    Obs: {p.observacoes}
                  </p>
                )}
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Produto</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Solicitado</th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">Aprovado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.itens.map(item => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="px-4 py-2 text-gray-900">{item.produto.nome}</td>
                        <td className="px-4 py-2 text-gray-500">{item.quantidade_solicitada}</td>
                        <td className="px-4 py-2">
                          {item.quantidade_aprovada != null ? (
                            <span className={item.quantidade_aprovada > 0 ? "text-green-600 font-medium" : "text-red-500"}>
                              {item.quantidade_aprovada}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
        {pedidos.length === 0 && (
          <div className="py-12 text-center text-gray-400">Nenhum pedido realizado ainda</div>
        )}
      </div>
    </div>
  )
}
