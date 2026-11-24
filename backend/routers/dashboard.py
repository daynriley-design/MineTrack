from fastapi import APIRouter, Depends
from db import get_connection
from auth_utils import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# PERF: 8 requêtes séparées → 1 seule requête avec sous-requêtes scalaires.
# Élimine 7 aller-retours réseau/driver par appel dashboard (page la plus visitée).
STATS_QUERY = """
SELECT
    (SELECT COUNT(*) FROM pegs) AS pegs_total,
    (SELECT COUNT(*) FROM pegs WHERE status='active') AS pegs_active,
    (SELECT COUNT(*) FROM pegs WHERE status='completed') AS pegs_completed,
    (SELECT COUNT(*) FROM hse WHERE status='open') AS hse_open,
    (SELECT COUNT(*) FROM hse WHERE severity='critical') AS hse_critical,
    (SELECT COUNT(*) FROM equipment WHERE status='operational') AS equip_operational,
    (SELECT COUNT(*) FROM equipment WHERE status='maintenance') AS equip_maintenance,
    (SELECT COUNT(*) FROM equipment WHERE status='breakdown') AS equip_breakdown,
    (SELECT COALESCE(SUM(tonnage), 0) FROM production) AS total_tonnage,
    (SELECT COUNT(*) FROM labor) AS labor_total,
    (SELECT COUNT(*) FROM labor WHERE origin_status='national') AS labor_national,
    (SELECT COUNT(*) FROM labor WHERE origin_status='expat') AS labor_expat,
    (SELECT COALESCE(SUM(amount_usd), 0) FROM financial) AS total_cost_usd
"""


@router.get("/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_connection()
    async with db.execute(STATS_QUERY) as cur:
        row = await cur.fetchone()

    (pegs_total, pegs_active, pegs_completed, hse_open, hse_critical,
     equip_op, equip_maint, equip_break, tonnage, labor_total,
     labor_nat, labor_expat, cost_usd) = row

    return {
        "pegs": {"total": pegs_total, "active": pegs_active, "completed": pegs_completed},
        "safety": {"open_incidents": hse_open, "critical": hse_critical},
        "equipment": {"operational": equip_op, "maintenance": equip_maint, "breakdown": equip_break},
        "production": {"total_tonnage": round(tonnage, 2)},
        "labor": {"total": labor_total, "national": labor_nat, "expat": labor_expat},
        "financial": {"total_cost_usd": round(cost_usd, 2)},
    }


@router.get("/charts")
async def dashboard_charts(current_user: dict = Depends(get_current_user)):
    db = get_connection()
    async with db.execute(
        "SELECT date, SUM(tonnage) FROM production GROUP BY date ORDER BY date DESC LIMIT 14"
    ) as c:
        prod = [{"date": r[0], "tonnage": r[1]} for r in await c.fetchall()]
    async with db.execute("SELECT type, COUNT(*) FROM hse GROUP BY type") as c:
        hse_by_type = {r[0]: r[1] for r in await c.fetchall()}
    async with db.execute("SELECT status, COUNT(*) FROM equipment GROUP BY status") as c:
        equip_status = {r[0]: r[1] for r in await c.fetchall()}

    return {
        "production_trend": list(reversed(prod)),
        "hse_by_type": hse_by_type,
        "equipment_status": equip_status,
    }
