import os
from fastapi import HTTPException, Header
from jose import jwt, JWTError

SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
ALGORITHM  = "HS256"


def get_current_user_id(authorization: str = Header(default=None)) -> str:
    """Verify Bearer JWT and return user_id (sub claim)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication required")
    token = authorization[7:]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub", "")
        if not user_id:
            raise HTTPException(401, "Invalid token payload")
        return user_id
    except JWTError:
        raise HTTPException(401, "Token expired or invalid — please log in again")
