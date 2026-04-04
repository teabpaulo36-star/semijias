from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar todos os models para o SQLAlchemy resolver os relacionamentos
import app.models.unidade
import app.models.usuario
import app.models.categoria
import app.models.produto
import app.models.estoque
import app.models.pedido

app = FastAPI(title="Sistema Semi-Joias", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção: colocar apenas o domínio do Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.routers import auth, categorias, estoque, produtos, unidades, pedidos, dashboard

app.include_router(auth.router,       prefix="/auth",       tags=["Auth"])
app.include_router(categorias.router, prefix="/categorias", tags=["Categorias"])
app.include_router(produtos.router,   prefix="/produtos",   tags=["Produtos"])
app.include_router(estoque.router,    prefix="/estoque",    tags=["Estoque"])
app.include_router(unidades.router,   prefix="/unidades",   tags=["Unidades"])
app.include_router(pedidos.router,    prefix="/pedidos",    tags=["Pedidos"])
app.include_router(dashboard.router,  prefix="/dashboard",  tags=["Dashboard"])


@app.get("/health")
def health():
    return {"status": "ok"}
