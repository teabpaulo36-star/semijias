# Sistema de Gestão de Semi-Joias

## Visão Geral
Sistema web para gerenciar estoque e pedidos de abastecimento de uma rede de lojas de semi-joias.

Dois perfis de usuário:
- **CENTRAL** — administrador da rede (gerencia produtos, estoque, aprova pedidos)
- **UNIDADE** — loja franqueada (consulta catálogo, faz pedidos de abastecimento)

## URLs em Produção
- Frontend: https://semijias-qjk6.vercel.app
- Backend: https://semijias-back.onrender.com
- Banco: Neon.tech (PostgreSQL serverless)
- Repositório: https://github.com/teabpaulo36-star/semijias

## Stack
- **Backend:** Python 3.12 + FastAPI + SQLAlchemy 2.0 + Alembic
- **Banco:** PostgreSQL via Neon.tech (usa NullPool obrigatoriamente por causa do PgBouncer)
- **Frontend:** React + Vite + TypeScript + Tailwind CSS v4
- **Estado:** Zustand (authStore com persist, cartStore)
- **HTTP:** Axios com interceptor JWT automático
- **Deploy:** Render.com (backend) + Vercel (frontend)

## Estrutura de Pastas
```
semijias/
  backend/
    app/
      main.py          # FastAPI + CORS
      config.py        # Settings (DATABASE_URL, JWT_SECRET)
      database.py      # SQLAlchemy engine com NullPool
      deps.py          # get_current_user, require_central, require_unidade
      models/          # usuario, unidade, categoria, produto, estoque, pedido
      schemas/         # Pydantic: auth, produto, pedido, estoque, unidade
      routers/         # auth, categorias, produtos, estoque, unidades, pedidos, dashboard
      utils/
        security.py    # hash_senha, verificar_senha, criar_token (JWT)
    alembic/           # Migrations
    requirements.txt
    render.yaml
    .python-version    # Força Python 3.12 no Render (evita falha com 3.14)
  frontend/
    src/
      api/             # client.ts (axios) + módulos por recurso
      components/ui/   # Componentes manuais (shadcn incompatível com Tailwind v4)
      pages/
        central/       # Dashboard, Produtos, Categorias, Estoque, Pedidos, Unidades
        unidade/       # Dashboard, Catalogo, NovoPedido, MeusPedidos
      store/           # authStore.ts, cartStore.ts
      App.tsx          # Rotas protegidas por perfil
    .env               # VITE_API_URL=https://semijias-back.onrender.com
    vercel.json        # Rewrite SPA para React Router
```

## Decisões Importantes

### NullPool no banco
Neon.tech usa PgBouncer. O pool interno do SQLAlchemy conflita com ele.
Sempre usar `poolclass=NullPool` no `create_engine`.

### Tailwind v4
Usa `@tailwindcss/vite` como plugin do Vite — não usa PostCSS nem `tailwind.config.js`.
O comando `npx tailwindcss init` não existe na v4.
O `npx shadcn@latest init` é incompatível com Tailwind v4 — todos os componentes UI foram criados manualmente.

### Autenticação
Login via `application/x-www-form-urlencoded` (OAuth2PasswordRequestForm do FastAPI).
O frontend envia como form-data, não JSON.

### Estoque
Descontado ao **aprovar** o pedido, não ao criar. Evita reserva de estoque de pedidos rejeitados.

### Soft delete
Produtos usam `ativo=False` em vez de deletar — preserva histórico de pedidos.

## Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL=postgresql://neondb_owner:...@.../neondb?sslmode=require&channel_binding=require
JWT_SECRET=9a9f3fde51145eb7e022d2a1b8988a09d733b799517386ef19b3271d5b1778df
```

### Frontend (.env)
```
VITE_API_URL=https://semijias-back.onrender.com
```

## Usuário Inicial
- Email: admin@semijias.com
- Senha: senha123
- Perfil: CENTRAL

Usuários de unidade são criados dentro do sistema em Unidades > ícone de usuário.

## Avisos
- O backend no Render (plano gratuito) hiberna após 15 min sem uso — primeiro acesso demora ~30s
- O banco Neon.tech tem limite de armazenamento/computação no plano gratuito
- Para rodar localmente: `cd backend && venv\Scripts\activate && uvicorn app.main:app --reload`
