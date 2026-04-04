from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    from app.models.usuario import Usuario

    credenciais_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credenciais_exc
    except JWTError:
        raise credenciais_exc

    usuario = (
        db.query(Usuario)
        .filter(Usuario.id == int(user_id), Usuario.ativo == True)
        .first()
    )
    if not usuario:
        raise credenciais_exc
    return usuario


def require_central(usuario=Depends(get_current_user)):
    from app.models.usuario import PerfilEnum

    if usuario.perfil != PerfilEnum.CENTRAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso apenas para a Central",
        )
    return usuario


def require_unidade(usuario=Depends(get_current_user)):
    from app.models.usuario import PerfilEnum

    if usuario.perfil != PerfilEnum.UNIDADE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso apenas para Unidades",
        )
    return usuario
