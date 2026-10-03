# -*- coding: utf-8 -*-
"""Proxy WAHA endpoints through backend to avoid browser CORS issues."""
import requests
from fastapi import APIRouter, Response
from utils.logger import get_logger

router = APIRouter()
log = get_logger("waha_proxy")

WAHA = "http://localhost:3000"
SESSION = "default"


@router.get("/waha/status")
def waha_status():
    try:
        r = requests.get(f"{WAHA}/api/sessions/{SESSION}", timeout=5)
        return r.json()
    except Exception as exc:
        log.warning("WAHA status failed: %s", exc)
        return {"error": "WAHA not reachable", "status": "OFFLINE"}


@router.get("/waha/qr")
def waha_qr():
    try:
        r = requests.get(f"{WAHA}/api/{SESSION}/auth/qr", timeout=5)
        return Response(content=r.content, media_type=r.headers.get("content-type", "image/png"))
    except Exception as exc:
        log.warning("WAHA QR failed: %s", exc)
        return Response(content=b"", status_code=503)


@router.post("/waha/start")
def waha_start():
    try:
        r = requests.post(f"{WAHA}/api/sessions/start",
                          json={"name": SESSION}, timeout=5)
        return r.json()
    except Exception as exc:
        return {"error": str(exc)}


@router.post("/waha/stop")
def waha_stop():
    try:
        r = requests.post(f"{WAHA}/api/sessions/stop",
                          json={"name": SESSION}, timeout=5)
        return r.json()
    except Exception as exc:
        return {"error": str(exc)}
