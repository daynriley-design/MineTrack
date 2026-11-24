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

import database

DB = database.DB_PATH

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
    if not override and (database.IS_POSTGRES or os.environ.get("VERCEL")
                         or os.environ.get("MINETRACK_ENV") == "production"):
        raise RuntimeError("MINETRACK_DEMO_PASSWORD est requis pour les comptes de démo hors développement local")
    if override and (override in {account[1] for account in ACCOUNTS} or not 12 <= len(override.encode()) <= 72):
        raise RuntimeError("MINETRACK_DEMO_PASSWORD doit être unique et contenir entre 12 et 72 octets")

    # Postgres (Supabase, DATABASE_URL) ou SQLite (fichier db_path).
    if database.IS_POSTGRES:
        def exists(email, role):
            return database.sync_fetchone("SELECT 1 FROM users WHERE email=? AND role=?", (email, role))
    else:
        conn = sqlite3.connect(db_path)

        def exists(email, role):
            return conn.execute("SELECT 1 FROM users WHERE email=? AND role=?", (email, role)).fetchone()

    inserts = []
    try:
        for email, default_pwd, name, role in ACCOUNTS:
            if exists(email, role):
                continue
            pwd = override or default_pwd
            uid = uuid.uuid4()
            if not database.IS_POSTGRES and os.environ.get("VERCEL"):
                uid = uuid.uuid5(uuid.NAMESPACE_URL, f"https://minetrack.app/demo/{email}/{role}")
            inserts.append((
                "INSERT INTO users (id, email, password, name, role, created_at) VALUES (?,?,?,?,?,?) ON CONFLICT DO NOTHING",
                (str(uid), email, bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode(),
                 name, role, datetime.now(timezone.utc).isoformat()),
            ))
            if verbose:
                shown = "<MINETRACK_DEMO_PASSWORD>" if override else pwd
                print(f"  + {email} / {shown}  ({role})")
        if database.IS_POSTGRES:
            database.sync_execute_many(inserts)
        else:
            for sql, params in inserts:
                conn.execute(sql, params)
            conn.commit()
    finally:
        if not database.IS_POSTGRES:
            conn.close()
    return len(inserts)


def main():
    if not database.IS_POSTGRES and not DB.exists():
        print("[!] minetrack.db absente — démarre d'abord le backend une fois.")
        return
    created = ensure_accounts(DB)
    print(f"  {created} compte(s) créé(s)." if created else "  Comptes déjà présents.")


if __name__ == "__main__":
    main()
