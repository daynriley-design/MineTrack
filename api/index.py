"""
Point d'entrée Vercel (fonction Python) : expose l'app FastAPI de backend/.

vercel.json redirige /api/* ici ; FastAPI reçoit le chemin d'origine
(/api/auth/login, ...). En mode SQLite, la base de démonstration vit dans /tmp.
"""
import os
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND))

os.environ.setdefault("MINETRACK_DB_PATH", "/tmp/minetrack.db")

# Sans Supabase (DATABASE_URL absent ou vide), la base /tmp repart vide a chaque
# instance : sans comptes de demo, personne ne pourrait se connecter ni valider
# les inscriptions. On ne les cree JAMAIS dans une vraie base Postgres.
_db_url = (os.environ.get("DATABASE_URL") or "").strip()
if not _db_url.startswith(("postgres://", "postgresql://")):
    os.environ.setdefault("MINETRACK_DEMO_ACCOUNTS", "1")

from server import app  # noqa: E402  (le chemin doit être posé avant l'import)

__all__ = ["app"]
