"""
Script para criar o primeiro usuario CENTRAL.
Executar UMA VEZ apos rodar a migration.

Como usar:
  1. Ative o ambiente virtual: venv/Scripts/activate
  2. Execute: python seed_admin.py
"""
from app.database import SessionLocal
# Importar todos os models para o SQLAlchemy resolver os relacionamentos
import app.models.unidade
import app.models.categoria
import app.models.produto
import app.models.estoque
import app.models.pedido
from app.models.usuario import Usuario, PerfilEnum
from app.utils.security import hash_senha

db = SessionLocal()

# Verifica se já existe um admin
existente = db.query(Usuario).filter(Usuario.email == "admin@semijias.com").first()
if existente:
    print("Admin já existe! Use email: admin@semijias.com")
else:
    admin = Usuario(
        email="admin@semijias.com",
        senha_hash=hash_senha("senha123"),
        nome="Administrador",
        perfil=PerfilEnum.CENTRAL,
    )
    db.add(admin)
    db.commit()
    print("Admin criado com sucesso!")
    print("  Email: admin@semijias.com")
    print("  Senha: senha123")
    print("")
    print("IMPORTANTE: Troque a senha após o primeiro login!")

db.close()
