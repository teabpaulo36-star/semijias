from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, require_central
from app.models.estoque import EstoqueCentral
from app.models.produto import Produto
from app.schemas.estoque import EstoqueOut, EstoqueUpdate

router = APIRouter()


@router.get("/", response_model=List[EstoqueOut])
def listar_estoque(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return (
        db.query(EstoqueCentral)
        .options(
            joinedload(EstoqueCentral.produto).joinedload(Produto.categoria),
            joinedload(EstoqueCentral.produto).joinedload(Produto.estoque),
        )
        .join(EstoqueCentral.produto)
        .filter(Produto.ativo == True)
        .order_by(Produto.nome)
        .all()
    )


@router.patch("/{produto_id}", response_model=EstoqueOut)
def atualizar_estoque(
    produto_id: int,
    dados: EstoqueUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_central),
):
    estoque = (
        db.query(EstoqueCentral)
        .filter(EstoqueCentral.produto_id == produto_id)
        .first()
    )
    if not estoque:
        raise HTTPException(status_code=404, detail="Produto não encontrado no estoque")
    estoque.quantidade = dados.quantidade
    if dados.quantidade_minima is not None:
        estoque.quantidade_minima = dados.quantidade_minima
    db.commit()
    db.refresh(estoque)
    return estoque
