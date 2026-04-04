from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.schemas.categoria import CategoriaOut


class EstoqueEmbed(BaseModel):
    quantidade: int
    quantidade_minima: int

    model_config = {"from_attributes": True}


class ProdutoCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    preco_custo: Decimal
    preco_venda: Decimal
    foto_url: Optional[str] = None
    categoria_id: Optional[int] = None


class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    preco_custo: Optional[Decimal] = None
    preco_venda: Optional[Decimal] = None
    foto_url: Optional[str] = None
    categoria_id: Optional[int] = None
    ativo: Optional[bool] = None


class ProdutoOut(BaseModel):
    id: int
    nome: str
    descricao: Optional[str] = None
    preco_custo: Decimal
    preco_venda: Decimal
    foto_url: Optional[str] = None
    ativo: bool
    categoria: Optional[CategoriaOut] = None
    estoque: Optional[EstoqueEmbed] = None

    model_config = {"from_attributes": True}
