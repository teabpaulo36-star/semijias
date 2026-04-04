from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import settings

# psycopg3 exige o prefixo "postgresql+psycopg://"
_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
# NullPool: necessário quando se usa o pooler do Neon (PgBouncer)
engine = create_engine(_url, poolclass=NullPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
