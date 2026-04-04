from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from app.models.pedido import StatusPedidoEnum
from app.schemas.produto import ProdutoOut


class ItemPedidoCreate(BaseModel):
    produto_id: int
    quantidade_solicitada: int


class ItemPedidoOut(BaseModel):
    id: int
    produto_id: int
    quantidade_solicitada: int
    quantidade_aprovada: Optional[int]
    produto: ProdutoOut

    model_config = {"from_attributes": True}


class PedidoCreate(BaseModel):
    observacoes: Optional[str] = None
    itens: List[ItemPedidoCreate]


class PedidoOut(BaseModel):
    id: int
    unidade_id: int
    status: StatusPedidoEnum
    observacoes: Optional[str]
    criado_em: datetime
    itens: List[ItemPedidoOut]

    model_config = {"from_attributes": True}


class ItemAprovacao(BaseModel):
    item_id: int
    quantidade_aprovada: int


class PedidoAprovar(BaseModel):
    itens: List[ItemAprovacao]


class PedidoRejeitar(BaseModel):
    observacoes: Optional[str] = None
