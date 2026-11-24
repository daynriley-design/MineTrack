"""
⚠️ NON UTILISÉ EN PRODUCTION — WIP incomplet, ne PAS lancer.
L'entrypoint réel est backend/server.py (utilisé par START_MINETRACK.bat).

Ce fichier est une tentative de refactor modulaire (routers/auth.py,
routers/dashboard.py) commencée le 13/07 puis abandonnée en faveur de
la poursuite du développement direct dans server.py le 14/07.
Il ne couvre que /auth et /dashboard/stats : tous les autres modules
(pegs, stocks, pannes, mini-reports, HSE, etc.) sont ABSENTS ici.

Si vous reprenez ce refactor : terminez le portage complet de
MODULES_CONFIG (server.py) vers generic_router.py avant de faire de
main.py le vrai entrypoint (renommer en server.py / mettre à jour
START_MINETRACK.bat).
"""
import os
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Dict, Any
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from db import init_connection, close_connection, get_connection, TABLES
from generic_router import build_router
from routers.auth import router as auth_router, seed_demo_users
from routers.dashboard import router as dashboard_router
from auth_utils import get_current_user
from models import (
    PegCreate, PegUpdate, WorkProgressCreate, DrillingCreate, BlastingCreate,
    ProductionCreate, EquipmentCreate, LaborCreate, HSECreate, GeologyCreate,
    SupportCreate, FinancialCreate, PegAdvanceCreate, IncidentCreate,
    HSEChecklistCreate, EquipmentPanneCreate, MiniReportCreate,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # PERF: une seule connexion process-wide, ouverte une fois au démarrage.
    await init_connection()
    await seed_demo_users()
    yield
    await close_connection()


app = FastAPI(title="Minetrack API", version="3.0.0", lifespan=lifespan)

_allowed_origins = os.environ.get(
    "CORS_ORIGINS", "http://localhost:4000,http://127.0.0.1:4000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dashboard_router)

# Un seul endroit pour ajouter/retirer un module métier.
MODULES_CONFIG = [
    ("pegs", "pegs", PegCreate, PegUpdate,
     ["peg_id", "zone", "coordinates", "status", "date_installed", "notes"]),
    ("work-progress", "work_progress", WorkProgressCreate, None,
     ["peg_id", "activity", "team", "progress_percent", "status", "start_date", "end_date", "notes"]),
    ("drilling", "drilling", DrillingCreate, None,
     ["peg_id", "hole_id", "depth_m", "diameter_mm", "rock_type", "status", "date", "operator", "notes"]),
    ("blasting", "blasting", BlastingCreate, None,
     ["peg_id", "blast_id", "explosives_kg", "holes_count", "date", "status", "result", "notes"]),
    ("production", "production", ProductionCreate, None,
     ["peg_id", "date", "material_type", "volume_m3", "tonnage", "equipment_id", "shift", "notes"]),
    ("equipment", "equipment", EquipmentCreate, None,
     ["equipment_id", "name", "type", "status", "hours_used", "next_service_date", "location", "notes"]),
    ("labor", "labor", LaborCreate, None,
     ["employee_id", "name", "role", "team", "shift", "hours_worked", "date", "peg_id",
      "origin_status", "contract_type", "notes"]),
    ("hse", "hse", HSECreate, None,
     ["incident_id", "type", "severity", "description", "location", "date", "reported_by",
      "status", "corrective_action"]),
    ("geology", "geology", GeologyCreate, None,
     ["sample_id", "peg_id", "depth_from", "depth_to", "rock_type", "grade_au_gt",
      "grade_cu_pct", "grade_co_pct", "grade_coltan_gt", "date", "geologist", "notes"]),
    ("support", "support", SupportCreate, None,
     ["ticket_id", "category", "priority", "description", "requested_by", "assigned_to",
      "status", "date_created", "date_resolved"]),
    ("financial", "financial", FinancialCreate, None,
     ["record_id", "date", "category", "currency", "description", "amount", "amount_usd",
      "peg_id", "approved_by", "notes"]),
    ("peg-advances", "peg_advances", PegAdvanceCreate, None,
     ["peg_id", "shift", "date", "drilled_meters", "blasted_holes", "mucked_tonnage", "notes"]),
    ("incidents", "incidents", IncidentCreate, None,
     ["title", "description", "severity", "location", "date", "reported_by"]),
    ("hse-checklists", "hse_checklists", HSEChecklistCreate, None,
     ["peg_id", "shift", "date", "face_safe", "ventilation_ok", "gas_checked",
      "water_sprayed", "supports_ok", "notes"]),
    ("equipment-pannes", "equipment_pannes", EquipmentPanneCreate, None,
     ["equipment_id", "issue_type", "description", "reported_date", "reported_by", "status"]),
    ("mini-reports", "mini_reports", MiniReportCreate, None,
     ["shift", "date", "peg_id", "weather_conditions", "safety_summary", "production_summary",
      "issues_encountered", "submitted_by"]),
]

for route_name, table, create_model, update_model, fields in MODULES_CONFIG:
    app.include_router(build_router(route_name, table, create_model, update_model, fields))


@app.get("/api/reports/summary")
async def reports_summary(current_user: dict = Depends(get_current_user)):
    db = get_connection()
    async with db.execute("""
        SELECT
            (SELECT COUNT(*) FROM pegs) AS pegs_total,
            (SELECT COALESCE(SUM(tonnage),0) FROM production) AS total_tonnage,
            (SELECT COALESCE(SUM(volume_m3),0) FROM production) AS total_volume,
            (SELECT COUNT(*) FROM hse) AS total_incidents,
            (SELECT COALESCE(SUM(amount_usd),0) FROM financial) AS total_expenditure
    """) as c:
        pegs_total, tonnage, volume, incidents, expenditure = await c.fetchone()

    async def group(table, col):
        async with db.execute(f"SELECT {col}, COUNT(*) FROM {table} GROUP BY {col}") as c:
            return {r[0]: r[1] for r in await c.fetchall()}

    async def sum_group(table, group_col, val_col):
        async with db.execute(f"SELECT {group_col}, SUM({val_col}) FROM {table} GROUP BY {group_col}") as c:
            return {r[0]: round(r[1] or 0, 2) for r in await c.fetchall()}

    return {
        "pegs_summary": {"total": pegs_total, "by_status": await group("pegs", "status"),
                          "by_zone": await group("pegs", "zone")},
        "production_summary": {"total_tonnage": round(tonnage, 2), "total_volume_m3": round(volume, 2),
                                "by_material": await sum_group("production", "material_type", "tonnage")},
        "safety_summary": {"total_incidents": incidents, "by_type": await group("hse", "type"),
                            "by_severity": await group("hse", "severity")},
        "financial_summary": {"total_expenditure": round(expenditure, 2),
                               "by_category": await sum_group("financial", "category", "amount_usd")},
    }


@app.get("/api/supervisor/alerts")
async def supervisor_alerts(current_user: dict = Depends(get_current_user)):
    db = get_connection()
    async with db.execute(
        "SELECT * FROM incidents WHERE severity IN ('high','critical') ORDER BY created_at DESC LIMIT 20"
    ) as cur:
        cols = [d[0] for d in cur.description]
        incidents = [dict(zip(cols, r)) for r in await cur.fetchall()]
    async with db.execute(
        "SELECT * FROM equipment_pannes WHERE status='open' ORDER BY created_at DESC LIMIT 20"
    ) as cur:
        cols = [d[0] for d in cur.description]
        pannes = [dict(zip(cols, r)) for r in await cur.fetchall()]
    return {"incidents": incidents, "pannes": pannes}


class SyncPayload(BaseModel):
    collection: str
    data: List[Dict[str, Any]]


@app.post("/api/sync")
async def sync_data(payloads: List[SyncPayload], current_user: dict = Depends(get_current_user)):
    """Sync offline. SÉCURITÉ: table ET colonnes whitelistées contre schema réel —
    corrige la faille où /api/sync acceptait n'importe quelle clé de dict comme colonne SQL."""
    now = datetime.now(timezone.utc).isoformat()
    db = get_connection()
    for p in payloads:
        table = p.collection
        if table not in TABLES:
            continue
        async with db.execute(f"PRAGMA table_info({table})") as cur:
            valid_cols = {r[1] for r in await cur.fetchall()}
        for item in p.data:
            item_id = item.pop("_id", None) or str(uuid.uuid4())
            clean = {k: v for k, v in item.items() if k in valid_cols}
            clean["id"] = item_id
            clean.setdefault("created_at", now)
            clean.setdefault("created_by", current_user.get("email"))

            async with db.execute(f"SELECT id FROM {table} WHERE id=?", (item_id,)) as cur:
                exists = await cur.fetchone()

            cols, vals = list(clean.keys()), list(clean.values())
            if exists:
                set_clause = ", ".join(f"{c}=?" for c in cols if c != "id")
                update_vals = [v for k, v in clean.items() if k != "id"]
                if set_clause:
                    await db.execute(f"UPDATE {table} SET {set_clause} WHERE id=?", (*update_vals, item_id))
            else:
                placeholders = ", ".join("?" for _ in cols)
                await db.execute(f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({placeholders})", vals)
    await db.commit()
    return {"message": "Sync successful"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
