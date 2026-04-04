"""Schema inicial: todas as tabelas

Revision ID: 001
Revises:
Create Date: 2026-04-03

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tabela: unidades
    op.create_table(
        "unidades",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(), nullable=False),
        sa.Column("responsavel", sa.String()),
        sa.Column("email", sa.String()),
        sa.Column("telefone", sa.String()),
        sa.Column("cidade", sa.String()),
        sa.Column("ativo", sa.Boolean(), server_default="true"),
    )

    # Tabela: usuarios
    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("senha_hash", sa.String(), nullable=False),
        sa.Column("nome", sa.String(), nullable=False),
        sa.Column(
            "perfil",
            sa.Enum("CENTRAL", "UNIDADE", name="perfilenum"),
            nullable=False,
        ),
        sa.Column(
            "unidade_id",
            sa.Integer(),
            sa.ForeignKey("unidades.id"),
            nullable=True,
        ),
        sa.Column("ativo", sa.Boolean(), server_default="true"),
    )
    op.create_index("ix_usuarios_email", "usuarios", ["email"], unique=True)

    # Tabela: categorias
    op.create_table(
        "categorias",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(), nullable=False),
        sa.Column("descricao", sa.String()),
    )

    # Tabela: produtos
    op.create_table(
        "produtos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nome", sa.String(), nullable=False),
        sa.Column("descricao", sa.String()),
        sa.Column("preco_custo", sa.Numeric(10, 2), nullable=False),
        sa.Column("preco_venda", sa.Numeric(10, 2), nullable=False),
        sa.Column("foto_url", sa.String()),
        sa.Column(
            "categoria_id", sa.Integer(), sa.ForeignKey("categorias.id"), nullable=True
        ),
        sa.Column("ativo", sa.Boolean(), server_default="true"),
    )

    # Tabela: estoque_central
    op.create_table(
        "estoque_central",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "produto_id",
            sa.Integer(),
            sa.ForeignKey("produtos.id"),
            unique=True,
            nullable=False,
        ),
        sa.Column("quantidade", sa.Integer(), server_default="0"),
        sa.Column("quantidade_minima", sa.Integer(), server_default="5"),
    )

    # Tabela: pedidos
    op.create_table(
        "pedidos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "unidade_id",
            sa.Integer(),
            sa.ForeignKey("unidades.id"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "PENDENTE", "APROVADO", "REJEITADO", "ENTREGUE", name="statuspedidoenum"
            ),
            server_default="PENDENTE",
        ),
        sa.Column("observacoes", sa.String()),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column("atualizado_em", sa.DateTime(timezone=True)),
    )

    # Tabela: itens_pedido
    op.create_table(
        "itens_pedido",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "pedido_id",
            sa.Integer(),
            sa.ForeignKey("pedidos.id"),
            nullable=False,
        ),
        sa.Column(
            "produto_id",
            sa.Integer(),
            sa.ForeignKey("produtos.id"),
            nullable=False,
        ),
        sa.Column("quantidade_solicitada", sa.Integer(), nullable=False),
        sa.Column("quantidade_aprovada", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("itens_pedido")
    op.drop_table("pedidos")
    op.drop_table("estoque_central")
    op.drop_table("produtos")
    op.drop_table("categorias")
    op.drop_index("ix_usuarios_email", table_name="usuarios")
    op.drop_table("usuarios")
    op.drop_table("unidades")
    op.execute("DROP TYPE IF EXISTS perfilenum")
    op.execute("DROP TYPE IF EXISTS statuspedidoenum")
