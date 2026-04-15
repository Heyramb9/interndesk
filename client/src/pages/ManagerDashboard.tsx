import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_BASE_URL from '../apiConfig'
import Sidebar from '../components/layout/Sidebar'
import { Modal, ToastContainer, useToast, MessagesPanel, GenericDataPanel } from '../components/ui';
import { Intern } from '../types'
import '../styles/manager-dashboard.css'

const ACTIVITY = [
  { icon: '✅', text: 'Alex Johnson completed Sprint Review task', time: '5 min ago', color: '#10b981' },
  { icon: '⚠️', text: 'Ryan Chen missed 3rd check-in this week', time: '30 min ago', color: '#ef4444' },
  { icon: '🎓', text: 'Lena Schmidt joined Cohort 4', time: '2 hrs ago', color: '#6d28d9' },
  { icon: '⭐', text: 'Faith Okafor earned Consistent Performer badge', time: '2 days ago', color: '#f59e0b' },
  { icon: '📋', text: 'Mid-term review scheduled for March 12', time: '2 days ago', color: '#2f7cf0' },
  { icon: '💬', text: 'Maya Patel submitted week 5 journal', time: '3 days ago', color: '#0d9488' },
]

const STATUS_COLOR: Record<string, string> = { 'on-track': 'tag-green', 'at-risk': 'tag-red', completed: 'tag-blue' }
const STATUS_LABEL: Record<string, string> = { 'on-track': 'On Track', 'at-risk': 'At Risk', completed: 'Completed' }

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { page: 'dashboard', icon: '🏠', label: 'Dashboard' },
      { page: 'analytics', icon: '📊', label: 'Analytics' },
      { page: 'reports', icon: '📋', label: 'Reports' },
    ]
  },
  {
    title: 'People',
    items: [
      { page: 'interns', icon: '🎓', label: 'Interns', badge: 24 },
      { page: 'mentors', icon: '🧑‍🏫', label: 'Mentors' },
      { page: 'cohorts', icon: '👥', label: 'Cohorts' },
    ]
  },
  {
    title: 'Program',
    items: [
      { page: 'schedule', icon: '📅', label: 'Schedule' },
      { page: 'goals', icon: '🎯', label: 'Goals & KPIs' },
      { page: 'resources', icon: '📚', label: 'Resources' },
      { page: 'reviews', icon: '🏆', label: 'Reviews' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { page: 'messages', icon: '💬', label: 'Messages' },
      { page: 'notifications', icon: '🔔', label: 'Notifications', badge: 5 },
    ]
  },
  {
    title: 'System',
    items: [
      { page: 'announce', icon: '📣', label: 'Announcements' },
      { page: 'settings', icon: '⚙️', label: 'Settings' },
      { page: 'database', icon: '💾', label: 'Database Engine' },
    ]
  }
]

export default function ManagerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { messages: toasts, toast, remove } = useToast()

  const [activePage, setActivePage] = useState('dashboard')
  const [interns, setInterns] = useState<any[]>([])
  const [mentors, setMentors] = useState<any[]>([])
  const [alerts, setAlerts] = useState([1, 2, 3, 4])
  const API_URL = API_BASE_URL

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem('token') || ''
      try {
        const iRes = await fetch(`${API_URL}/api/users?role=intern`, { headers: { 'Authorization': `Bearer ${token}` } })
        const iData = await iRes.json()
        if (iData.success) setInterns(iData.users)
        
        const mRes = await fetch(`${API_URL}/api/users?role=mentor`, { headers: { 'Authorization': `Bearer ${token}` } })
        const mData = await mRes.json()
        if (mData.success) setMentors(mData.users)
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [API_URL])

  const [detailOpen, setDetailOpen] = useState(false)
  const [msgOpen, setMsgOpen] = useState(false)
  const [annOpen, setAnnOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [hasNotif, setHasNotif] = useState(true)
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null)

  // Database Engine state
  const [dbTables, setDbTables] = useState<string[]>([])
  const [dbQuery, setDbQuery] = useState('')
  const [dbResults, setDbResults] = useState<any[]>([])
  const [dbColumns, setDbColumns] = useState<string[]>([])
  const [dbError, setDbError] = useState('')
  const [dbLoading, setDbLoading] = useState(false)

  const [showPastInterns, setShowPastInterns] = useState(false)

  const handleDeactivateIntern = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this intern? They will be moved to past interns archive.')) return;
    try {
      const res = await fetch(`${API_URL}/api/users/deactivate/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        toast('Intern deactivated', 'success');
        // Refresh intern lists
        const iRes = await fetch(`${API_URL}/api/users?role=intern`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
        const iData = await iRes.json()
        if (iData.success) setInterns(iData.users)
      } else {
        toast(data.message, 'error');
      }
    } catch (err) {
      toast('Error deactivating intern', 'error');
    }
  }

  useEffect(() => {
    if (activePage === 'database') {
      fetch(`${API_URL}/api/admin/tables`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setDbTables(data.tables)
        }).catch(() => toast('Failed to load tables', 'error'))
    }
  }, [activePage, API_URL])

  const runQuery = async () => {
    if (!dbQuery) return
    setDbLoading(true); setDbError(''); setDbResults([]); setDbColumns([]);
    try {
      const res = await fetch(`${API_URL}/api/admin/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: dbQuery })
      })
      const data = await res.json()
      if (data.success) {
        if (data.results && data.results.length > 0) {
          setDbResults(data.results)
          setDbColumns(Object.keys(data.results[0]))
        } else {
          toast(data.message || 'Query executed successfully', 'success')
        }
      } else {
        setDbError(data.message)
      }
    } catch (err) {
      setDbError('Network error')
    } finally {
      setDbLoading(false)
    }
  }




  const dismissAlert = (id: number) => setAlerts(prev => prev.filter(a => a !== id))
  const dismissAll = () => { setAlerts([]); toast('All alerts dismissed', 'success') }

  const atRisk = interns.filter(i => i.status === 'at-risk').length
  const onTrack = interns.filter(i => i.status === 'on-track').length

  return (
    <div style={{ display: 'flex' }}>
      <div className="manager-sidebar-theme">
        <Sidebar
          activePage={activePage}
          onNav={page => {
            setActivePage(page)
            if (page === 'announce') setAnnOpen(true)
            if (page === 'settings') setSettingsOpen(true)
            if (page === 'notifications') { setNotifOpen(true); setHasNotif(false) }
          }}
          navSections={NAV_SECTIONS}
          brandSub="Admin & Manager Portal"
          accentClass="manager"
          onLogout={() => setLogoutOpen(true)}
        />
      </div>

      <main className="main manager-main">
        <div className="topbar">
          <div className="page-title">{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</div>
          <div className="topbar-right">
            <div className="date-chip">☀️ {today}</div>
            <button className="notif-btn manager-notif" onClick={() => { setNotifOpen(true); setHasNotif(false) }}>
              🔔{hasNotif && <span className="notif-dot" />}
            </button>
          </div>
        </div>

        <div className="content">
          {activePage === 'database' ? (
            <div className="card" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
              <div className="card-head">
                <h3>💾 Database Engine (SQLite)</h3>
              </div>
              <div className="card-body" style={{ flex: 1, display: 'flex', gap: '1rem', overflow: 'hidden', padding: '1rem' }}>
                <div style={{ width: '220px', borderRight: '1px solid #eee', overflowY: 'auto', paddingRight: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tables</h4>
                  {dbTables.map(t => (
                    <div key={t} style={{ padding: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '6px', marginBottom: '4px' }}
                         onClick={() => setDbQuery(`SELECT * FROM ${t} LIMIT 50;`)}
                         onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f4fb'}
                         onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      📋 <span style={{ fontWeight: 500 }}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <textarea 
                    value={dbQuery} 
                    onChange={e => setDbQuery(e.target.value)} 
                    style={{ width: '100%', height: '140px', padding: '1rem', fontFamily: '"Fira Code", monospace', fontSize: '0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none' }}
                    placeholder="Enter SQL query here (e.g. SELECT * FROM users;)"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn btn-violet" onClick={runQuery} disabled={dbLoading}>
                      {dbLoading ? 'Running...' : '▶ Run Query'}
                    </button>
                    {dbError && <span style={{ color: 'var(--red)', fontSize: '0.9rem', fontWeight: 600 }}>{dbError}</span>}
                  </div>
                  
                  {dbResults.length > 0 && (
                    <div style={{ flex: 1, overflow: 'auto', border: '1px solid #eee', borderRadius: '8px', background: '#fff' }}>
                      <table className="people-table" style={{ width: '100%', whiteSpace: 'nowrap' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                          <tr>{dbColumns.map(c => <th key={c}>{c}</th>)}</tr>
                        </thead>
                        <tbody>
                          {dbResults.map((r, i) => (
                            <tr key={i}>
                              {dbColumns.map(c => <td key={c}>{String(r[c])}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : activePage === 'announce' ? (
            <GenericDataPanel title="Announcements" table="announcements" roleFilter={true} columns={[{key: 'title', label: 'Announcement', type: 'text'}, {key: 'body', label: 'Message', type: 'textarea'}, {key: 'audience', label: 'Audience', type: 'select', options: ['all', 'interns', 'mentors']}]} />
          ) : activePage === 'messages' ? (
            <MessagesPanel />
          ) : activePage === 'interns' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-violet" onClick={() => setShowPastInterns(!showPastInterns)}>
                  {showPastInterns ? 'View Active Interns' : 'View Past Interns'}
                </button>
              </div>
              {showPastInterns ? (
                <GenericDataPanel 
                  title="Archive: Past Interns" 
                  table="past_interns" 
                  hideAdd={true}
                  columns={[
                    {key: 'first_name', label: 'First Name', type: 'text'}, 
                    {key: 'last_name', label: 'Last Name', type: 'text'}, 
                    {key: 'email', label: 'Email', type: 'text'},
                    {key: 'track', label: 'Track', type: 'text'},
                    {key: 'deactivated_at', label: 'Date Deactivated', type: 'text'}
                  ]} 
                />
              ) : (
                <GenericDataPanel 
                  title="System Users: Interns" 
                  table="users" 
                  hideAdd={true}
                  roleFilter={false} // The backend /api/users handles role filters better for this view
                  customAction={{
                    label: 'Deactivate',
                    onClick: handleDeactivateIntern,
                    color: '#ef4444'
                  }}
                  columns={[
                    {key: 'first_name', label: 'First Name', type: 'text'}, 
                    {key: 'last_name', label: 'Last Name', type: 'text'}, 
                    {key: 'email', label: 'Email', type: 'text'}
                  ]} 
                />
              )}
            </div>
          ) : activePage === 'mentors' ? (
            <GenericDataPanel 
              title="System Users: Mentors" 
              table="users" 
              hideAdd={true}
              columns={[
                {key: 'first_name', label: 'First Name', type: 'text'}, 
                {key: 'last_name', label: 'Last Name', type: 'text'}, 
                {key: 'email', label: 'Email', type: 'text'}
              ]} 
            />
          ) : activePage === 'add-user' ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              User addition is now handled via the public registration page.
            </div>
          ) : activePage === 'schedule' ? (
            <GenericDataPanel title="Schedule" table="schedule_events" roleFilter={true} columns={[{key: 'title', label: 'Title', type: 'text'}, {key: 'event_date', label: 'Date', type: 'date'}, {key: 'event_time', label: 'Time', type: 'time'}, {key: 'description', label: 'Details', type: 'textarea'}]} />
          ) : activePage === 'goals' ? (
            <GenericDataPanel title="Goals Templates" table="goals" roleFilter={true} columns={[{key: 'title', label: 'Goal', type: 'text'}, {key: 'due_date', label: 'Target Date', type: 'date'}]} />
          ) : activePage === 'resources' ? (
            <GenericDataPanel title="Learning Resources" table="resources" roleFilter={true} columns={[{key: 'title', label: 'Title', type: 'text'}, {key: 'type', label: 'Type', type: 'select', options: ['article', 'video', 'course', 'document']}, {key: 'url', label: 'URL', type: 'text'}]} />
          ) : activePage === 'reviews' ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Reviews module is under construction</div>
          ) : activePage === 'settings' ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Settings panel is under construction</div>
          ) : activePage === 'notifications' ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Notifications panel is under construction</div>
          ) : activePage === 'analytics' || activePage === 'reports' || activePage === 'cohorts' ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>This section is currently under development.</div>
          ) : (
            <>
              {/* WELCOME */}
          <div className="welcome-banner manager-welcome">
            <div className="welcome-text">
              <h1>Good morning, {user?.firstName}! 🚀</h1>
              <p>Cohort 4 is 50% through the program. {atRisk} interns need attention. Mid-term reviews start in 4 days.</p>
            </div>
            <div className="welcome-badges">
              <div className="w-badge"><div className="w-badge-val">{interns.length}</div><div className="w-badge-lbl">Active Interns</div></div>
              <div className="w-badge"><div className="w-badge-val">{mentors.length}</div><div className="w-badge-lbl">Mentors</div></div>
              <div className="w-badge"><div className="w-badge-val">Week 6</div><div className="w-badge-lbl">of 12 Program</div></div>
              <div className="w-badge"><div className="w-badge-val">78%</div><div className="w-badge-lbl">Avg Progress</div></div>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid manager-stats-grid">
            <div className="stat-card"><div className="stat-icon">🎓</div><div className="stat-val">{interns.length}</div><div className="stat-lbl">Total Interns</div><div className="stat-trend trend-up">↑ 2 joined this week</div></div>
            <div className="stat-card"><div className="stat-icon">🧑‍🏫</div><div className="stat-val">{mentors.length}</div><div className="stat-lbl">Active Mentors</div><div className="stat-trend trend-up">4:1 intern ratio</div></div>
            <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-val">187</div><div className="stat-lbl">Tasks Completed</div><div className="stat-trend trend-up">↑ 34 this week</div></div>
            <div className="stat-card"><div className="stat-icon">⚠️</div><div className="stat-val">{atRisk}</div><div className="stat-lbl">At-risk Interns</div><div className="stat-trend trend-warn">Need intervention</div></div>
            <div className="stat-card"><div className="stat-icon">⭐</div><div className="stat-val">4.5</div><div className="stat-lbl">Program Rating</div><div className="stat-trend trend-up">↑ 0.2 this cohort</div></div>
          </div>

          {/* TWO COL */}
          <div className="manager-two-col">
            {/* INTERN TABLE */}
            <div className="card">
              <div className="card-head">
                <h3>🎓 All Interns — Cohort 4</h3>
                <button className="see-all manager-see-all" onClick={() => toast('Exported!', 'success')}>⬇ Export</button>
              </div>
              <div className="card-body" style={{ padding: '0 1.4rem' }}>
                <table className="people-table">
                  <thead>
                    <tr>
                      <th>Intern</th><th>Track</th><th>Mentor</th><th>Progress</th><th>Status</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {interns.map(intern => (
                      <tr key={intern.id} onClick={() => { setSelectedIntern(intern); setDetailOpen(true) }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div className="avatar" style={{ background: (intern as any).gradient, width: 28, height: 28, fontSize: '0.65rem' }}>{intern.initials}</div>
                            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{intern.name}</span>
                          </div>
                        </td>
                        <td><span className="tag tag-blue">{intern.track}</span></td>
                        <td style={{ color: 'var(--muted)' }}>{intern.mentor}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 100 }}>
                            <div className="mini-bar" style={{ flex: 1 }}>
                              <div className="mini-fill" style={{ width: intern.progress + '%', background: intern.status === 'at-risk' ? 'var(--red)' : 'var(--green)' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy)' }}>{intern.progress}%</span>
                          </div>
                        </td>
                        <td><span className={`tag ${STATUS_COLOR[intern.status]}`}>{STATUS_LABEL[intern.status]}</span></td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelectedIntern(intern); setMsgOpen(true) }}>💬</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* ALERTS */}
              <div className="card">
                <div className="card-head"><h3>🚨 Alerts</h3><button className="see-all manager-see-all" onClick={dismissAll}>Dismiss All</button></div>
                <div className="card-body">
                  {alerts.length === 0 && <div className="empty-state"><div className="empty-icon">✅</div>No active alerts</div>}
                  {alerts.includes(1) && (
                    <div className="alert-item alert-red">
                      <div className="alert-icon">🔴</div>
                      <div className="alert-text">
                        <strong>Ryan Chen</strong> missed 3 check-ins. Immediate intervention needed.
                        <br />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <button className="btn btn-danger btn-sm" onClick={() => { dismissAlert(1); toast('Intervention assigned for Ryan Chen', 'warning') }}>Assign Intervention</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => dismissAlert(1)}>Dismiss</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {alerts.includes(2) && (
                    <div className="alert-item alert-amber">
                      <div className="alert-icon">🟡</div>
                      <div className="alert-text">
                        <strong>Daniel Kim</strong> is struggling with backend tasks.
                        <br />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { dismissAlert(2); toast('Mentor notified', 'success') }}>Notify Mentor</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => dismissAlert(2)}>Dismiss</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {alerts.includes(3) && (
                    <div className="alert-item alert-blue">
                      <div className="alert-icon">🔵</div>
                      <div className="alert-text"><strong>Mid-term reviews</strong> start March 12. 14 reviews pending. <button className="btn btn-ghost btn-sm" style={{ marginLeft: '0.5rem' }} onClick={() => dismissAlert(3)}>Dismiss</button></div>
                    </div>
                  )}
                  {alerts.includes(4) && (
                    <div className="alert-item alert-blue">
                      <div className="alert-icon">📋</div>
                      <div className="alert-text">
                        <strong>Intern Showcase</strong> March 25. Only 8/{interns.length} signed up.
                        <br />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { dismissAlert(4); toast('Reminders sent to all interns!', 'success') }}>Send Reminders</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* COHORT BY TRACK */}
              <div className="card">
                <div className="card-head"><h3>📊 Cohort by Track</h3></div>
                <div className="card-body">
                  <div className="cohort-ring">
                    {[
                      { label: 'Frontend Dev', count: interns.filter(i => i.track === 'Frontend Dev').length, color: '#2f7cf0' },
                      { label: 'Data Science', count: interns.filter(i => i.track === 'Data Science').length, color: '#0d9488' },
                      { label: 'Backend Dev', count: interns.filter(i => i.track === 'Backend Dev').length, color: '#6d28d9' },
                      { label: 'UX Design', count: interns.filter(i => i.track === 'UX Design' || i.track === 'UX/Design').length, color: '#f59e0b' },
                    ].map(t => (
                      <div key={t.label} className="cohort-row">
                        <div className="cohort-label">{t.label}</div>
                        <div className="cohort-bar-wrap">
                          <div className="cohort-bar" style={{ width: `${(t.count / interns.length) * 100}%`, background: t.color }} />
                        </div>
                        <div className="cohort-count" style={{ color: t.color }}>{t.count}</div>
                      </div>
                    ))}
                  </div>
                  <div className="kpi-mini">
                    <div className="kpi-item"><div className="kpi-val" style={{ color: 'var(--green)' }}>{onTrack}</div><div className="kpi-lbl">On Track</div></div>
                    <div className="kpi-item"><div className="kpi-val" style={{ color: 'var(--red)' }}>{atRisk}</div><div className="kpi-lbl">At Risk</div></div>
                    <div className="kpi-item"><div className="kpi-val" style={{ color: 'var(--amber)' }}>12</div><div className="kpi-lbl">Reviews Due</div></div>
                    <div className="kpi-item"><div className="kpi-val" style={{ color: 'var(--blue)' }}>6</div><div className="kpi-lbl">Mentors Active</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVITY FEED */}
          <div className="card">
            <div className="card-head"><h3>⚡ Recent Activity</h3><button className="see-all manager-see-all">Full Log →</button></div>
            <div className="card-body" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
              <div className="activity-grid">
                {ACTIVITY.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.5rem 0', borderBottom: '1px solid #f0f4fb' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: a.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', color: '#344e69' }}>{a.text}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      </main>

      <ToastContainer messages={toasts} onRemove={remove} />


      {/* MODAL: Intern Detail */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={selectedIntern ? `👤 ${selectedIntern.name}` : 'Intern Profile'} maxWidth="520px"
        footer={
          <>
            <button className="btn btn-danger btn-sm" onClick={() => handleDeactivateIntern(selectedIntern!.id)}>Deactivate Intern</button>
            <button className="btn btn-ghost" onClick={() => setDetailOpen(false)}>Close</button>
            <button className="btn btn-violet" onClick={() => { setDetailOpen(false); setMsgOpen(true) }}>💬 Message</button>
          </>
        }
      >
        {selectedIntern && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="avatar" style={{ background: (selectedIntern as any).gradient, width: 56, height: 56, fontSize: '1.1rem' }}>{selectedIntern.initials}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--navy)' }}>{selectedIntern.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{selectedIntern.track} · {selectedIntern.mentor}</div>
                <span className={`tag ${STATUS_COLOR[selectedIntern.status]}`}>{STATUS_LABEL[selectedIntern.status]}</span>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div className="progress-header"><span className="progress-label">Overall Progress</span><span className="progress-pct">{selectedIntern.progress}%</span></div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: selectedIntern.progress + '%', background: selectedIntern.status === 'at-risk' ? 'var(--red)' : 'var(--green)' }} /></div>
            </div>
            {selectedIntern.email && <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>📧 {selectedIntern.email}</div>}
          </div>
        )}
      </Modal>

      {/* MODAL: Message */}
      <Modal open={msgOpen} onClose={() => setMsgOpen(false)} title="💬 Send Message"
        footer={<><button className="btn btn-ghost" onClick={() => setMsgOpen(false)}>Cancel</button><button className="btn btn-violet" onClick={() => { setMsgOpen(false); toast('Message sent!', 'success') }}>Send</button></>}
      >
        <div className="form-group"><label className="form-label">To</label><input className="form-input" type="text" placeholder="Name or 'All Interns'" value={selectedIntern?.name || msgTo} onChange={e => setMsgTo(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Subject</label><input className="form-input" type="text" placeholder="Subject" value={msgSubj} onChange={e => setMsgSubj(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" rows={4} placeholder="Type your message…" value={msgBody} onChange={e => setMsgBody(e.target.value)} /></div>
      </Modal>

      {/* MODAL: Announcement */}
      <Modal open={annOpen} onClose={() => setAnnOpen(false)} title="📣 Post Announcement"
        footer={<><button className="btn btn-ghost" onClick={() => setAnnOpen(false)}>Cancel</button><button className="btn btn-violet" onClick={() => { setAnnOpen(false); toast('Announcement posted!', 'success') }}>Post Announcement</button></>}
      >
        <div className="form-group"><label className="form-label">Title</label><input className="form-input" type="text" placeholder="e.g., Mid-term Review Schedule" value={annTitle} onChange={e => setAnnTitle(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Audience</label>
          <select className="form-select" value={annAudience} onChange={e => setAnnAudience(e.target.value)}>
            <option value="all">All (Interns + Mentors)</option>
            <option value="interns">Interns Only</option>
            <option value="mentors">Mentors Only</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Message</label><textarea className="form-textarea" rows={4} placeholder="Announcement content…" value={annBody} onChange={e => setAnnBody(e.target.value)} /></div>
      </Modal>

      {/* MODAL: Settings */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="⚙️ Program Settings"
        footer={<><button className="btn btn-ghost" onClick={() => setSettingsOpen(false)}>Cancel</button><button className="btn btn-violet" onClick={() => { setSettingsOpen(false); toast('Settings saved!', 'success') }}>Save Settings</button></>}
      >
        <div className="form-group"><label className="form-label">Program Name</label><input className="form-input" type="text" defaultValue="Cohort 4 — Spring 2026" /></div>
        <div className="form-group"><label className="form-label">Program Duration (weeks)</label><input className="form-input" type="number" defaultValue={12} min={1} max={52} /></div>
        <div className="form-group"><label className="form-label">Max Intern-to-Mentor Ratio</label><input className="form-input" type="number" defaultValue={4} min={1} max={10} /></div>
        <div className="form-group"><label className="form-label">Check-in Frequency</label>
          <select className="form-select"><option>Weekly</option><option>Bi-weekly</option><option>Daily</option></select>
        </div>
      </Modal>

      {/* MODAL: Notifications */}
      <Modal open={notifOpen} onClose={() => setNotifOpen(false)} title="🔔 Notifications"
        footer={<button className="btn btn-primary btn-full" onClick={() => { setNotifOpen(false); toast('All cleared', 'success') }}>Mark All as Read</button>}
      >
        {[
          { color: '#ef4444', text: <><strong>Ryan Chen</strong> missed 3rd check-in this week.</>, time: '30 min ago' },
          { color: '#6d28d9', text: <><strong>Lena Schmidt</strong> joined Cohort 4.</>, time: 'Yesterday' },
          { color: '#2f7cf0', text: <><strong>Mid-term review</strong> window opens March 12.</>, time: '2 days ago' },
          { color: '#00c896', text: <><strong>Faith Okafor</strong> earned Consistent Performer badge.</>, time: '2 days ago' },
        ].map((n, i) => (
          <div key={i} className="announce-item">
            <div className="announce-dot" style={{ background: n.color }} />
            <div><div className="announce-text">{n.text}</div><div className="announce-date">{n.time}</div></div>
          </div>
        ))}
      </Modal>

      {/* MODAL: Logout */}
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Sign Out" maxWidth="360px"
        footer={<><button className="btn btn-ghost" onClick={() => setLogoutOpen(false)}>Stay</button><button className="btn btn-danger" onClick={handleLogout}>Sign Out</button></>}
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Are you sure you want to sign out?</p>
      </Modal>
    </div>
  )
}
