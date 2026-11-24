"""
backend/routers/operations.py
Sites, plans mensuels, layouts, machines, rapports de shift.
Conventions alignées sur server.py : ids TEXT uuid, aiosqlite, require_role.
"""
import json
import os
import uuid
from datetime import datetime, timezone, date
from pathlib import Path
from typing import Optional, List

import aiosqlite
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from auth_utils import get_current_user, require_role

# Meme regle que server.py : MINETRACK_DB_PATH prime (ex. /tmp sur Vercel).
DB_PATH = Path(os.environ.get("MINETRACK_DB_PATH") or Path(__file__).parent.parent / "minetrack.db")

router = APIRouter(prefix="/api", tags=["operations"])

ADMIN = require_role("admin")

# Les 9 types consultés par Management (cahier des charges client, §2) — inchangés,
# c'est ce qui alimente la vue de couverture "9 rapports par site et par shift".
COVERAGE_REPORT_TYPES = [
    "safety",
    "concerns",
    "blasting",
    "shift_preparation",
    "construction_service",
    "tramming_machine_status",
    "drilling_machine_status",
    "longhole_report",
    "critical_material",
]

# Types supplémentaires soumis par des fonctions de Supervision/Support dont le
# contenu n'est pas dans les 9 consultés par Management mais suit le même mécanisme
# (site + date + shift + payload JSON libre). cf. cahier des charges §3 et §5.
EXTRA_REPORT_TYPES = [
    "re_entry",        # Mine captain — contrôle sécurité après minage
    "vent_service",    # Service vent & exhaur TL — vent tube/pompe/sump
    "water_control",   # Support / Dispatch control — entrées-sorties d'eau
    "blasting_hours",  # Support / Dispatch control — heure de minage
    "machine_index",   # Support / Dispatch control — index des machines
]

REPORT_TYPES = COVERAGE_REPORT_TYPES + EXTRA_REPORT_TYPES

TABLES = {
    "sites": """
        CREATE TABLE IF NOT EXISTS sites (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            code TEXT,
            location TEXT,
            active INTEGER DEFAULT 1,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "monthly_plans": """
        CREATE TABLE IF NOT EXISTS monthly_plans (
            id TEXT PRIMARY KEY,
            site_id TEXT,
            period TEXT,
            level TEXT,
            face TEXT,
            planned_meters REAL,
            created_at TEXT,
            created_by TEXT,
            UNIQUE(site_id, period, level, face)
        )
    """,
    "layouts": """
        CREATE TABLE IF NOT EXISTS layouts (
            id TEXT PRIMARY KEY,
            plan_id TEXT,
            meters REAL,
            azimuth REAL,
            layout_date TEXT,
            note TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "machines": """
        CREATE TABLE IF NOT EXISTS machines (
            id TEXT PRIMARY KEY,
            site_id TEXT,
            machine_number TEXT UNIQUE,
            machine_type TEXT,
            unit_number INTEGER,
            brand TEXT,
            status TEXT DEFAULT 'operational',
            created_at TEXT,
            created_by TEXT
        )
    """,
    "shift_reports": """
        CREATE TABLE IF NOT EXISTS shift_reports (
            id TEXT PRIMARY KEY,
            site_id TEXT,
            report_date TEXT,
            shift TEXT,
            report_type TEXT,
            payload TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "agents": """
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            id_number TEXT UNIQUE,
            full_name TEXT NOT NULL,
            job_title TEXT,
            site_id TEXT,
            active INTEGER DEFAULT 1,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "stock_entries": """
        CREATE TABLE IF NOT EXISTS stock_entries (
            id TEXT PRIMARY KEY,
            site_id TEXT,
            report_date TEXT,
            shift TEXT,
            category TEXT,
            material TEXT,
            consumption REAL,
            final_stock REAL,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
}

INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_shift_reports ON shift_reports(site_id, report_date, shift, report_type)",
    "CREATE INDEX IF NOT EXISTS idx_layouts_plan ON layouts(plan_id)",
    "CREATE INDEX IF NOT EXISTS idx_stock_entries ON stock_entries(site_id, report_date, shift, category)",
]


async def init_operations_tables():
    """À appeler depuis le lifespan de server.py."""
    async with aiosqlite.connect(DB_PATH) as db:
        for sql in TABLES.values():
            await db.execute(sql)
        for sql in INDEXES:
            await db.execute(sql)
        await db.commit()


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def rows_to_list(rows, cursor):
    cols = [d[0] for d in cursor.description]
    return [dict(zip(cols, r)) for r in rows]


# ───────────────────────────── Schemas ─────────────────────────────
class SiteCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    code: Optional[str] = None
    location: Optional[str] = None


class MonthlyPlanCreate(BaseModel):
    site_id: str
    period: str = Field(pattern=r"^\d{4}-\d{2}$")
    level: str
    face: str
    planned_meters: float = Field(gt=0)


class LayoutCreate(BaseModel):
    plan_id: str
    meters: float = Field(gt=0)
    azimuth: Optional[float] = None
    layout_date: str
    note: Optional[str] = None


class MachineCreate(BaseModel):
    site_id: Optional[str] = None
    machine_number: str
    machine_type: str
    unit_number: Optional[int] = None
    brand: Optional[str] = None
    status: str = "operational"


class ShiftReportCreate(BaseModel):
    site_id: str
    report_date: str
    shift: str
    report_type: str
    payload: dict


class AgentCreate(BaseModel):
    id_number: str = Field(min_length=1)
    full_name: str = Field(min_length=2)
    job_title: Optional[str] = None
    site_id: Optional[str] = None


class StockEntryCreate(BaseModel):
    site_id: str
    report_date: str
    shift: str
    category: str  # magasinier | explosifs
    material: str
    consumption: Optional[float] = None
    final_stock: Optional[float] = None
    notes: Optional[str] = None


# ───────────────────────────── Sites ─────────────────────────────
@router.get("/sites")
async def list_sites(current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT * FROM sites WHERE active=1 ORDER BY name") as cur:
            return rows_to_list(await cur.fetchall(), cur)


@router.post("/sites")
async def create_site(body: SiteCreate, current_user: dict = Depends(ADMIN)):
    uid = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT id FROM sites WHERE name=?", (body.name,)) as cur:
            if await cur.fetchone():
                raise HTTPException(409, "Site déjà enregistré")
        await db.execute(
            "INSERT INTO sites (id, name, code, location, active, created_at, created_by) VALUES (?,?,?,?,1,?,?)",
            (uid, body.name, body.code, body.location, now(), current_user.get("email")),
        )
        await db.commit()
    return {"id": uid, **body.model_dump()}


@router.delete("/sites/{site_id}")
async def deactivate_site(site_id: str, current_user: dict = Depends(ADMIN)):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE sites SET active=0 WHERE id=?", (site_id,))
        await db.commit()
    return {"message": "Site désactivé"}


# ───────────────────────── Plans mensuels ─────────────────────────
@router.get("/monthly-plans")
async def list_plans(
    site_id: str = Query(...),
    period: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$"),
    current_user: dict = Depends(get_current_user),
):
    sql = """
        SELECT p.*, COALESCE(SUM(l.meters), 0) AS done_meters, COUNT(l.id) AS layout_count
        FROM monthly_plans p LEFT JOIN layouts l ON l.plan_id = p.id
        WHERE p.site_id = ?
    """
    args: List = [site_id]
    if period:
        sql += " AND p.period = ?"
        args.append(period)
    sql += " GROUP BY p.id ORDER BY p.level, p.face"

    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(sql, args) as cur:
            plans = rows_to_list(await cur.fetchall(), cur)

    for p in plans:
        planned = p.get("planned_meters") or 0
        p["progress_pct"] = round(p["done_meters"] / planned * 100, 1) if planned else 0
    return plans


@router.post("/monthly-plans")
async def create_plan(body: MonthlyPlanCreate, current_user: dict = Depends(ADMIN)):
    uid = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        try:
            await db.execute(
                """INSERT INTO monthly_plans
                   (id, site_id, period, level, face, planned_meters, created_at, created_by)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (uid, body.site_id, body.period, body.level, body.face,
                 body.planned_meters, now(), current_user.get("email")),
            )
            await db.commit()
        except aiosqlite.IntegrityError:
            raise HTTPException(409, "Plan déjà défini pour ce front ce mois")
    return {"id": uid, **body.model_dump()}


# ───────────────────────────── Layouts ─────────────────────────────
@router.get("/layouts")
async def list_layouts(plan_id: str = Query(...), current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT * FROM layouts WHERE plan_id=? ORDER BY layout_date, rowid", (plan_id,)
        ) as cur:
            return rows_to_list(await cur.fetchall(), cur)


@router.post("/layouts")
async def create_layout(
    body: LayoutCreate,
    current_user: dict = Depends(require_role("admin", "supervisor", "support")),
):
    uid = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT planned_meters FROM monthly_plans WHERE id=?", (body.plan_id,)
        ) as cur:
            plan = await cur.fetchone()
        if not plan:
            raise HTTPException(404, "Plan introuvable")

        async with db.execute(
            "SELECT COALESCE(SUM(meters),0) FROM layouts WHERE plan_id=?", (body.plan_id,)
        ) as cur:
            done = (await cur.fetchone())[0]

        await db.execute(
            """INSERT INTO layouts (id, plan_id, meters, azimuth, layout_date, note, created_at, created_by)
               VALUES (?,?,?,?,?,?,?,?)""",
            (uid, body.plan_id, body.meters, body.azimuth, body.layout_date,
             body.note, now(), current_user.get("email")),
        )
        await db.commit()

    total = done + body.meters
    return {
        "id": uid,
        "done_meters": round(total, 2),
        "planned_meters": plan[0],
        "over_plan": total > plan[0],
    }


# ───────────────────────────── Machines ────────────────────────────
@router.get("/machines")
async def list_machines(site_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    sql = "SELECT * FROM machines"
    args: List = []
    if site_id:
        sql += " WHERE site_id=?"
        args.append(site_id)
    sql += " ORDER BY machine_type, unit_number, machine_number"
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(sql, args) as cur:
            return rows_to_list(await cur.fetchall(), cur)


@router.post("/machines")
async def create_machine(body: MachineCreate, current_user: dict = Depends(ADMIN)):
    if body.status not in ("operational", "breakdown", "maintenance"):
        raise HTTPException(422, "Statut invalide")
    uid = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        try:
            await db.execute(
                """INSERT INTO machines
                   (id, site_id, machine_number, machine_type, unit_number, brand, status, created_at, created_by)
                   VALUES (?,?,?,?,?,?,?,?,?)""",
                (uid, body.site_id, body.machine_number, body.machine_type, body.unit_number,
                 body.brand, body.status, now(), current_user.get("email")),
            )
            await db.commit()
        except aiosqlite.IntegrityError:
            raise HTTPException(409, "Numéro de machine déjà utilisé")
    return {"id": uid, **body.model_dump()}


# ───────────────────────────── Agents ──────────────────────────────
@router.get("/agents")
async def list_agents(site_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    sql = "SELECT * FROM agents WHERE active=1"
    args: List = []
    if site_id:
        sql += " AND site_id=?"
        args.append(site_id)
    sql += " ORDER BY full_name"
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(sql, args) as cur:
            return rows_to_list(await cur.fetchall(), cur)


@router.post("/agents")
async def create_agent(body: AgentCreate, current_user: dict = Depends(ADMIN)):
    uid = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        try:
            await db.execute(
                """INSERT INTO agents (id, id_number, full_name, job_title, site_id, active, created_at, created_by)
                   VALUES (?,?,?,?,?,1,?,?)""",
                (uid, body.id_number, body.full_name, body.job_title, body.site_id,
                 now(), current_user.get("email")),
            )
            await db.commit()
        except aiosqlite.IntegrityError:
            raise HTTPException(409, "Id number déjà utilisé")
    return {"id": uid, **body.model_dump()}


@router.delete("/agents/{agent_id}")
async def deactivate_agent(agent_id: str, current_user: dict = Depends(ADMIN)):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE agents SET active=0 WHERE id=?", (agent_id,))
        await db.commit()
    return {"message": "Agent désactivé"}


# ────────────────────────── Stocks (Logistique) ─────────────────────
@router.get("/stock-entries")
async def list_stock_entries(
    site_id: Optional[str] = None,
    report_date: Optional[str] = None,
    shift: Optional[str] = Query(None, pattern="^(day|night)$"),
    category: Optional[str] = Query(None, pattern="^(magasinier|explosifs)$"),
    current_user: dict = Depends(get_current_user),
):
    sql = "SELECT * FROM stock_entries WHERE 1=1"
    args: List = []
    for col, val in (("site_id", site_id), ("report_date", report_date),
                     ("shift", shift), ("category", category)):
        if val:
            sql += f" AND {col}=?"
            args.append(val)
    sql += " ORDER BY report_date DESC, rowid DESC"
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(sql, args) as cur:
            return rows_to_list(await cur.fetchall(), cur)


@router.post("/stock-entries")
async def create_stock_entry(
    body: StockEntryCreate,
    current_user: dict = Depends(require_role("logistique", "admin")),
):
    if body.category not in ("magasinier", "explosifs"):
        raise HTTPException(422, "Catégorie invalide")
    if body.shift not in ("day", "night"):
        raise HTTPException(422, "Shift invalide")
    uid = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO stock_entries
               (id, site_id, report_date, shift, category, material, consumption, final_stock, notes, created_at, created_by)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (uid, body.site_id, body.report_date, body.shift, body.category, body.material,
             body.consumption, body.final_stock, body.notes, now(), current_user.get("email")),
        )
        await db.commit()
    return {"id": uid, **body.model_dump()}


# ────────────────────── Rapports de shift ──────────────────────────
# Route distincte de /api/reports/summary déjà défini dans server.py
@router.get("/shift-reports")
async def list_shift_reports(
    site_id: Optional[str] = None,
    report_date: Optional[str] = None,
    shift: Optional[str] = Query(None, pattern="^(day|night)$"),
    report_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    if report_type and report_type not in REPORT_TYPES:
        raise HTTPException(422, "Type de rapport inconnu")

    sql = """SELECT r.*, s.name AS site_name FROM shift_reports r
             LEFT JOIN sites s ON s.id = r.site_id WHERE 1=1"""
    args: List = []
    for col, val in (("r.site_id", site_id), ("r.report_date", report_date),
                     ("r.shift", shift), ("r.report_type", report_type)):
        if val:
            sql += f" AND {col}=?"
            args.append(val)
    sql += " ORDER BY r.report_date DESC, r.shift, r.report_type"

    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(sql, args) as cur:
            return rows_to_list(await cur.fetchall(), cur)


@router.post("/shift-reports")
async def create_shift_report(
    body: ShiftReportCreate,
    current_user: dict = Depends(require_role("supervisor", "support", "admin")),
):
    if body.report_type not in REPORT_TYPES:
        raise HTTPException(422, "Type de rapport inconnu")
    if body.shift not in ("day", "night"):
        raise HTTPException(422, "Shift invalide")

    uid = str(uuid.uuid4())
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO shift_reports
               (id, site_id, report_date, shift, report_type, payload, created_at, created_by)
               VALUES (?,?,?,?,?,?,?,?)""",
            (uid, body.site_id, body.report_date, body.shift, body.report_type,
             json.dumps(body.payload, ensure_ascii=False), now(), current_user.get("email")),
        )
        await db.commit()
    return {"id": uid, **body.model_dump()}


@router.get("/shift-reports/coverage")
async def shift_reports_coverage(
    report_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """Couverture des 9 rapports par site et par shift — vue 'Tous les rapports'."""
    day = report_date or date.today().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            """SELECT s.id, s.name, r.shift, r.report_type
               FROM sites s LEFT JOIN shift_reports r
                 ON r.site_id = s.id AND r.report_date = ?
               WHERE s.active = 1 ORDER BY s.name""",
            (day,),
        ) as cur:
            rows = await cur.fetchall()

    summary = {}
    for site_id, site_name, shift, rtype in rows:
        entry = summary.setdefault(site_id, {
            "site_id": site_id, "site_name": site_name, "date": day, "day": [], "night": [],
        })
        if shift in ("day", "night") and rtype:
            entry[shift].append(rtype)

    for entry in summary.values():
        for sh in ("day", "night"):
            entry[f"{sh}_missing"] = [t for t in COVERAGE_REPORT_TYPES if t not in entry[sh]]
    return list(summary.values())
