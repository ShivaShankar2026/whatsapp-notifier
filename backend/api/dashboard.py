# -*- coding: utf-8 -*-
from fastapi import APIRouter
from database.db_manager import make_connection

router = APIRouter()


@router.get("/dashboard/stats")
def stats():
    conn = make_connection()
    cur = conn.cursor()
    cur.execute("SELECT status, COUNT(*) FROM tbl_candidates GROUP BY status")
    status_counts = dict(cur.fetchall())
    cur.execute("SELECT reply_flag, COUNT(*) FROM tbl_candidates WHERE reply_flag IS NOT NULL GROUP BY reply_flag")
    reply_counts = dict(cur.fetchall())
    return {
        "total": sum(status_counts.values()),
        "status_breakdown": status_counts,
        "reply_flags": reply_counts,
    }
