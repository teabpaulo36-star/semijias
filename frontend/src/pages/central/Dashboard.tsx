import { useEffect, useState } from "react"
import { ClipboardList, AlertTriangle, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getDashboard } from "@/api/dashboard"

interface DashboardData {
  pedidos_pendentes: number
  itens_estoque_critico: number
  total_produtos_ativos: number
  ultimos_pedidos: { id: number; unidade_id: number; status: string; criado_em: string }[]
}

const statusVariant: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  PENDENTE: "warning",
  APROVADO: "success",
  REJEITADO: "destructive",
  ENTREGUE: "secondary",
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    getDashboard().then(setData)
  }, [])

  if (!data) return <div className="p-8 text-center text-gray-400">Carregando...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Pedidos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{data.pedidos_pendentes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Estoque Crítico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{data.itens_estoque_critico}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Package className="h-4 w-4" /> Produtos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{data.total_produtos_ativos}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Pedido</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Unidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.ultimos_pedidos.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">#{p.id}</td>
                  <td className="px-4 py-3 text-gray-500">Unidade {p.unidade_id}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[p.status] || "secondary"}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
              {data.ultimos_pedidos.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhum pedido ainda</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
