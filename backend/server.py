"""
Minetrack - Backend API Server (SQLite version)
FastAPI + aiosqlite (no MongoDB required)
"""
import json
import os
import uuid
import aiosqlite
from datetime import datetime, timezone
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import (
    UserCreate, UserLogin,
    PegCreate, PegUpdate,
    WorkProgressCreate, DrillingCreate, BlastingCreate,
    ProductionCreate, EquipmentCreate, LaborCreate,
    HSECreate, GeologyCreate, SupportCreate, FinancialCreate,
    PegAdvanceCreate, IncidentCreate, HSEChecklistCreate,
    EquipmentPanneCreate, MiniReportCreate,
    PtoCreate, FaceExaminationCreate, GroundSupportCreate
)
from routers import operations
from auth_utils import (
    hash_password, verify_password,
    create_access_token, get_current_user, require_role
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Chemin de la base : backend/minetrack.db en local ; sur un hebergeur sans
# disque inscriptible (Vercel), MINETRACK_DB_PATH=/tmp/minetrack.db.
DB_PATH = Path(os.environ.get("MINETRACK_DB_PATH") or ROOT_DIR / "minetrack.db")

# ─── Tables DDL ──────────────────────────────────────────────────────────────
TABLES = {
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
            id TEXT PRIMARY KEY,
            peg_id TEXT,
            zone TEXT,
            coordinates TEXT,
            status TEXT DEFAULT 'active',
            date_installed TEXT,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "work_progress": """
        CREATE TABLE IF NOT EXISTS work_progress (
            id TEXT PRIMARY KEY,
            peg_id TEXT,
            activity TEXT,
            team TEXT,
            progress_percent REAL DEFAULT 0,
            status TEXT DEFAULT 'in_progress',
            start_date TEXT,
            end_date TEXT,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "drilling": """
        CREATE TABLE IF NOT EXISTS drilling (
            id TEXT PRIMARY KEY,
            peg_id TEXT,
            hole_id TEXT,
            depth_m REAL,
            diameter_mm REAL,
            rock_type TEXT,
            status TEXT DEFAULT 'planned',
            date TEXT,
            operator TEXT,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "blasting": """
        CREATE TABLE IF NOT EXISTS blasting (
            id TEXT PRIMARY KEY,
            peg_id TEXT,
            blast_id TEXT,
            explosives_kg REAL,
            holes_count INTEGER,
            date TEXT,
            status TEXT DEFAULT 'planned',
            result TEXT,
            advance_after_blast_m REAL,
            reentry_minutes INTEGER,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "production": """
        CREATE TABLE IF NOT EXISTS production (
            id TEXT PRIMARY KEY,
            peg_id TEXT,
            date TEXT,
            material_type TEXT,
            volume_m3 REAL,
            tonnage REAL,
            equipment_id TEXT,
            shift TEXT DEFAULT 'day',
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "equipment": """
        CREATE TABLE IF NOT EXISTS equipment (
            id TEXT PRIMARY KEY,
            equipment_id TEXT,
            name TEXT,
            type TEXT,
            status TEXT DEFAULT 'operational',
            hours_used REAL DEFAULT 0,
            next_service_date TEXT,
            location TEXT,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "labor": """
        CREATE TABLE IF NOT EXISTS labor (
            id TEXT PRIMARY KEY,
            employee_id TEXT,
            name TEXT,
            role TEXT,
            team TEXT,
            shift TEXT DEFAULT 'day',
            hours_worked REAL DEFAULT 0,
            date TEXT,
            peg_id TEXT,
            origin_status TEXT DEFAULT 'national',
            contract_type TEXT DEFAULT 'direct',
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "hse": """
        CREATE TABLE IF NOT EXISTS hse (
            id TEXT PRIMARY KEY,
            incident_id TEXT,
            type TEXT,
            severity TEXT DEFAULT 'low',
            description TEXT,
            location TEXT,
            date TEXT,
            reported_by TEXT,
            status TEXT DEFAULT 'open',
            corrective_action TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "geology": """
        CREATE TABLE IF NOT EXISTS geology (
            id TEXT PRIMARY KEY,
            sample_id TEXT,
            peg_id TEXT,
            depth_from REAL,
            depth_to REAL,
            rock_type TEXT,
            grade_au_gt REAL,
            grade_cu_pct REAL,
            grade_co_pct REAL,
            grade_coltan_gt REAL,
            date TEXT,
            geologist TEXT,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "support": """
        CREATE TABLE IF NOT EXISTS support (
            id TEXT PRIMARY KEY,
            ticket_id TEXT,
            category TEXT,
            priority TEXT DEFAULT 'medium',
            description TEXT,
            requested_by TEXT,
            assigned_to TEXT,
            status TEXT DEFAULT 'open',
            date_created TEXT,
            date_resolved TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "pto": """
        CREATE TABLE IF NOT EXISTS pto (
            id TEXT PRIMARY KEY,
            employee_id TEXT,
            employee_name TEXT,
            date TEXT,
            leave_type TEXT DEFAULT 'conge',
            days REAL DEFAULT 1,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "face_examinations": """
        CREATE TABLE IF NOT EXISTS face_examinations (
            id TEXT PRIMARY KEY,
            peg_id TEXT,
            date TEXT,
            examiner TEXT,
            ground_condition TEXT DEFAULT 'safe',
            hazards_observed TEXT,
            ventilation_ok INTEGER DEFAULT 1,
            gas_readings TEXT,
            action_required TEXT,
            status TEXT DEFAULT 'cleared',
            photo TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "ground_support": """
        CREATE TABLE IF NOT EXISTS ground_support (
            id TEXT PRIMARY KEY,
            peg_id TEXT,
            support_type TEXT,
            quantity REAL,
            date_installed TEXT,
            state TEXT DEFAULT 'good',
            shotcrete_m3 REAL,
            concrete_m3 REAL,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "financial": """
        CREATE TABLE IF NOT EXISTS financial (
            id TEXT PRIMARY KEY,
            record_id TEXT,
            date TEXT,
            category TEXT,
            currency TEXT DEFAULT 'USD',
            description TEXT,
            amount REAL,
            amount_usd REAL,
            peg_id TEXT,
            approved_by TEXT,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "peg_advances": """
        CREATE TABLE IF NOT EXISTS peg_advances (
            id TEXT PRIMARY KEY,
            peg_id TEXT,
            shift TEXT,
            date TEXT,
            drilled_meters REAL DEFAULT 0,
            blasted_holes INTEGER DEFAULT 0,
            mucked_tonnage REAL DEFAULT 0,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "incidents": """
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            severity TEXT DEFAULT 'low',
            location TEXT,
            date TEXT,
            reported_by TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "hse_checklists": """
        CREATE TABLE IF NOT EXISTS hse_checklists (
            id TEXT PRIMARY KEY,
            peg_id TEXT,
            shift TEXT,
            date TEXT,
            face_safe BOOLEAN DEFAULT 0,
            ventilation_ok BOOLEAN DEFAULT 0,
            gas_checked BOOLEAN DEFAULT 0,
            water_sprayed BOOLEAN DEFAULT 0,
            supports_ok BOOLEAN DEFAULT 0,
            notes TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "equipment_pannes": """
        CREATE TABLE IF NOT EXISTS equipment_pannes (
            id TEXT PRIMARY KEY,
            equipment_id TEXT,
            issue_type TEXT,
            description TEXT,
            reported_date TEXT,
            reported_by TEXT,
            status TEXT DEFAULT 'open',
            photo TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
    "mini_reports": """
        CREATE TABLE IF NOT EXISTS mini_reports (
            id TEXT PRIMARY KEY,
            shift TEXT,
            date TEXT,
            peg_id TEXT,
            weather_conditions TEXT DEFAULT 'normal',
            safety_summary TEXT,
            production_summary TEXT,
            issues_encountered TEXT,
            submitted_by TEXT,
            created_at TEXT,
            created_by TEXT
        )
    """,
}


async def get_db():
    return await aiosqlite.connect(DB_PATH)


def row_to_dict(row, cursor):
    if row is None:
        return None
    cols = [d[0] for d in cursor.description]
    d = dict(zip(cols, row))
    # Rename 'id' -> '_id' for frontend compatibility
    if 'id' in d:
        d['_id'] = d.pop('id')
    # Parse JSON fields
    if 'coordinates' in d and d['coordinates']:
        try:
            d['coordinates'] = json.loads(d['coordinates'])
        except Exception:
            pass
    return d


def rows_to_list(rows, cursor):
    cols = [d[0] for d in cursor.description]
    result = []
    for row in rows:
        d = dict(zip(cols, row))
        if 'id' in d:
            d['_id'] = d.pop('id')
        if 'coordinates' in d and d['coordinates']:
            try:
                d['coordinates'] = json.loads(d['coordinates'])
            except Exception:
                pass
        result.append(d)
    return result


# ─── Initialisation de la base ────────────────────────────────────────────────
_db_ready = False


async def ensure_db():
    """Cree les tables (idempotent), une fois par processus.

    Appelee au demarrage ET au premier appel d'API : sur Vercel, le lifespan
    n'est pas garanti et /tmp repart vide a chaque nouvelle instance.
    Avec MINETRACK_DEMO_ACCOUNTS=1, les comptes de demo sont aussi crees.
    """
    global _db_ready
    if _db_ready:
        return
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        for sql in TABLES.values():
            await db.execute(sql)
        await db.commit()
    await operations.init_operations_tables()
    if os.environ.get("MINETRACK_DEMO_ACCOUNTS") == "1":
        from create_accounts import ensure_accounts
        ensure_accounts(DB_PATH, verbose=False)
    _db_ready = True


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_db()
    yield


app = FastAPI(title="Minetrack API", version="2.0.0", lifespan=lifespan)


@app.middleware("http")
async def _init_db_middleware(request: Request, call_next):
    await ensure_db()
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4000", "http://127.0.0.1:4000",  # port réel du frontend (vite.config.js)
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5173", "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(operations.router)


# ─── Auth ─────────────────────────────────────────────────────────────────────
# Rôles auto-inscriptibles publiquement. 'admin' exclu volontairement :
# un compte admin ne doit jamais être créé via le formulaire public.
SELF_REGISTER_ROLES = {"operator", "geologist", "supervisor"}


@app.post("/api/auth/register")
async def register(user_input: UserCreate, response: Response):
    email = user_input.email.lower()
    safe_role = user_input.role if user_input.role in SELF_REGISTER_ROLES else "operator"
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT id FROM users WHERE email=?", (email,)) as cur:
            if await cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
        uid = str(uuid.uuid4())
        await db.execute(
            "INSERT INTO users (id, email, password, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (uid, email, hash_password(user_input.password), user_input.name,
             safe_role, datetime.now(timezone.utc).isoformat())
        )
        await db.commit()
    token = create_access_token({"sub": uid, "email": email, "role": safe_role, "name": user_input.name})
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=86400)
    return {"message": "Registered", "email": email, "role": safe_role, "name": user_input.name}


@app.post("/api/auth/login")
async def login(user_input: UserLogin, response: Response):
    email = user_input.email.lower()
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM users WHERE email=?", (email,)) as cur:
            users = await cur.fetchall()
    
    valid_user = None
    for u in users:
        if verify_password(user_input.password, u["password"]):
            valid_user = u
            break

    if not valid_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": valid_user["id"], "email": email, "role": valid_user["role"], "name": valid_user["name"]})
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=86400)
    return {"message": "Login successful", "email": email, "role": valid_user["role"], "name": valid_user["name"]}


@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@app.get("/api/supervisor/users")
async def list_users(current_user: dict = Depends(require_role("supervisor", "admin"))):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC") as cur:
            rows = await cur.fetchall()
            return [{"id": r["id"], "email": r["email"], "name": r["name"], "role": r["role"], "created_at": r["created_at"]} for r in rows]


@app.delete("/api/supervisor/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_role("supervisor", "admin"))):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM users WHERE id=?", (user_id,))
        await db.commit()
    return {"message": "User deleted"}


# ─── Dashboard ────────────────────────────────────────────────────────────────
@app.get("/api/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        async def count(table, where="1=1"):
            async with db.execute(f"SELECT COUNT(*) FROM {table} WHERE {where}") as c:
                return (await c.fetchone())[0]

        async def scalar(sql):
            async with db.execute(sql) as c:
                r = await c.fetchone()
                return r[0] or 0 if r else 0

        avg_progress = await scalar("SELECT AVG(progress_percent) FROM work_progress WHERE status != 'completed'")

        async with db.execute(
            "SELECT team, AVG(progress_percent) as perf FROM work_progress WHERE team IS NOT NULL AND team != '' GROUP BY team ORDER BY perf DESC LIMIT 5"
        ) as c:
            team_performance = [{"team": r[0], "avg_progress": round(r[1] or 0, 1)} for r in await c.fetchall()]

        return {
            "pegs": {
                "total": await count("pegs"),
                "active": await count("pegs", "status='active'"),
                "completed": await count("pegs", "status='completed'"),
                "avg_progress": round(avg_progress, 1),
            },
            "safety": {
                "open_incidents": await count("hse", "status='open'"),
                "critical": await count("hse", "severity='critical'"),
            },
            "equipment": {
                "operational": await count("equipment", "status='operational'"),
                "maintenance": await count("equipment", "status='maintenance'"),
                "breakdown": await count("equipment", "status='breakdown'"),
            },
            "production": {
                "total_tonnage": round(await scalar("SELECT SUM(tonnage) FROM production"), 2),
            },
            "labor": {
                "total": await count("labor"),
                "national": await count("labor", "origin_status='national'"),
                "expat": await count("labor", "origin_status='expat'"),
            },
            "financial": {
                "total_cost_usd": round(await scalar("SELECT SUM(amount_usd) FROM financial"), 2),
            },
            "team_performance": team_performance,
        }


@app.get("/api/dashboard/charts")
async def dashboard_charts(current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT date, SUM(tonnage) as tonnage FROM production GROUP BY date ORDER BY date DESC LIMIT 14") as c:
            prod = [{"date": r[0], "tonnage": r[1]} for r in await c.fetchall()]

        async with db.execute("SELECT type, COUNT(*) FROM hse GROUP BY type") as c:
            hse_by_type = {r[0]: r[1] for r in await c.fetchall()}

        async with db.execute("SELECT status, COUNT(*) FROM equipment GROUP BY status") as c:
            equip_status = {r[0]: r[1] for r in await c.fetchall()}

        # Avancement par PEG (dernière valeur connue par peg)
        async with db.execute(
            "SELECT peg_id, AVG(progress_percent) as pct FROM work_progress WHERE peg_id IS NOT NULL AND peg_id != '' GROUP BY peg_id ORDER BY peg_id LIMIT 20"
        ) as c:
            peg_progress = [{"peg_id": r[0], "progress": round(r[1] or 0, 1)} for r in await c.fetchall()]

        # Incidents par jour (14 derniers jours avec données)
        async with db.execute(
            "SELECT date, COUNT(*) as n FROM incidents WHERE date IS NOT NULL AND date != '' GROUP BY date ORDER BY date DESC LIMIT 14"
        ) as c:
            incidents_by_day = [{"date": r[0], "count": r[1]} for r in await c.fetchall()]

        # PTO (congés) par jour
        async with db.execute(
            "SELECT date, SUM(days) as total_days FROM pto WHERE date IS NOT NULL AND date != '' GROUP BY date ORDER BY date DESC LIMIT 14"
        ) as c:
            pto_by_day = [{"date": r[0], "days": r[1] or 0} for r in await c.fetchall()]

    return {
        "production_trend": list(reversed(prod)),
        "hse_by_type": hse_by_type,
        "equipment_status": equip_status,
        "peg_progress": peg_progress,
        "incidents_by_day": list(reversed(incidents_by_day)),
        "pto_by_day": list(reversed(pto_by_day)),
    }


# ─── Pegs ─────────────────────────────────────────────────────────────────────
@app.get("/api/pegs")
async def list_pegs(current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT * FROM pegs ORDER BY rowid DESC LIMIT 200") as cur:
            rows = await cur.fetchall()
            return rows_to_list(rows, cur)


@app.post("/api/pegs")
async def create_peg(body: PegCreate, current_user: dict = Depends(get_current_user)):
    uid = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    coords = json.dumps(body.coordinates) if body.coordinates else None
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO pegs VALUES (?,?,?,?,?,?,?,?,?)",
            (uid, body.peg_id, body.zone, coords, body.status,
             body.date_installed, body.notes, now, current_user.get("email"))
        )
        await db.commit()
    return {"_id": uid, **body.model_dump(), "created_at": now}


@app.get("/api/pegs/{item_id}")
async def get_peg(item_id: str, current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT * FROM pegs WHERE id=?", (item_id,)) as cur:
            row = await cur.fetchone()
            if not row:
                raise HTTPException(status_code=404)
            return row_to_dict(row, cur)


@app.put("/api/pegs/{item_id}")
async def update_peg(item_id: str, body: PegUpdate, current_user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        return {"message": "Nothing to update"}
    set_clause = ", ".join(f"{k}=?" for k in updates)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(f"UPDATE pegs SET {set_clause} WHERE id=?", (*updates.values(), item_id))
        await db.commit()
    return {"message": "Updated"}


@app.delete("/api/pegs/{item_id}")
async def delete_peg(item_id: str, current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM pegs WHERE id=?", (item_id,))
        await db.commit()
    return {"message": "Deleted"}


# ─── Generic CRUD factory ─────────────────────────────────────────────────────
def make_generic_routes(route_name: str, table: str, ModelClass, fields: list):
    """Adds GET list, POST create, GET one, DELETE one for a table."""

    @app.get(f"/api/{route_name}")
    async def list_items(current_user: dict = Depends(get_current_user)):
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute(f"SELECT * FROM {table} ORDER BY rowid DESC LIMIT 200") as cur:
                rows = await cur.fetchall()
                return rows_to_list(rows, cur)

    @app.post(f"/api/{route_name}")
    async def create_item(body: ModelClass, current_user: dict = Depends(get_current_user)):
        uid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        data = body.model_dump()
        values = [uid] + [data.get(f) for f in fields] + [now, current_user.get("email")]
        placeholders = ",".join("?" for _ in range(len(values)))
        cols = "id," + ",".join(fields) + ",created_at,created_by"
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})", values)
            await db.commit()
        return {"id": uid, **data, "created_at": now}

    @app.get(f"/api/{route_name}/{{item_id}}")
    async def get_item(item_id: str, current_user: dict = Depends(get_current_user)):
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute(f"SELECT * FROM {table} WHERE id=?", (item_id,)) as cur:
                row = await cur.fetchone()
                if not row:
                    raise HTTPException(status_code=404)
                return row_to_dict(row, cur)

    @app.delete(f"/api/{route_name}/{{item_id}}")
    async def delete_item(item_id: str, current_user: dict = Depends(get_current_user)):
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(f"DELETE FROM {table} WHERE id=?", (item_id,))
            await db.commit()
        return {"message": "Deleted"}

    @app.put(f"/api/{route_name}/{{item_id}}")
    async def update_item(item_id: str, body: dict, current_user: dict = Depends(get_current_user)):
        updates = {k: v for k, v in body.items() if k in fields}
        if not updates:
            return {"message": "Nothing to update"}
        set_clause = ", ".join(f"{k}=?" for k in updates)
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(f"UPDATE {table} SET {set_clause} WHERE id=?", (*updates.values(), item_id))
            await db.commit()
        return {"message": "Updated"}


MODULES_CONFIG = [
    ("work-progress", "work_progress", WorkProgressCreate,
     ["peg_id", "activity", "team", "progress_percent", "status", "start_date", "end_date", "notes"]),
    ("drilling", "drilling", DrillingCreate,
     ["peg_id", "hole_id", "depth_m", "diameter_mm", "rock_type", "status", "date", "operator", "notes"]),
    ("blasting", "blasting", BlastingCreate,
     ["peg_id", "blast_id", "explosives_kg", "holes_count", "date", "status", "result", "advance_after_blast_m", "reentry_minutes", "notes"]),
    ("production", "production", ProductionCreate,
     ["peg_id", "date", "material_type", "volume_m3", "tonnage", "equipment_id", "shift", "notes"]),
    ("equipment", "equipment", EquipmentCreate,
     ["equipment_id", "name", "type", "status", "hours_used", "next_service_date", "location", "notes"]),
    ("labor", "labor", LaborCreate,
     ["employee_id", "name", "role", "team", "shift", "hours_worked", "date", "peg_id", "origin_status", "contract_type", "notes"]),
    ("hse", "hse", HSECreate,
     ["incident_id", "type", "severity", "description", "location", "date", "reported_by", "status", "corrective_action"]),
    ("geology", "geology", GeologyCreate,
     ["sample_id", "peg_id", "depth_from", "depth_to", "rock_type", "grade_au_gt", "grade_cu_pct", "grade_co_pct", "grade_coltan_gt", "date", "geologist", "notes"]),
    ("support", "support", SupportCreate,
     ["ticket_id", "category", "priority", "description", "requested_by", "assigned_to", "status", "date_created", "date_resolved"]),
    ("financial", "financial", FinancialCreate,
     ["record_id", "date", "category", "currency", "description", "amount", "amount_usd", "peg_id", "approved_by", "notes"]),
    ("peg-advances", "peg_advances", PegAdvanceCreate,
     ["peg_id", "shift", "date", "drilled_meters", "blasted_holes", "mucked_tonnage", "notes"]),
    ("incidents", "incidents", IncidentCreate,
     ["title", "description", "severity", "location", "date", "reported_by"]),
    ("hse-checklists", "hse_checklists", HSEChecklistCreate,
     ["peg_id", "shift", "date", "face_safe", "ventilation_ok", "gas_checked", "water_sprayed", "supports_ok", "notes"]),
    ("equipment-pannes", "equipment_pannes", EquipmentPanneCreate,
     ["equipment_id", "issue_type", "description", "reported_date", "reported_by", "status", "photo"]),
    ("mini-reports", "mini_reports", MiniReportCreate,
     ["shift", "date", "peg_id", "weather_conditions", "safety_summary", "production_summary", "issues_encountered", "submitted_by"]),
    ("pto", "pto", PtoCreate,
     ["employee_id", "employee_name", "date", "leave_type", "days", "status", "notes"]),
    ("face-examinations", "face_examinations", FaceExaminationCreate,
     ["peg_id", "date", "examiner", "ground_condition", "hazards_observed", "ventilation_ok", "gas_readings", "action_required", "status", "photo"]),
    ("ground-support", "ground_support", GroundSupportCreate,
     ["peg_id", "support_type", "quantity", "date_installed", "state", "shotcrete_m3", "concrete_m3", "notes"]),
]

for route_name, table, ModelClass, fields in MODULES_CONFIG:
    make_generic_routes(route_name, table, ModelClass, fields)


# ─── Reports ──────────────────────────────────────────────────────────────────
@app.get("/api/reports/summary")
async def reports_summary(current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        async def count(table, where="1=1"):
            async with db.execute(f"SELECT COUNT(*) FROM {table} WHERE {where}") as c:
                return (await c.fetchone())[0]

        async def group(table, col):
            async with db.execute(f"SELECT {col}, COUNT(*) FROM {table} GROUP BY {col}") as c:
                return {r[0]: r[1] for r in await c.fetchall()}

        async def sum_group(table, group_col, val_col):
            async with db.execute(f"SELECT {group_col}, SUM({val_col}) FROM {table} GROUP BY {group_col}") as c:
                return {r[0]: round(r[1] or 0, 2) for r in await c.fetchall()}

        async def scalar(sql):
            async with db.execute(sql) as c:
                r = await c.fetchone()
                return r[0] or 0 if r else 0

        return {
            "pegs_summary": {
                "total": await count("pegs"),
                "by_status": await group("pegs", "status"),
                "by_zone": await group("pegs", "zone"),
            },
            "production_summary": {
                "total_tonnage": round(await scalar("SELECT SUM(tonnage) FROM production"), 2),
                "total_volume_m3": round(await scalar("SELECT SUM(volume_m3) FROM production"), 2),
                "by_material": await sum_group("production", "material_type", "tonnage"),
            },
            "safety_summary": {
                "total_incidents": await count("hse"),
                "by_type": await group("hse", "type"),
                "by_severity": await group("hse", "severity"),
            },
            "financial_summary": {
                "total_expenditure": round(await scalar("SELECT SUM(amount_usd) FROM financial"), 2),
                "by_category": await sum_group("financial", "category", "amount_usd"),
            }
        }

@app.get("/api/supervisor/alerts")
async def supervisor_alerts(current_user: dict = Depends(get_current_user)):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT * FROM incidents WHERE severity='high' OR severity='critical' ORDER BY created_at DESC LIMIT 20") as cur:
            incidents = rows_to_list(await cur.fetchall(), cur)
        async with db.execute("SELECT * FROM equipment_pannes WHERE status='open' ORDER BY created_at DESC LIMIT 20") as cur:
            pannes = rows_to_list(await cur.fetchall(), cur)
    return {"incidents": incidents, "pannes": pannes}

from typing import List, Dict, Any
from pydantic import BaseModel

class SyncPayload(BaseModel):
    collection: str
    data: List[Dict[str, Any]]

@app.post("/api/sync")
async def sync_data(payloads: List[SyncPayload], current_user: dict = Depends(get_current_user)):
    # Simple offline sync approach: insert all records as new or replace by ID
    # In a real scenario, handle conflict resolution.
    now = datetime.now(timezone.utc).isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        for p in payloads:
            table = p.collection
            # Only allow defined tables
            if table not in TABLES:
                continue
            for item in p.data:
                # Remove _id if it's there
                item_id = item.pop('_id', None) or str(uuid.uuid4())
                item['id'] = item_id
                if 'created_at' not in item:
                    item['created_at'] = now
                if 'created_by' not in item:
                    item['created_by'] = current_user.get("email")
                
                # Check if exists
                async with db.execute(f"SELECT id FROM {table} WHERE id=?", (item_id,)) as cur:
                    exists = await cur.fetchone()
                
                cols = list(item.keys())
                vals = list(item.values())
                
                if exists:
                    # Update
                    set_clause = ", ".join(f"{c}=?" for c in cols if c != "id")
                    update_vals = [v for k, v in item.items() if k != "id"]
                    if set_clause:
                        await db.execute(f"UPDATE {table} SET {set_clause} WHERE id=?", (*update_vals, item_id))
                else:
                    # Insert
                    placeholders = ", ".join("?" for _ in cols)
                    col_str = ", ".join(cols)
                    await db.execute(f"INSERT INTO {table} ({col_str}) VALUES ({placeholders})", vals)
        await db.commit()
    return {"message": "Sync successful"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)
