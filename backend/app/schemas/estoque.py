from pydantic import BaseModel
from typing import Optional

from app.schemas.produto import ProdutoOut


class EstoqueUpdate(BaseModel):
    quantidade: int
    quantidade_minima: Optional[int] = None


class EstoqueOut(BaseModel):
    id: int
    produto_id: int
    quantidade: int
    quantidade_minima: int
    produto: Optional[ProdutoOut] = None

    model_config = {"from_attributes": True}
