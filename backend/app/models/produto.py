from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String)
    preco_custo = Column(Numeric(10, 2), nullable=False)
    preco_venda = Column(Numeric(10, 2), nullable=False)
    foto_url = Column(String)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    ativo = Column(Boolean, default=True)

    categoria = relationship("Categoria", back_populates="produtos")
    estoque = relationship("EstoqueCentral", back_populates="produto", uselist=False)
    itens_pedido = relationship("ItemPedido", back_populates="produto")
