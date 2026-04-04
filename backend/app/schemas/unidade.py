from typing import List, Optional

from pydantic import BaseModel, EmailStr


class UnidadeCreate(BaseModel):
    nome: str
    responsavel: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    cidade: Optional[str] = None


class UnidadeUpdate(BaseModel):
    nome: Optional[str] = None
    responsavel: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    cidade: Optional[str] = None
    ativo: Optional[bool] = None


class UnidadeOut(BaseModel):
    id: int
    nome: str
    responsavel: Optional[str]
    email: Optional[str]
    telefone: Optional[str]
    cidade: Optional[str]
    ativo: bool

    model_config = {"from_attributes": True}


class UsuarioUnidadeCreate(BaseModel):
    email: str
    senha: str
    nome: str
