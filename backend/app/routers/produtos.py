from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, require_central
from app.models.estoque import EstoqueCentral
from app.models.produto import Produto
from app.schemas.produto import ProdutoCreate, ProdutoOut, ProdutoUpdate

router = APIRouter()


@router.get("/", response_model=List[ProdutoOut])
def listar_produtos(
    categoria_id: Optional[int] = None,
    somente_ativos: bool = True,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Produto).options(
        joinedload(Produto.categoria),
        joinedload(Produto.estoque),
    )
    if somente_ativos:
        query = query.filter(Produto.ativo == True)
    if categoria_id:
        query = query.filter(Produto.categoria_id == categoria_id)
    return query.order_by(Produto.nome).all()


@router.get("/{produto_id}", response_model=ProdutoOut)
def buscar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    produto = (
        db.query(Produto)
        .options(joinedload(Produto.categoria), joinedload(Produto.estoque))
        .filter(Produto.id == produto_id)
        .first()
    )
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto


@router.post("/", response_model=ProdutoOut, status_code=201)
def criar_produto(
    dados: ProdutoCreate,
    db: Session = Depends(get_db),
    _=Depends(require_central),
):
    produto = Produto(**dados.model_dump())
    db.add(produto)
    db.flush()  # gera o id sem commitar ainda

    # Cria registro de estoque zerado automaticamente
    estoque = EstoqueCentral(produto_id=produto.id, quantidade=0, quantidade_minima=5)
    db.add(estoque)

    db.commit()
    db.refresh(produto)
    return produto


@router.put("/{produto_id}", response_model=ProdutoOut)
def atualizar_produto(
    produto_id: int,
    dados: ProdutoUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_central),
):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(produto, campo, valor)
    db.commit()
    db.refresh(produto)
    return produto


@router.delete("/{produto_id}", status_code=204)
def desativar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_central),
):
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    produto.ativo = False  # soft delete
    db.commit()
