import os
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request, Depends

JWT_ALGORITHM = "HS256"


async def _account_still_valid(claims: dict) -> bool:
    """Vérifie que le compte lié au jeton est toujours actif."""
    import database  # import local : evite un cycle au chargement
    async with database.connect() as db:
        async with db.execute(
            "SELECT 1 FROM users WHERE id=? AND email=? AND role=? AND COALESCE(status, 'active')='active'",
            (claims.get("sub"), claims.get("email"), claims.get("role")),
        ) as cur:
            return await cur.fetchone() is not None


def get_jwt_secret() -> str:
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        raise RuntimeError(
            "JWT_SECRET manquant. Génère-le : python -c \"import secrets; print(secrets.token_hex(32))\""
        )
    return secret


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except (ValueError, TypeError):
        # Hash corrompu ou ancien format (ex: mot de passe en clair d'une ancienne version) -> refuse proprement
        return False


def create_access_token(data: dict, expires_hours: int = 24) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=expires_hours)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    claims = decode_token(token)
    if not await _account_still_valid(claims):
        raise HTTPException(status_code=401, detail="Compte supprimé ou modifié")
    queued_account = request.headers.get("x-minetrack-account")
    if queued_account is not None and queued_account != claims.get("sub"):
        raise HTTPException(status_code=409, detail="La saisie appartient à un autre compte")
    return claims


def require_role(*allowed_roles: str):
    """Dépendance FastAPI : restreint une route aux rôles listés.
    Avant : get_current_user seul vérifiait l'authentification mais AUCUN rôle
    -> un compte 'operator' (mineur) pouvait appeler DELETE /supervisor/users/{id}."""
    async def checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Accès refusé pour ce rôle")
        return current_user
    return checker
