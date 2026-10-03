import os, sqlite3, pathlib

SCHEMA = "main"  # SQLite has no schema prefix
DB_PATH = pathlib.Path(__file__).parent / "local.db"

_USE_POSTGRES = bool(os.getenv("DB_HOST"))

if _USE_POSTGRES:
    import psycopg2
    def make_connection():
        return psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=int(os.getenv("DB_PORT", 5432)),
            dbname=os.getenv("DB_NAME", "narvee"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASS", ""),
        )
else:
    class _Conn:
        """Thin sqlite3 wrapper that mimics psycopg2 interface used in this project."""
        def __init__(self):
            self._conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
            self._conn.row_factory = sqlite3.Row
            self._init_schema()

        def _init_schema(self):
            self._conn.executescript("""
                CREATE TABLE IF NOT EXISTS tbl_candidates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    candidate_name TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    profile_status TEXT,
                    status TEXT DEFAULT 'Active',
                    reply_flag TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            self._conn.commit()

        def cursor(self): return _Cursor(self._conn.cursor())
        def commit(self):  self._conn.commit()
        def rollback(self): self._conn.rollback()
        def close(self): pass  # keep sqlite connection alive (file-based)

    class _Cursor:
        def __init__(self, cur): self._cur = cur
        def execute(self, sql, params=()):
            # Translate %s → ? for sqlite
            sql = sql.replace("%s", "?").replace("narvee_ats.", "").replace(f"{SCHEMA}.", "")
            self._cur.execute(sql, params)
        def fetchall(self): return [tuple(r) for r in self._cur.fetchall()]
        def fetchone(self): r = self._cur.fetchone(); return tuple(r) if r else None
        def close(self): pass

    _shared = None
    def make_connection():
        global _shared
        if _shared is None:
            _shared = _Conn()
        return _shared
