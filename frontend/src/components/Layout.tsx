import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import {
  LayoutDashboard, Package, Tag, Warehouse, ClipboardList, Building2, LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuCentral = [
  { label: "Dashboard", href: "/central/dashboard", icon: LayoutDashboard },
  { label: "Produtos", href: "/central/produtos", icon: Package },
  { label: "Categorias", href: "/central/categorias", icon: Tag },
  { label: "Estoque", href: "/central/estoque", icon: Warehouse },
  { label: "Pedidos", href: "/central/pedidos", icon: ClipboardList },
  { label: "Unidades", href: "/central/unidades", icon: Building2 },
]

const menuUnidade = [
  { label: "Dashboard", href: "/unidade/dashboard", icon: LayoutDashboard },
  { label: "Catálogo", href: "/unidade/catalogo", icon: Package },
  { label: "Novo Pedido", href: "/unidade/novo-pedido", icon: ClipboardList },
  { label: "Meus Pedidos", href: "/unidade/pedidos", icon: ClipboardList },
]

export default function Layout() {
  const { perfil, nome, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const menu = perfil === "CENTRAL" ? menuCentral : menuUnidade

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="font-bold text-gray-900">Semi-Joias</h1>
          <p className="text-xs text-gray-500 truncate">{nome}</p>
          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
            {perfil}
          </span>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 w-full"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
