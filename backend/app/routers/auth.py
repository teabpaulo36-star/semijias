from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.usuario import Usuario
from app.schemas.auth import MeOut, TokenOut
from app.utils.security import criar_token, verificar_senha

router = APIRouter()


@router.post("/login", response_model=TokenOut)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    usuario = (
        db.query(Usuario)
        .filter(Usuario.email == form_data.username, Usuario.ativo == True)
        .first()
    )

    if not usuario or not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
        )

    token = criar_token(
        {
            "sub": str(usuario.id),
            "perfil": usuario.perfil,
            "nome": usuario.nome,
            "unidade_id": usuario.unidade_id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "perfil": usuario.perfil,
        "nome": usuario.nome,
        "unidade_id": usuario.unidade_id,
    }


@router.get("/me", response_model=MeOut)
def me(usuario: Usuario = Depends(get_current_user)):
    return usuario
