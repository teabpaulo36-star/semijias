from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.deps import get_current_user, require_central, require_unidade
from app.models.estoque import EstoqueCentral
from app.models.pedido import ItemPedido, Pedido, StatusPedidoEnum
from app.models.produto import Produto
from app.schemas.pedido import PedidoAprovar, PedidoCreate, PedidoOut, PedidoRejeitar

router = APIRouter()


def _carregar_pedido(pedido_id: int, db: Session) -> Pedido:
    pedido = (
        db.query(Pedido)
        .options(
            joinedload(Pedido.itens).joinedload(ItemPedido.produto).joinedload(Produto.categoria),
            joinedload(Pedido.itens).joinedload(ItemPedido.produto).joinedload(Produto.estoque),
        )
        .filter(Pedido.id == pedido_id)
        .first()
    )
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return pedido


@router.post("/", response_model=PedidoOut, status_code=201)
def criar_pedido(
    dados: PedidoCreate,
    db: Session = Depends(get_db),
    usuario=Depends(require_unidade),
):
    if not dados.itens:
        raise HTTPException(status_code=400, detail="O pedido deve ter pelo menos um item")

    pedido = Pedido(
        unidade_id=usuario.unidade_id,
        observacoes=dados.observacoes,
        status=StatusPedidoEnum.PENDENTE,
    )
    db.add(pedido)
    db.flush()

    for item_dados in dados.itens:
        produto = db.query(Produto).filter(
            Produto.id == item_dados.produto_id, Produto.ativo == True
        ).first()
        if not produto:
            raise HTTPException(
                status_code=400,
                detail=f"Produto {item_dados.produto_id} não encontrado ou inativo",
            )
        item = ItemPedido(
            pedido_id=pedido.id,
            produto_id=item_dados.produto_id,
            quantidade_solicitada=item_dados.quantidade_solicitada,
        )
        db.add(item)

    db.commit()
    return _carregar_pedido(pedido.id, db)


@router.get("/", response_model=List[PedidoOut])
def listar_pedidos(
    status: Optional[StatusPedidoEnum] = None,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    query = db.query(Pedido).options(
        joinedload(Pedido.itens).joinedload(ItemPedido.produto).joinedload(Produto.categoria),
        joinedload(Pedido.itens).joinedload(ItemPedido.produto).joinedload(Produto.estoque),
    )

    # Unidade vê apenas os seus pedidos; Central vê todos
    if usuario.perfil == "UNIDADE":
        query = query.filter(Pedido.unidade_id == usuario.unidade_id)

    if status:
        query = query.filter(Pedido.status == status)

    return query.order_by(Pedido.criado_em.desc()).all()


@router.get("/{pedido_id}", response_model=PedidoOut)
def buscar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    pedido = _carregar_pedido(pedido_id, db)

    # Unidade só pode ver os próprios pedidos
    if usuario.perfil == "UNIDADE" and pedido.unidade_id != usuario.unidade_id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    return pedido


@router.patch("/{pedido_id}/aprovar", response_model=PedidoOut)
def aprovar_pedido(
    pedido_id: int,
    dados: PedidoAprovar,
    db: Session = Depends(get_db),
    _=Depends(require_central),
):
    pedido = _carregar_pedido(pedido_id, db)

    if pedido.status != StatusPedidoEnum.PENDENTE:
        raise HTTPException(status_code=400, detail="Apenas pedidos PENDENTE podem ser aprovados")

    # Mapear itens da aprovação por id
    aprovacoes = {a.item_id: a.quantidade_aprovada for a in dados.itens}

    for item in pedido.itens:
        qtd_aprovada = aprovacoes.get(item.id, 0)
        if qtd_aprovada < 0:
            raise HTTPException(status_code=400, detail="Quantidade aprovada não pode ser negativa")

        item.quantidade_aprovada = qtd_aprovada

        if qtd_aprovada > 0:
            estoque = db.query(EstoqueCentral).filter(
                EstoqueCentral.produto_id == item.produto_id
            ).first()
            if not estoque or estoque.quantidade < qtd_aprovada:
                raise HTTPException(
                    status_code=400,
                    detail=f"Estoque insuficiente para o produto {item.produto_id}",
                )
            estoque.quantidade -= qtd_aprovada

    pedido.status = StatusPedidoEnum.APROVADO
    db.commit()
    return _carregar_pedido(pedido_id, db)


@router.patch("/{pedido_id}/rejeitar", response_model=PedidoOut)
def rejeitar_pedido(
    pedido_id: int,
    dados: PedidoRejeitar,
    db: Session = Depends(get_db),
    _=Depends(require_central),
):
    pedido = _carregar_pedido(pedido_id, db)

    if pedido.status != StatusPedidoEnum.PENDENTE:
        raise HTTPException(status_code=400, detail="Apenas pedidos PENDENTE podem ser rejeitados")

    pedido.status = StatusPedidoEnum.REJEITADO
    if dados.observacoes:
        pedido.observacoes = dados.observacoes

    db.commit()
    return _carregar_pedido(pedido_id, db)
