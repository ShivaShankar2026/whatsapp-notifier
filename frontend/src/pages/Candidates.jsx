import React, { useEffect, useState } from 'react'
import api from '../api/client'
import s from './Page.module.css'

const EMPTY = { candidate_name: '', phone: '', profile_status: '', status: 'Active' }

export default function Candidates() {
  const [rows,       setRows]       = useState([])
  const [form,       setForm]       = useState(EMPTY)
  const [msg,        setMsg]        = useState('')
  const [importing,  setImporting]  = useState(false)
  const [importRes,  setImportRes]  = useState(null)
  const fileRef = React.useRef()

  const load = () => api.get('/candidates').then(r => setRows(r.data)).catch(() => {})

  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    try {
      await api.post('/candidates', form)
      setForm(EMPTY)
      setMsg('Candidate added.')
      load()
    } catch { setMsg('Error saving.') }
    setTimeout(() => setMsg(''), 3000)
  }

  const remove = async id => {
    await api.delete(`/candidates/${id}`)
    load()
  }

  const importExcel = async e => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    setImportRes(null)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const r = await api.post('/candidates/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setImportRes(r.data)
      load()
    } catch (err) {
      setImportRes({ error: err.response?.data?.detail || 'Upload failed' })
    }
    setImporting(false)
    fileRef.current.value = ''
  }

  const statusColor = st => st === 'Active' ? 'var(--accent)' : st === 'Unsubscribed' ? 'var(--danger)' : 'var(--fg2)'

  return (
    <div>
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Candidates</h1>
        <p className={s.pageSub}>Manage WhatsApp notification recipients</p>
      </div>

      <div className={s.card} style={{ marginBottom: 24 }}>
        <h3 className={s.cardTitle}>Add Candidate</h3>
        <form onSubmit={submit} className={s.form}>
          <input placeholder="Name" value={form.candidate_name} required
            onChange={e => setForm(f => ({ ...f, candidate_name: e.target.value }))} />
          <input placeholder="Phone (with country code, e.g. 919876543210)" value={form.phone} required
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <input placeholder="Profile Status (e.g. Available, On Project)" value={form.profile_status} required
            onChange={e => setForm(f => ({ ...f, profile_status: e.target.value }))} />
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button type="submit" className={s.btnPrimary}>Add</button>
          {msg && <span className={s.toast}>{msg}</span>}
        </form>
      </div>

      {/* Excel Import */}
      <div className={s.card} style={{ marginBottom: 24 }}>
        <h3 className={s.cardTitle}>📥 Import from Excel</h3>
        <p style={{ color: 'var(--fg2)', fontSize: 12, marginBottom: 14 }}>
          Upload an <strong style={{color:'var(--fg)'}}>Excel (.xlsx)</strong> file with columns:
          <code style={{background:'var(--surface2)',padding:'1px 6px',borderRadius:4,margin:'0 4px',fontSize:11}}>candidate_name</code>
          <code style={{background:'var(--surface2)',padding:'1px 6px',borderRadius:4,margin:'0 4px',fontSize:11}}>phone</code>
          <code style={{background:'var(--surface2)',padding:'1px 6px',borderRadius:4,margin:'0 4px',fontSize:11}}>profile_status</code>
          <code style={{background:'var(--surface2)',padding:'1px 6px',borderRadius:4,margin:'0 4px',fontSize:11}}>status</code>
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <a href="/api/candidates/import/template" download="candidates_template.xlsx"
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              background:'var(--surface2)', color:'var(--fg2)', fontWeight:600, fontSize:13,
              padding:'9px 18px', borderRadius:8, border:'1px solid var(--border)', textDecoration:'none'
            }}>
            ⬇ Download Template
          </a>
          <label style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'var(--accent)', color:'#000', fontWeight:600, fontSize:13,
            padding:'9px 18px', borderRadius:8, cursor:'pointer', opacity: importing ? 0.6 : 1
          }}>
            {importing ? 'Uploading…' : '📂 Choose Excel File'}
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={importExcel}
              style={{ display:'none' }} disabled={importing} />
          </label>
          {importRes && !importRes.error && (
            <div style={{ fontSize:13, display:'flex', gap:14, flexWrap:'wrap' }}>
              <span style={{color:'var(--accent)'}}>✅ Inserted: <strong>{importRes.inserted}</strong></span>
              {importRes.skipped > 0 && <span style={{color:'var(--fg2)'}}>⏭ Skipped: <strong>{importRes.skipped}</strong></span>}
              {importRes.errors > 0  && <span style={{color:'var(--danger)'}}>❌ Errors: <strong>{importRes.errors}</strong></span>}
            </div>
          )}
          {importRes?.error && (
            <span style={{ color:'var(--danger)', fontSize:13 }}>❌ {importRes.error}</span>
          )}
        </div>
        {importRes?.error_rows?.length > 0 && (
          <div style={{ marginTop:10, fontSize:11, color:'var(--danger)' }}>
            {importRes.error_rows.map((e,i) => <div key={i}>Row {e.row}: {e.error}</div>)}
          </div>
        )}
      </div>

      <div className={s.card}>
        <h3 className={s.cardTitle}>All Candidates ({rows.length})</h3>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Name</th><th>Phone</th><th>Profile Status</th><th>Status</th><th>Reply Flag</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{r.candidate_name}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{r.phone}</td>
                  <td>{r.profile_status}</td>
                  <td><span style={{ color: statusColor(r.status), fontWeight: 600 }}>{r.status}</span></td>
                  <td style={{ color: 'var(--amber)', fontSize: 12 }}>{r.reply_flag || '—'}</td>
                  <td>
                    <button className={s.btnDanger} onClick={() => remove(r.id)}>✕</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--fg2)', padding: 24 }}>No candidates yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
