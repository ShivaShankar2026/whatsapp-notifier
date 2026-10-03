# WhatsApp Notifier

Monthly WhatsApp status updates to ATS candidates via WAHA.

```
whatsapp_notifier/
├── backend/
│   ├── main.py                   ← FastAPI app (uvicorn main:app --reload)
│   ├── requirements.txt
│   ├── .env.example
│   ├── api/
│   │   ├── candidates.py         ← GET/POST/DELETE /api/candidates
│   │   ├── messages.py           ← POST /api/messages/send + send-bulk
│   │   └── dashboard.py          ← GET /api/dashboard/stats
│   ├── whatsapp/
│   │   ├── waha_client.py        ← send_whatsapp_message / batch_send
│   │   ├── webhook_handler.py    ← POST /api/whatsapp/webhook (UPDATE / STOP)
│   │   └── monthly_scheduler.py  ← APScheduler cron — 5th of month 09:00
│   ├── database/
│   │   └── db_manager.py         ← psycopg2 connection
│   └── utils/
│       └── logger.py
└── frontend/
    ├── package.json
    ├── vite.config.js            ← proxies /api → :8000
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx               ← sidebar + router
        ├── index.css
        ├── api/client.js         ← axios instance
        └── pages/
            ├── Dashboard.jsx     ← stats + pipeline view
            ├── Candidates.jsx    ← add / list / delete candidates
            └── SendMessage.jsx   ← single + bulk send
```

## Quick Start

**Backend**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in DB credentials
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

**WAHA** (WhatsApp gateway)
```bash
docker run -d --name waha --restart unless-stopped -p 3000:3000 devlikeapro/waha
# Then pair once at http://localhost:3000/dashboard
```

**Webhook** — point WAHA's webhook to `http://<server>:8000/api/whatsapp/webhook`
