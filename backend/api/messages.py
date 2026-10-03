# -*- coding: utf-8 -*-
from fastapi import APIRouter
from pydantic import BaseModel
from whatsapp.waha_client import send_whatsapp_message, batch_send
from database.db_manager import make_connection

router = APIRouter()


class SendRequest(BaseModel):
    phone: str
    message: str


@router.post("/messages/send")
def send_single(req: SendRequest):
    ok = send_whatsapp_message(req.phone, req.message)
    return {"success": ok}


@router.post("/messages/send-bulk")
def send_bulk():
    conn = make_connection()
    cur = conn.cursor()
    cur.execute("SELECT phone, candidate_name, profile_status FROM tbl_candidates WHERE status='Active'")
    candidates = cur.fetchall()
    return batch_send(candidates)


@router.get("/messages/log")
def message_log():
    return {"message": "Extend with a messages_log table for history"}
