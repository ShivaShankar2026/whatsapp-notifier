import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Candidates from './pages/Candidates'
import SendMessage from './pages/SendMessage'
import Connect from './pages/Connect'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💬</span>
          <span className={styles.logoText}>WA Notifier</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/candidates" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            👥 Candidates
          </NavLink>
          <NavLink to="/send" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            📤 Send Message
          </NavLink>
          <NavLink to="/connect" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
            🔗 Connect WA
          </NavLink>
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.wahaStatus}>● WAHA :3000</span>
        </div>
      </aside>
      <main className={styles.content}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/send" element={<SendMessage />} />
          <Route path="/connect" element={<Connect />} />
        </Routes>
      </main>
    </div>
  )
}
