"""
Central rate-limiter instance.
Imported by main.py (to attach to app) and by individual routers.
Uses in-memory storage — sufficient for a single-instance deployment.
For multi-instance / horizontal scaling, swap storage_uri to a Redis URL.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
