from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.estoque import EstoqueCentral
from app.models.pedido import Pedido, StatusPedidoEnum
from app.models.produto import Produto

router = APIRouter()


@router.get("/")
def dashboard(
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    if usuario.perfil == "CENTRAL":
        pendentes = db.query(Pedido).filter(Pedido.status == StatusPedidoEnum.PENDENTE).count()

        criticos = (
            db.query(EstoqueCentral)
            .join(EstoqueCentral.produto)
            .filter(
                Produto.ativo == True,
                EstoqueCentral.quantidade <= EstoqueCentral.quantidade_minima,
            )
            .count()
        )

        total_produtos = db.query(Produto).filter(Produto.ativo == True).count()

        ultimos_pedidos = (
            db.query(Pedido)
            .order_by(Pedido.criado_em.desc())
            .limit(5)
            .all()
        )

        return {
            "perfil": "CENTRAL",
            "pedidos_pendentes": pendentes,
            "itens_estoque_critico": criticos,
            "total_produtos_ativos": total_produtos,
            "ultimos_pedidos": [
                {
                    "id": p.id,
                    "unidade_id": p.unidade_id,
                    "status": p.status,
                    "criado_em": p.criado_em,
                }
                for p in ultimos_pedidos
            ],
        }

    else:  # UNIDADE
        meus_pedidos = (
            db.query(Pedido)
            .filter(Pedido.unidade_id == usuario.unidade_id)
            .order_by(Pedido.criado_em.desc())
            .limit(5)
            .all()
        )

        pendentes = sum(1 for p in meus_pedidos if p.status == StatusPedidoEnum.PENDENTE)

        return {
            "perfil": "UNIDADE",
            "meus_pedidos_pendentes": pendentes,
            "ultimos_pedidos": [
                {
                    "id": p.id,
                    "status": p.status,
                    "criado_em": p.criado_em,
                }
                for p in meus_pedidos
            ],
        }
