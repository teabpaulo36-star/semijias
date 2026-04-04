from pydantic import BaseModel
from typing import Optional


class CategoriaCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None


class CategoriaUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None


class CategoriaOut(BaseModel):
    id: int
    nome: str
    descricao: Optional[str] = None

    model_config = {"from_attributes": True}
