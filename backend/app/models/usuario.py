import enum

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class PerfilEnum(str, enum.Enum):
    CENTRAL = "CENTRAL"
    UNIDADE = "UNIDADE"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    senha_hash = Column(String, nullable=False)
    nome = Column(String, nullable=False)
    perfil = Column(Enum(PerfilEnum), nullable=False)
    unidade_id = Column(Integer, ForeignKey("unidades.id"), nullable=True)
    ativo = Column(Boolean, default=True)

    unidade = relationship("Unidade", back_populates="usuarios")
