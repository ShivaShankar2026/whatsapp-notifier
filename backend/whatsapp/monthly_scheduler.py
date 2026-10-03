# -*- coding: utf-8 -*-
from apscheduler.schedulers.background import BackgroundScheduler
from database.db_manager import make_connection, SCHEMA
from utils.logger import get_logger
from whatsapp.waha_client import batch_send

log = get_logger("scheduler")


def run_monthly_pipeline() -> None:
    log.info("=== Monthly WhatsApp Pipeline Start ===")
    conn = make_connection()
    try:
        cur = conn.cursor()
        cur.execute(f"SELECT phone, candidate_name, profile_status FROM {SCHEMA}.tbl_candidates WHERE status='Active'")
        candidates = cur.fetchall()
        cur.close()
    except Exception as exc:
        log.error("Fetch candidates failed: %s", exc)
        conn.close()
        return
    finally:
        conn.close()

    log.info("Dispatching to %d candidates", len(candidates))
    summary = batch_send(candidates, delay=8)
    log.info("Done — %s", summary)
    log.info("=== Monthly WhatsApp Pipeline End ===")


def start_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        run_monthly_pipeline,
        trigger="cron",
        day=5, hour=9, minute=0,
        id="monthly_whatsapp",
        replace_existing=True,
    )
    scheduler.start()
    log.info("Scheduler armed — fires 5th of every month at 09:00")
    return scheduler
