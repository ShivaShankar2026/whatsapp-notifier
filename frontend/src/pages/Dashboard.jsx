import React, { useEffect, useState } from 'react'
import api from '../api/client'
import s from './Page.module.css'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({ error: true }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={s.empty}>Loading…</div>
  if (!stats || stats.error) return <div className={s.empty}>Could not reach backend. Is it running on :8000?</div>

  const breakdown = stats.status_breakdown || {}
  const replies   = stats.reply_flags || {}

  return (
    <div>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Dashboard</h1>
        <p className={s.pageSub}>WhatsApp candidate notification overview</p>
      </div>

      <div className={s.statGrid}>
        <div className={s.stat}>
          <div className={s.statNum} style={{ color: 'var(--accent)' }}>{stats.total ?? 0}</div>
          <div className={s.statLabel}>Total Candidates</div>
        </div>
        <div className={s.stat}>
          <div className={s.statNum} style={{ color: 'var(--accent)' }}>{breakdown.Active ?? 0}</div>
          <div className={s.statLabel}>Active</div>
        </div>
        <div className={s.stat}>
          <div className={s.statNum} style={{ color: 'var(--danger)' }}>{breakdown.Unsubscribed ?? 0}</div>
          <div className={s.statLabel}>Unsubscribed</div>
        </div>
        <div className={s.stat}>
          <div className={s.statNum} style={{ color: 'var(--amber)' }}>{replies.UPDATE_REQUESTED ?? 0}</div>
          <div className={s.statLabel}>Update Requested</div>
        </div>
      </div>

      <div className={s.card} style={{ marginTop: 24 }}>
        <h3 className={s.cardTitle}>Monthly Schedule</h3>
        <p style={{ color: 'var(--fg2)', fontSize: 13 }}>
          Auto-fires every <strong style={{ color: 'var(--fg)' }}>5th of the month at 09:00 AM</strong> via APScheduler.<br />
          Messages include profile status + UPDATE/STOP reply keywords.<br />
          8-second delay between messages to avoid WhatsApp rate-limits.
        </p>
        <div className={s.pipeline}>
          {['Fetch Active Candidates', 'Render Message', 'WAHA POST /sendText', 'Log Result'].map((step, i) => (
            <div key={i} className={s.pipeStep}>
              <div className={s.pipeNum}>{i + 1}</div>
              <div className={s.pipeLabel}>{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
