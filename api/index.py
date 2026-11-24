"""
Point d'entrée Vercel (fonction Python) : expose l'app FastAPI de backend/.

vercel.json redirige /api/* ici ; FastAPI reçoit le chemin d'origine
(/api/auth/login, ...). La base SQLite vit dans /tmp : elle est éphémère
(démo), les tables et les comptes de démo sont recréés automatiquement.
"""
import os
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND))

os.environ.setdefault("MINETRACK_DB_PATH", "/tmp/minetrack.db")
os.environ.setdefault("MINETRACK_DEMO_ACCOUNTS", "1")

from server import app  # noqa: E402  (le chemin doit être posé avant l'import)

__all__ = ["app"]
