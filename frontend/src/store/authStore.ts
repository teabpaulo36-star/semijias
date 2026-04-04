import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  token: string | null
  perfil: string | null
  nome: string | null
  unidade_id: number | null
  setAuth: (data: { token: string; perfil: string; nome: string; unidade_id: number | null }) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      perfil: null,
      nome: null,
      unidade_id: null,
      setAuth: ({ token, perfil, nome, unidade_id }) => {
        localStorage.setItem("token", token)
        set({ token, perfil, nome, unidade_id })
      },
      logout: () => {
        localStorage.removeItem("token")
        set({ token: null, perfil: null, nome: null, unidade_id: null })
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: "auth-store" }
  )
)
