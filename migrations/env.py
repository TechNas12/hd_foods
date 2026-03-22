from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv
from app.database import Base
from app import models   # import all models so Alembic can detect them
import os

load_dotenv()

# Alembic Config object
config = context.config

# Setup Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ─────────────────────────────────────────────
# Point Alembic to your models' metadata
# This is what enables --autogenerate
# ─────────────────────────────────────────────
target_metadata = Base.metadata

# ─────────────────────────────────────────────
# Dynamically inject DATABASE_URL from .env
# Works for both SQLite (local) and PostgreSQL (Supabase)
# ─────────────────────────────────────────────
def get_url():
    return os.getenv("DATABASE_URL", "sqlite:///./hd_foods.db")


def run_migrations_offline() -> None:
    """
    Run migrations without a live DB connection.
    Useful for generating SQL scripts to review before applying.
    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,   # detect column type changes
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations with a live DB connection.
    This is the normal mode used in development and production.
    """
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = get_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,   # NullPool is safer for migration scripts
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,   # detect column type changes
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()