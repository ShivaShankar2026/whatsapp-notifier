import React, { useEffect, useState, useRef } from 'react'
import s from './Page.module.css'
import c from './Connect.module.css'

const SESSION = 'default'

export default function Connect() {
  const [status,  setStatus]  = useState(null)
  const [qrUrl,   setQrUrl]   = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const fetchStatus = async () => {
    try {
      const r = await fetch('/api/waha/status')
      const d = await r.json()
      if (d.error === 'WAHA not reachable') {
        setError('Cannot reach WAHA on localhost:3000. Make sure Docker is running.')
        setStatus(null); setQrUrl(null)
      } else {
        setError(null)
        setStatus(d)
        // Bust cache on QR image every poll
        if (d.status !== 'WORKING') {
          setQrUrl(`/api/waha/qr?t=${Date.now()}`)
        } else {
          setQrUrl(null)
        }
      }
    } catch {
      setError('Backend not reachable.')
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    await fetch('/api/waha/start', { method: 'POST' })
    setTimeout(fetchStatus, 1500)
  }

  const stopSession = async () => {
    await fetch('/api/waha/stop', { method: 'POST' })
    setTimeout(fetchStatus, 1500)
  }

  useEffect(() => {
    fetchStatus()
    pollRef.current = setInterval(fetchStatus, 5000)
    return () => clearInterval(pollRef.current)
  }, [])

  const isConnected = status?.status === 'WORKING'
  const statusColor = isConnected
    ? 'var(--accent)'
    : status?.status === 'SCAN_QR_CODE' ? 'var(--amber)' : 'var(--danger)'

  return (
    <div>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Connect WhatsApp</h1>
        <p className={s.pageSub}>Pair your WhatsApp account via WAHA (localhost:3000)</p>
      </div>

      {/* Status bar */}
      <div className={c.statusBar}>
        <div className={c.statusDot} style={{ background: error ? 'var(--danger)' : loading ? 'var(--fg3)' : statusColor }} />
        <span className={c.statusText}>
          {error ? 'WAHA Offline' : loading ? 'Connecting…' : isConnected ? 'WhatsApp Connected ✓' : `Status: ${status?.status ?? 'Unknown'}`}
        </span>
        <button className={c.refreshBtn} onClick={fetchStatus}>↻ Refresh</button>
      </div>

      {error && (
        <div className={c.errorBox}>
          <div className={c.errorTitle}>WAHA not running</div>
          <p>{error}</p>
          <p style={{ marginTop: 10 }}>Start it with:</p>
          <code className={c.code}>docker run -d --name waha --restart unless-stopped -p 3000:3000 devlikeapro/waha</code>
        </div>
      )}

      {!error && (
        <div className={c.grid}>
          {/* QR Panel */}
          <div className={s.card}>
            <h3 className={s.cardTitle}>📱 Scan QR Code</h3>

            {isConnected ? (
              <div className={c.connected}>
                <div className={c.connectedIcon}>✅</div>
                <div className={c.connectedText}>WhatsApp Connected</div>
                <div className={c.connectedSub}>Messages will be sent via this session</div>
                <button className={c.dangerBtn} onClick={stopSession}>Disconnect</button>
              </div>
            ) : qrUrl ? (
              <div className={c.qrWrap}>
                <img src={qrUrl} alt="WhatsApp QR Code" className={c.qrImg}
                  onError={() => setQrUrl(null)} />
                <p className={c.qrHint}>Open WhatsApp → Linked Devices → Scan this code</p>
                <p className={c.qrRefresh}>Auto-refreshes every 5 seconds</p>
              </div>
            ) : (
              <div className={c.noQr}>
                <p style={{ color: 'var(--fg2)', marginBottom: 16 }}>
                  No active session. Click Start to get the QR code.
                </p>
                <button className={s.btnPrimary} onClick={startSession}>▶ Start Session</button>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className={s.card}>
            <h3 className={s.cardTitle}>ℹ️ Session Info</h3>
            {status ? (
              <div className={s.infoBox}>
                <div className={s.infoRow}><span>Session</span><span>{status.name ?? SESSION}</span></div>
                <div className={s.infoRow}>
                  <span>Status</span>
                  <span style={{ color: statusColor, fontWeight: 600 }}>{status.status}</span>
                </div>
                <div className={s.infoRow}><span>Engine</span><span>{status.config?.engine ?? '—'}</span></div>
                <div className={s.infoRow}><span>WAHA Host</span><span>localhost:3000</span></div>
                <div className={s.infoRow}><span>Webhook URL</span><span style={{fontSize:11}}>:8000/api/whatsapp/webhook</span></div>
              </div>
            ) : (
              <p style={{ color: 'var(--fg2)', fontSize: 13 }}>Waiting for session data…</p>
            )}

            <div style={{ marginTop: 20 }}>
              <h3 className={s.cardTitle} style={{ marginBottom: 12 }}>📋 Setup Steps</h3>
              <div className={c.steps}>
                {[
                  'Run WAHA via Docker on port 3000',
                  'Click "Start Session" if not started',
                  'Scan QR with WhatsApp on your phone',
                  'Status turns Connected — done!',
                  'Point WAHA webhook → :8000/api/whatsapp/webhook',
                ].map((t, i) => (
                  <div key={i} className={c.step}>
                    <div className={c.stepNum}>{i + 1}</div>
                    <div className={c.stepText}>{t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
