from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database import Base


class EstoqueCentral(Base):
    __tablename__ = "estoque_central"

    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), unique=True, nullable=False)
    quantidade = Column(Integer, default=0)
    quantidade_minima = Column(Integer, default=5)

    produto = relationship("Produto", back_populates="estoque")
