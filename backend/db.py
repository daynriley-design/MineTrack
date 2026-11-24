"""
Connexion DB centralisée + schéma.
PERF: connexion unique réutilisée (pas une nouvelle connexion SQLite par requête),
WAL mode (lecteurs non bloqués par écrivains), index sur colonnes filtrées/jointes.

NOTE SCALABILITÉ: SQLite = un seul writer à la fois. Convient à usage interne
(dizaines-centaines d'utilisateurs concurrents). Pour "millions d'utilisateurs"
réels, migrer vers Postgres + pool asyncpg — la logique applicative ci-dessous
reste compatible (seule cette couche change).
"""
import aiosqlite
from pathlib import Path
from contextlib import asynccontextmanager

ROOT_DIR = Path(__file__).parent
DB_PATH = ROOT_DIR / "minetrack.db"

TABLES: dict[str, str] = {
    "users": """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            role TEXT DEFAULT 'operator',
            created_at TEXT
        )
    """,
    "pegs": """
        CREATE TABLE IF NOT EXISTS pegs (
            id TEXT PRIMARY KEY, peg_id TEXT, zone TEXT, coordinates TEXT,
            status TEXT DEFAULT 'active', date_installed TEXT, notes TEXT,
            created_at TEXT, created_by TEXT
        )
    """,
    "work_progress": """
        CREATE TABLE IF NOT EXISTS work_progress (
            id TEXT PRIMARY KEY, peg_id TEXT, activity TEXT, team TEXT,
            progress_percent REAL DEFAULT 0, status TEXT DEFAULT 'in_progress',
            start_date TEXT, end_date TEXT, notes TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "drilling": """
        CREATE TABLE IF NOT EXISTS drilling (
            id TEXT PRIMARY KEY, peg_id TEXT, hole_id TEXT, depth_m REAL,
            diameter_mm REAL, rock_type TEXT, status TEXT DEFAULT 'planned',
            date TEXT, operator TEXT, notes TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "blasting": """
        CREATE TABLE IF NOT EXISTS blasting (
            id TEXT PRIMARY KEY, peg_id TEXT, blast_id TEXT, explosives_kg REAL,
            holes_count INTEGER, date TEXT, status TEXT DEFAULT 'planned',
            result TEXT, notes TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "production": """
        CREATE TABLE IF NOT EXISTS production (
            id TEXT PRIMARY KEY, peg_id TEXT, date TEXT, material_type TEXT,
            volume_m3 REAL, tonnage REAL, equipment_id TEXT, shift TEXT DEFAULT 'day',
            notes TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "equipment": """
        CREATE TABLE IF NOT EXISTS equipment (
            id TEXT PRIMARY KEY, equipment_id TEXT, name TEXT, type TEXT,
            status TEXT DEFAULT 'operational', hours_used REAL DEFAULT 0,
            next_service_date TEXT, location TEXT, notes TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "labor": """
        CREATE TABLE IF NOT EXISTS labor (
            id TEXT PRIMARY KEY, employee_id TEXT, name TEXT, role TEXT, team TEXT,
            shift TEXT DEFAULT 'day', hours_worked REAL DEFAULT 0, date TEXT, peg_id TEXT,
            origin_status TEXT DEFAULT 'national', contract_type TEXT DEFAULT 'direct',
            notes TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "hse": """
        CREATE TABLE IF NOT EXISTS hse (
            id TEXT PRIMARY KEY, incident_id TEXT, type TEXT, severity TEXT DEFAULT 'low',
            description TEXT, location TEXT, date TEXT, reported_by TEXT,
            status TEXT DEFAULT 'open', corrective_action TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "geology": """
        CREATE TABLE IF NOT EXISTS geology (
            id TEXT PRIMARY KEY, sample_id TEXT, peg_id TEXT, depth_from REAL, depth_to REAL,
            rock_type TEXT, grade_au_gt REAL, grade_cu_pct REAL, grade_co_pct REAL,
            grade_coltan_gt REAL, date TEXT, geologist TEXT, notes TEXT,
            created_at TEXT, created_by TEXT
        )
    """,
    "support": """
        CREATE TABLE IF NOT EXISTS support (
            id TEXT PRIMARY KEY, ticket_id TEXT, category TEXT, priority TEXT DEFAULT 'medium',
            description TEXT, requested_by TEXT, assigned_to TEXT, status TEXT DEFAULT 'open',
            date_created TEXT, date_resolved TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "financial": """
        CREATE TABLE IF NOT EXISTS financial (
            id TEXT PRIMARY KEY, record_id TEXT, date TEXT, category TEXT,
            currency TEXT DEFAULT 'USD', description TEXT, amount REAL, amount_usd REAL,
            peg_id TEXT, approved_by TEXT, notes TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "peg_advances": """
        CREATE TABLE IF NOT EXISTS peg_advances (
            id TEXT PRIMARY KEY, peg_id TEXT, shift TEXT, date TEXT,
            drilled_meters REAL DEFAULT 0, blasted_holes INTEGER DEFAULT 0,
            mucked_tonnage REAL DEFAULT 0, notes TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "incidents": """
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY, title TEXT, description TEXT, severity TEXT DEFAULT 'low',
            location TEXT, date TEXT, reported_by TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "hse_checklists": """
        CREATE TABLE IF NOT EXISTS hse_checklists (
            id TEXT PRIMARY KEY, peg_id TEXT, shift TEXT, date TEXT,
            face_safe BOOLEAN DEFAULT 0, ventilation_ok BOOLEAN DEFAULT 0,
            gas_checked BOOLEAN DEFAULT 0, water_sprayed BOOLEAN DEFAULT 0,
            supports_ok BOOLEAN DEFAULT 0, notes TEXT, created_at TEXT, created_by TEXT
        )
    """,
    "equipment_pannes": """
        CREATE TABLE IF NOT EXISTS equipment_pannes (
            id TEXT PRIMARY KEY, equipment_id TEXT, issue_type TEXT, description TEXT,
            reported_date TEXT, reported_by TEXT, status TEXT DEFAULT 'open', photo TEXT,
            created_at TEXT, created_by TEXT
        )
    """,
    "mini_reports": """
        CREATE TABLE IF NOT EXISTS mini_reports (
            id TEXT PRIMARY KEY, shift TEXT, date TEXT, peg_id TEXT,
            weather_conditions TEXT DEFAULT 'normal', safety_summary TEXT,
            production_summary TEXT, issues_encountered TEXT, submitted_by TEXT,
            created_at TEXT, created_by TEXT
        )
    """,
}

# PERF: index sur colonnes filtrées/groupées fréquemment (dashboard, jointures peg_id)
INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
    "CREATE INDEX IF NOT EXISTS idx_pegs_status ON pegs(status)",
    "CREATE INDEX IF NOT EXISTS idx_pegs_zone ON pegs(zone)",
    "CREATE INDEX IF NOT EXISTS idx_production_date ON production(date)",
    "CREATE INDEX IF NOT EXISTS idx_production_peg ON production(peg_id)",
    "CREATE INDEX IF NOT EXISTS idx_hse_status ON hse(status)",
    "CREATE INDEX IF NOT EXISTS idx_hse_severity ON hse(severity)",
    "CREATE INDEX IF NOT EXISTS idx_hse_type ON hse(type)",
    "CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status)",
    "CREATE INDEX IF NOT EXISTS idx_labor_origin ON labor(origin_status)",
    "CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity)",
    "CREATE INDEX IF NOT EXISTS idx_equipment_pannes_status ON equipment_pannes(status)",
]

# PERF: connexion process-wide unique, WAL activé (lecteurs concurrents non bloqués),
# évite le coût d'ouverture/fermeture de connexion à chaque requête HTTP.
_connection: aiosqlite.Connection | None = None


async def init_connection() -> aiosqlite.Connection:
    global _connection
    _connection = await aiosqlite.connect(DB_PATH)
    await _connection.execute("PRAGMA journal_mode=WAL")
    await _connection.execute("PRAGMA synchronous=NORMAL")
    await _connection.execute("PRAGMA foreign_keys=ON")
    for sql in TABLES.values():
        await _connection.execute(sql)
    for sql in INDEXES:
        await _connection.execute(sql)
    await _connection.commit()
    return _connection


async def close_connection():
    if _connection is not None:
        await _connection.close()


def get_connection() -> aiosqlite.Connection:
    if _connection is None:
        raise RuntimeError("DB non initialisée — init_connection() doit tourner au lifespan startup")
    return _connection
