# -*- coding: utf-8 -*-
"""
backend/main.py — FastAPI app entry point.

Start:  uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from whatsapp.webhook_handler import router as webhook_router
from api.candidates import router as candidates_router
from api.messages import router as messages_router
from api.dashboard import router as dashboard_router
from api.waha import router as waha_router
from api.import_excel import router as import_router
from whatsapp.monthly_scheduler import start_scheduler

app = FastAPI(title="WhatsApp Notifier API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router, prefix="/api")
app.include_router(candidates_router, prefix="/api")
app.include_router(messages_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(waha_router, prefix="/api")
app.include_router(import_router, prefix="/api")

_scheduler = None

@app.on_event("startup")
def on_startup():
    global _scheduler
    _scheduler = start_scheduler()

@app.on_event("shutdown")
def on_shutdown():
    if _scheduler:
        _scheduler.shutdown(wait=False)
