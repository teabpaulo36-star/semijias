from pydantic import BaseModel


class TokenOut(BaseModel):
    access_token: str
    token_type: str
    perfil: str
    nome: str
    unidade_id: int | None


class MeOut(BaseModel):
    id: int
    nome: str
    email: str
    perfil: str
    unidade_id: int | None
