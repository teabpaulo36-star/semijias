import { useEffect, useState } from "react"
import { ShoppingCart, ClipboardList } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDashboard } from "@/api/dashboard"
import { useNavigate } from "react-router-dom"
import type { StatusPedido } from "@/api/pedidos"

interface DashboardData {
  perfil: string
  meus_pedidos_pendentes: number
  ultimos_pedidos: { id: number; status: StatusPedido; criado_em: string }[]
}

const statusVariant: Record<StatusPedido, "warning" | "success" | "destructive" | "secondary"> = {
  PENDENTE: "warning",
  APROVADO: "success",
  REJEITADO: "destructive",
  ENTREGUE: "secondary",
}

export default function DashboardUnidade() {
  const [data, setData] = useState<DashboardData | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard().then(setData)
  }, [])

  if (!data) return <div className="p-8 text-center text-gray-400">Carregando...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Pedidos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{data.meus_pedidos_pendentes}</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center items-center p-6">
          <ShoppingCart className="h-8 w-8 text-blue-400 mb-2" />
          <p className="text-sm text-gray-500 mb-3">Precisa de produtos?</p>
          <Button onClick={() => navigate("/unidade/catalogo")}>Fazer Novo Pedido</Button>
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
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.ultimos_pedidos.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate("/unidade/pedidos")}>
                  <td className="px-4 py-3 font-medium text-gray-900">#{p.id}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
              {data.ultimos_pedidos.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Nenhum pedido ainda</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
