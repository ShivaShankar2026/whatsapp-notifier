# -*- coding: utf-8 -*-
import io, pathlib
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse, FileResponse
import openpyxl
from database.db_manager import make_connection
from utils.logger import get_logger

DOWNLOADS = pathlib.Path(__file__).parent.parent / "downloads"

router = APIRouter()
log = get_logger("import_excel")

REQUIRED_COLS = {"candidate_name", "phone"}
ALLOWED_COLS  = {"candidate_name", "phone", "profile_status", "status"}


@router.post("/candidates/import")
async def import_excel(file: UploadFile = File(...)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(400, "Only .xlsx or .xls files are supported")

    content = await file.read()
    try:
        wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        ws = wb.active
    except Exception as e:
        raise HTTPException(400, f"Cannot read Excel file: {e}")

    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        raise HTTPException(400, "Excel file is empty")

    # First row = headers
    headers = [str(h).strip().lower().replace(" ", "_") if h else "" for h in rows[0]]

    missing = REQUIRED_COLS - set(headers)
    if missing:
        raise HTTPException(400, f"Missing required columns: {missing}. Found: {headers}")

    idx = {col: headers.index(col) for col in ALLOWED_COLS if col in headers}

    conn = make_connection()
    cur  = conn.cursor()

    inserted = skipped = errors = 0
    error_rows = []

    for row_num, row in enumerate(rows[1:], start=2):
        try:
            name  = str(row[idx["candidate_name"]]).strip() if idx.get("candidate_name") is not None and row[idx["candidate_name"]] else ""
            phone = str(row[idx["phone"]]).strip()           if idx.get("phone")           is not None and row[idx["phone"]]           else ""
            phone = "".join(filter(str.isdigit, phone))

            if not name or not phone:
                skipped += 1
                continue

            profile = str(row[idx["profile_status"]]).strip() if idx.get("profile_status") is not None and row[idx.get("profile_status", -1)] not in (None, "") else "—"
            # safe fallback
            if idx.get("profile_status") is not None:
                val = row[idx["profile_status"]]
                profile = str(val).strip() if val else "—"

            status = "Active"
            if idx.get("status") is not None:
                val = row[idx["status"]]
                status = str(val).strip() if val else "Active"

            cur.execute(
                "INSERT INTO tbl_candidates (candidate_name, phone, profile_status, status) VALUES (%s,%s,%s,%s)",
                (name, phone, profile, status),
            )
            inserted += 1

        except Exception as e:
            errors += 1
            error_rows.append({"row": row_num, "error": str(e)})
            log.warning("Row %d error: %s", row_num, e)

    conn.commit()
    cur.close()
    log.info("Import done — inserted: %d | skipped: %d | errors: %d", inserted, skipped, errors)

    return JSONResponse({
        "inserted": inserted,
        "skipped":  skipped,
        "errors":   errors,
        "error_rows": error_rows[:10],  # show first 10 only
    })


@router.get("/candidates/import/template")
def download_template():
    path = DOWNLOADS / "candidates_template.xlsx"
    if not path.exists():
        raise HTTPException(404, "Template file not found")
    return FileResponse(
        path=str(path),
        filename="candidates_template.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
