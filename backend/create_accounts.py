"""
backend/create_accounts.py
Crée les comptes de rôle manquants. Idempotent : ne touche pas à l'existant.
Lancé automatiquement par START_MINETRACK.bat après le démarrage du backend,
et par server.py au démarrage quand MINETRACK_DEMO_ACCOUNTS=1 (déploiement de démo).
"""
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

import bcrypt

DB = Path(os.environ.get("MINETRACK_DB_PATH") or Path(__file__).parent / "minetrack.db")

ACCOUNTS = [
    ("admin@minetrack.com", "admin123", "Administrateur", "admin"),
    ("management@minetrack.com", "mgmt123", "Manager", "management"),
    ("supervision@minetrack.com", "super123", "Superviseur", "supervisor"),
    ("geologue@minetrack.com", "geo123", "Géologue", "geologist"),
    ("operateur@minetrack.com", "oper123", "Opérateur", "operator"),
    ("logistique@minetrack.com", "logi123", "Logistique", "logistique"),
    ("support@minetrack.com", "support123", "Support technique", "support"),
]


def ensure_accounts(db_path=DB, verbose=True):
    """Ajoute les comptes de démo absents. Renvoie le nombre de comptes créés.

    MINETRACK_DEMO_PASSWORD (variable d'environnement, ex. sur Vercel) remplace
    les mots de passe par défaut ci-dessus, qui sont publics (README) et ne
    doivent jamais protéger un site accessible sur internet.
    """
    override = os.environ.get("MINETRACK_DEMO_PASSWORD")
    conn = sqlite3.connect(db_path)
    created = 0
    try:
        for email, default_pwd, name, role in ACCOUNTS:
            pwd = override or default_pwd
            exists = conn.execute(
                "SELECT 1 FROM users WHERE email=? AND role=?", (email, role)
            ).fetchone()
            if exists:
                continue
            conn.execute(
                "INSERT INTO users (id, email, password, name, role, created_at) VALUES (?,?,?,?,?,?)",
                (str(uuid.uuid4()), email,
                 bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode(),
                 name, role, datetime.now(timezone.utc).isoformat()),
            )
            created += 1
            if verbose:
                shown = "<MINETRACK_DEMO_PASSWORD>" if override else pwd
                print(f"  + {email} / {shown}  ({role})")
        conn.commit()
    finally:
        conn.close()
    return created


def main():
    if not DB.exists():
        print("[!] minetrack.db absente — démarre d'abord le backend une fois.")
        return
    created = ensure_accounts(DB)
    print(f"  {created} compte(s) créé(s)." if created else "  Comptes déjà présents.")


if __name__ == "__main__":
    main()
