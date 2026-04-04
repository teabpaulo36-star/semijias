import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import Login from "@/pages/Login"
import Layout from "@/components/Layout"
import Dashboard from "@/pages/central/Dashboard"
import Categorias from "@/pages/central/Categorias"
import Produtos from "@/pages/central/Produtos"
import Estoque from "@/pages/central/Estoque"
import Pedidos from "@/pages/central/Pedidos"
import Unidades from "@/pages/central/Unidades"
import DashboardUnidade from "@/pages/unidade/Dashboard"
import Catalogo from "@/pages/unidade/Catalogo"
import NovoPedido from "@/pages/unidade/NovoPedido"
import MeusPedidos from "@/pages/unidade/MeusPedidos"


function ProtectedRoute({ children, perfil }: { children: React.ReactNode; perfil?: string }) {
  const { token, perfil: userPerfil } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (perfil && userPerfil !== perfil) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { token, perfil } = useAuthStore()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/central"
          element={
            <ProtectedRoute perfil="CENTRAL">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="unidades" element={<Unidades />} />
        </Route>

        <Route
          path="/unidade"
          element={
            <ProtectedRoute perfil="UNIDADE">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardUnidade />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="novo-pedido" element={<NovoPedido />} />
          <Route path="pedidos" element={<MeusPedidos />} />
        </Route>

        <Route
          path="/"
          element={
            token
              ? <Navigate to={perfil === "CENTRAL" ? "/central/dashboard" : "/unidade/dashboard"} replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
