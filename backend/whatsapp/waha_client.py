# -*- coding: utf-8 -*-
import time
import requests
from utils.logger import get_logger

log = get_logger("waha_client")

WAHA_ENDPOINT = "http://localhost:3000/api/sendText"
WAHA_SESSION  = "default"
MESSAGE_DELAY = 8  # seconds between sends (anti-spam)


def send_whatsapp_message(phone: str, message: str) -> bool:
    clean = "".join(filter(str.isdigit, str(phone)))
    if not clean:
        log.warning("Invalid phone: %s", phone)
        return False
    payload = {"session": WAHA_SESSION, "chatId": f"{clean}@c.us", "text": message}
    try:
        res = requests.post(WAHA_ENDPOINT, json=payload,
                            headers={"Content-Type": "application/json"}, timeout=10)
        if res.status_code not in (200, 201):
            log.warning("WAHA %s → %s: %s", clean, res.status_code, res.text[:200])
        return res.status_code in (200, 201)
    except Exception as exc:
        log.error("WhatsApp error [%s]: %s", clean, exc)
        return False


def batch_send(candidates: list, delay: int = MESSAGE_DELAY) -> dict:
    sent = failed = 0
    for phone, name, profile_status in candidates:
        msg = (
            f"Hello {name},\n\n"
            f"Monthly profile status update.\n"
            f"Status: *{profile_status}*\n\n"
            f"Reply *UPDATE* to send a new CV.\n"
            f"Reply *STOP* to unsubscribe."
        )
        if send_whatsapp_message(phone, msg):
            sent += 1
        else:
            failed += 1
        time.sleep(delay)
    log.info("batch_send — sent: %d | failed: %d", sent, failed)
    return {"sent": sent, "failed": failed}
