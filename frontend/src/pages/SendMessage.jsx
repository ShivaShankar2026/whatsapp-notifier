import React, { useState } from 'react'
import api from '../api/client'
import s from './Page.module.css'

export default function SendMessage() {
  const [phone,   setPhone]   = useState('')
  const [message, setMessage] = useState('')
  const [result,  setResult]  = useState(null)
  const [bulkRes, setBulkRes] = useState(null)
  const [sending, setSending] = useState(false)

  const sendSingle = async e => {
    e.preventDefault()
    setSending(true)
    try {
      const r = await api.post('/messages/send', { phone, message })
      setResult(r.data.success ? '✅ Sent successfully' : '❌ Send failed — check WAHA logs')
    } catch { setResult('❌ Backend error') }
    setSending(false)
  }

  const sendBulk = async () => {
    setSending(true)
    try {
      const r = await api.post('/messages/send-bulk')
      setBulkRes(`✅ Sent: ${r.data.sent} | Failed: ${r.data.failed}`)
    } catch { setBulkRes('❌ Backend error') }
    setSending(false)
  }

  return (
    <div>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Send Message</h1>
        <p className={s.pageSub}>Send individual or bulk WhatsApp messages via WAHA</p>
      </div>

      <div className={s.twoCol}>
        <div className={s.card}>
          <h3 className={s.cardTitle}>Single Message</h3>
          <form onSubmit={sendSingle} className={s.form}>
            <input placeholder="Phone (e.g. 919876543210)" value={phone} required
              onChange={e => setPhone(e.target.value)} />
            <textarea rows={5} placeholder="Message text…" value={message} required
              onChange={e => setMessage(e.target.value)}
              style={{ resize: 'vertical' }} />
            <button type="submit" className={s.btnPrimary} disabled={sending}>
              {sending ? 'Sending…' : '📤 Send'}
            </button>
            {result && <div className={s.toast}>{result}</div>}
          </form>
        </div>

        <div className={s.card}>
          <h3 className={s.cardTitle}>Bulk — All Active Candidates</h3>
          <p style={{ color: 'var(--fg2)', fontSize: 13, marginBottom: 16 }}>
            Sends the standard monthly status message to every <strong style={{ color: 'var(--fg)' }}>Active</strong> candidate.
            8-second delay between each send.
          </p>
          <div className={s.infoBox}>
            <div className={s.infoRow}><span>Message</span><span>Monthly status update</span></div>
            <div className={s.infoRow}><span>Delay</span><span>8 sec / message</span></div>
            <div className={s.infoRow}><span>Replies handled</span><span>UPDATE · STOP</span></div>
          </div>
          <button className={s.btnPrimary} onClick={sendBulk} disabled={sending} style={{ marginTop: 16 }}>
            {sending ? 'Sending…' : '📢 Send to All Active'}
          </button>
          {bulkRes && <div className={s.toast} style={{ marginTop: 10 }}>{bulkRes}</div>}
        </div>
      </div>
    </div>
  )
}
