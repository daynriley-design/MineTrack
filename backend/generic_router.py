"""
Factory CRUD générique — remplace 15 blocs dupliqués + routes pegs manuelles.
PERF: réutilise la connexion process-wide (db.py), pas d'ouverture par requête.
SÉCURITÉ: whitelist stricte des colonnes modifiables (corrige /api/sync).
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Type, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from db import get_connection
from auth_utils import get_current_user


def row_to_dict(row, cursor):
    if row is None:
        return None
    cols = [d[0] for d in cursor.description]
    d = dict(zip(cols, row))
    if "id" in d:
        d["_id"] = d.pop("id")
    if d.get("coordinates"):
        try:
            d["coordinates"] = json.loads(d["coordinates"])
        except Exception:
            pass
    return d


def rows_to_list(rows, cursor):
    cols = [d[0] for d in cursor.description]
    out = []
    for row in rows:
        d = dict(zip(cols, row))
        if "id" in d:
            d["_id"] = d.pop("id")
        if d.get("coordinates"):
            try:
                d["coordinates"] = json.loads(d["coordinates"])
            except Exception:
                pass
        out.append(d)
    return out


def build_router(
    route_name: str,
    table: str,
    create_model: Type[BaseModel],
    update_model: Optional[Type[BaseModel]],
    fields: list,
) -> APIRouter:
    router = APIRouter(prefix=f"/api/{route_name}", tags=[route_name])
    allowed_columns = set(fields)  # whitelist : seules ces colonnes sont écrivables

    @router.get("")
    async def list_items(
        current_user: dict = Depends(get_current_user),
        limit: int = 50,
        cursor: Optional[str] = None,
    ):
        # PERF: pagination par curseur (rowid) au lieu de LIMIT 200 fixe.
        # Évite de retourner systématiquement 200 lignes même quand le client
        # n'en affiche que 20, et évite l'offset (coûteux à volume élevé).
        limit = min(limit, 200)
        db = get_connection()
        if cursor:
            query = f"SELECT rowid, * FROM {table} WHERE rowid < ? ORDER BY rowid DESC LIMIT ?"
            params = (int(cursor), limit)
        else:
            query = f"SELECT rowid, * FROM {table} ORDER BY rowid DESC LIMIT ?"
            params = (limit,)
        async with db.execute(query, params) as cur:
            rows = await cur.fetchall()
            cols = [d[0] for d in cur.description]
        items = []
        next_cursor = None
        for row in rows:
            d = dict(zip(cols, row))
            next_cursor = d.pop("rowid")
            if "id" in d:
                d["_id"] = d.pop("id")
            if d.get("coordinates"):
                try:
                    d["coordinates"] = json.loads(d["coordinates"])
                except Exception:
                    pass
            items.append(d)
        return {"items": items, "next_cursor": next_cursor if len(items) == limit else None}

    @router.post("")
    async def create_item(body: create_model, current_user: dict = Depends(get_current_user)):
        uid = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        data = body.model_dump()
        if data.get("coordinates") is not None:
            data["coordinates"] = json.dumps(data["coordinates"])
        values = [uid] + [data.get(f) for f in fields] + [now, current_user.get("email")]
        placeholders = ",".join("?" for _ in values)
        cols = "id," + ",".join(fields) + ",created_at,created_by"
        db = get_connection()
        await db.execute(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})", values)
        await db.commit()
        return {"_id": uid, **body.model_dump(), "created_at": now}

    @router.get("/{item_id}")
    async def get_item(item_id: str, current_user: dict = Depends(get_current_user)):
        db = get_connection()
        async with db.execute(f"SELECT * FROM {table} WHERE id=?", (item_id,)) as cur:
            row = await cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Not found")
            return row_to_dict(row, cur)

    if update_model is not None:
        @router.put("/{item_id}")
        async def update_item(item_id: str, body: update_model, current_user: dict = Depends(get_current_user)):
            updates = {
                k: v for k, v in body.model_dump().items()
                if v is not None and k in allowed_columns
            }
            if not updates:
                return {"message": "Nothing to update"}
            set_clause = ", ".join(f"{k}=?" for k in updates)
            db = get_connection()
            cur = await db.execute(
                f"UPDATE {table} SET {set_clause} WHERE id=?", (*updates.values(), item_id)
            )
            await db.commit()
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Not found")
            return {"message": "Updated"}

    @router.delete("/{item_id}")
    async def delete_item(item_id: str, current_user: dict = Depends(get_current_user)):
        db = get_connection()
        cur = await db.execute(f"DELETE FROM {table} WHERE id=?", (item_id,))
        await db.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Not found")
        return {"message": "Deleted"}

    return router
