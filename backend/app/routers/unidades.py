from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_central
from app.models.unidade import Unidade
from app.models.usuario import PerfilEnum, Usuario
from app.schemas.unidade import UnidadeCreate, UnidadeOut, UnidadeUpdate, UsuarioUnidadeCreate
from app.utils.security import hash_senha

router = APIRouter()


@router.get("/", response_model=List[UnidadeOut])
def listar_unidades(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return db.query(Unidade).order_by(Unidade.nome).all()


@router.post("/", response_model=UnidadeOut, status_code=201)
def criar_unidade(
    dados: UnidadeCreate,
    db: Session = Depends(get_db),
    _=Depends(require_central),
):
    unidade = Unidade(**dados.model_dump())
    db.add(unidade)
    db.commit()
    db.refresh(unidade)
    return unidade


@router.put("/{unidade_id}", response_model=UnidadeOut)
def atualizar_unidade(
    unidade_id: int,
    dados: UnidadeUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_central),
):
    unidade = db.query(Unidade).filter(Unidade.id == unidade_id).first()
    if not unidade:
        raise HTTPException(status_code=404, detail="Unidade não encontrada")
    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(unidade, campo, valor)
    db.commit()
    db.refresh(unidade)
    return unidade


@router.post("/{unidade_id}/usuarios", status_code=201)
def criar_usuario_unidade(
    unidade_id: int,
    dados: UsuarioUnidadeCreate,
    db: Session = Depends(get_db),
    _=Depends(require_central),
):
    unidade = db.query(Unidade).filter(Unidade.id == unidade_id).first()
    if not unidade:
        raise HTTPException(status_code=404, detail="Unidade não encontrada")

    existente = db.query(Usuario).filter(Usuario.email == dados.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    usuario = Usuario(
        email=dados.email,
        senha_hash=hash_senha(dados.senha),
        nome=dados.nome,
        perfil=PerfilEnum.UNIDADE,
        unidade_id=unidade_id,
    )
    db.add(usuario)
    db.commit()
    return {"mensagem": "Usuário criado com sucesso", "email": usuario.email}
