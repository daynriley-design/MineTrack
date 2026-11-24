import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Response, Depends

from db import get_connection
from models import UserCreate, UserLogin
from auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Comptes démo : seedés uniquement si ENV=dev, jamais en prod
DEMO_ACCOUNTS = [
    ("seed@minetrack.local", "123", "Superviseur Alpha", "supervisor"),
    ("seed@minetrack.local", "1234", "Géologue Expert", "geologist"),
    ("seed@minetrack.local", "12345", "Mineur 101", "operator"),
]


async def seed_demo_users():
    if os.environ.get("ENV", "prod") != "dev":
        return
    db = get_connection()
    async with db.execute("SELECT id FROM users LIMIT 1") as cur:
        if await cur.fetchone():
            return
    for email, pwd, name, role in DEMO_ACCOUNTS:
        await db.execute(
            "INSERT INTO users (id, email, password, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (str(uuid.uuid4()), email, hash_password(pwd), name, role,
             datetime.now(timezone.utc).isoformat()),
        )
    await db.commit()


@router.post("/register")
async def register(user_input: UserCreate, response: Response):
    email = user_input.email.lower()
    db = get_connection()
    async with db.execute("SELECT id FROM users WHERE email=?", (email,)) as cur:
        if await cur.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
    uid = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO users (id, email, password, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (uid, email, hash_password(user_input.password), user_input.name,
         user_input.role, datetime.now(timezone.utc).isoformat()),
    )
    await db.commit()
    token = create_access_token({"sub": uid, "email": email, "role": user_input.role, "name": user_input.name})
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=86400)
    return {"message": "Registered", "email": email, "role": user_input.role, "name": user_input.name}


@router.post("/login")
async def login(user_input: UserLogin, response: Response):
    email = user_input.email.lower()
    db = get_connection()
    db.row_factory = None  # tuples par défaut, on lit via description
    async with db.execute(
        "SELECT id, password, role, name FROM users WHERE email=?", (email,)
    ) as cur:
        rows = await cur.fetchall()

    valid_user = None
    for uid, pw_hash, role, name in rows:
        if verify_password(user_input.password, pw_hash):
            valid_user = (uid, role, name)
            break

    if not valid_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    uid, role, name = valid_user
    token = create_access_token({"sub": uid, "email": email, "role": role, "name": name})
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=86400)
    return {"message": "Login successful", "email": email, "role": role, "name": name}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
