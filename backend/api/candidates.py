# -*- coding: utf-8 -*-
from fastapi import APIRouter
from pydantic import BaseModel
from database.db_manager import make_connection

router = APIRouter()


class Candidate(BaseModel):
    candidate_name: str
    phone: str
    profile_status: str
    status: str = "Active"


@router.get("/candidates")
def list_candidates():
    conn = make_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, candidate_name, phone, profile_status, status, reply_flag, updated_at FROM tbl_candidates ORDER BY id DESC")
    rows = cur.fetchall()
    keys = ["id", "candidate_name", "phone", "profile_status", "status", "reply_flag", "updated_at"]
    return [dict(zip(keys, r)) for r in rows]


@router.post("/candidates")
def add_candidate(c: Candidate):
    conn = make_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO tbl_candidates (candidate_name, phone, profile_status, status) VALUES (%s,%s,%s,%s)",
        (c.candidate_name, c.phone, c.profile_status, c.status),
    )
    conn.commit()
    return {"status": "added", **c.dict()}


@router.delete("/candidates/{candidate_id}")
def delete_candidate(candidate_id: int):
    conn = make_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM tbl_candidates WHERE id=%s", (candidate_id,))
    conn.commit()
    return {"deleted": candidate_id}
