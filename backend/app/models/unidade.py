from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Unidade(Base):
    __tablename__ = "unidades"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    responsavel = Column(String)
    email = Column(String)
    telefone = Column(String)
    cidade = Column(String)
    ativo = Column(Boolean, default=True)

    usuarios = relationship("Usuario", back_populates="unidade")
    pedidos = relationship("Pedido", back_populates="unidade")
