# -*- coding: utf-8 -*-
from fastapi import APIRouter, Request
from database.db_manager import make_connection
from utils.logger import get_logger

log = get_logger("waha_webhook")
router = APIRouter()


@router.post("/whatsapp/webhook")
async def handle_inbound(request: Request):
    data  = await request.json()
    event = data.get("event")
    if event != "message":
        return {"status": "ignored"}

    payload = data.get("payload", {})
    phone   = payload.get("from", "").split("@")[0]
    text    = payload.get("body", "").strip().upper()
    log.info("Inbound [%s]: %s", phone, text)

    conn = make_connection()
    try:
        cur = conn.cursor()
        if text == "UPDATE":
            cur.execute(
                "UPDATE narvee_ats.tbl_candidates SET reply_flag='UPDATE_REQUESTED', updated_at=NOW() WHERE phone=%s",
                (phone,),
            )
        elif text == "STOP":
            cur.execute(
                "UPDATE narvee_ats.tbl_candidates SET status='Unsubscribed', updated_at=NOW() WHERE phone=%s",
                (phone,),
            )
        conn.commit()
        cur.close()
    except Exception as exc:
        log.error("webhook DB error [%s]: %s", phone, exc)
        conn.rollback()
    finally:
        conn.close()
    return {"status": "ok"}
