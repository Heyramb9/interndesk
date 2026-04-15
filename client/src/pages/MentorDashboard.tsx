import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import { Modal, ToastContainer, useToast, MessagesPanel, GenericDataPanel } from '../components/ui';
import '../styles/mentor-dashboard.css'

const INTERNS = [
  { id: 1, name: 'Alex Johnson', initials: 'AJ', track: 'Frontend Dev', progress: 82, gradient: 'linear-gradient(135deg,#2f7cf0,#8b5cf6)', status: 'on-track' },
  { id: 2, name: 'Maya Patel', initials: 'MP', track: 'Data Science', progress: 91, gradient: 'linear-gradient(135deg,#10b981,#3b82f6)', status: 'on-track' },
  { id: 3, name: 'Ryan Chen', initials: 'RC', track: 'Backend Dev', progress: 34, gradient: 'linear-gradient(135deg,#ef4444,#f59e0b)', status: 'at-risk' },
  { id: 4, name: 'Priya Singh', initials: 'PS', track: 'UX Design', progress: 67, gradient: 'linear-gradient(135deg,#6d28d9,#2f7cf0)', status: 'on-track' },
]

const REVIEWS = [
  { name: 'Alex Johnson', due: 'Due Mar 12', note: 'Mid-term performance review. Focus on code quality and communication.' },
  { name: 'Maya Patel', due: 'Due Mar 12', note: 'Review ML project milestone. She is ahead of schedule.' },
  { name: 'Ryan Chen', due: 'Due Mar 10', note: 'Urgent — discuss missed check-ins and progress gaps.' },
]

const MESSAGES = [
  { initials: 'AJ', name: 'Alex Johnson', preview: 'Question about PR #47 review…', time: '10 min', unread: true, gradient: 'linear-gradient(135deg,#2f7cf0,#8b5cf6)' },
  { initials: 'MP', name: 'Maya Patel', preview: 'Submitted my week 5 journal ✓', time: '2 hrs', unread: false, gradient: 'linear-gradient(135deg,#10b981,#3b82f6)' },
  { initials: 'PS', name: 'Priya Singh', preview: 'Can we reschedule tomorrow\'s call?', time: 'Yesterday', unread: true, gradient: 'linear-gradient(135deg,#6d28d9,#2f7cf0)' },
]

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { page: 'dashboard', icon: '🏠', label: 'Dashboard' },
      { page: 'interns', icon: '👥', label: 'My Interns', badge: INTERNS.length },
      { page: 'reviews', icon: '📝', label: 'Reviews', badge: REVIEWS.length },
    ]
  },
  {
    title: 'Communication',
    items: [
      { page: 'messages', icon: '💬', label: 'Messages' },
      { page: 'schedule', icon: '📅', label: 'Schedule' },
      { page: 'resources', icon: '📚', label: 'Resources' },
    ]
  },
  {
    title: 'System',
    items: [
      { page: 'notifications', icon: '🔔', label: 'Notifications', badge: 3 },
      { page: 'settings', icon: '⚙️', label: 'Settings' },
    ]
  }
]

export default function MentorDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { messages: toasts, toast, remove } = useToast()

  const [activePage, setActivePage] = useState('dashboard')
  const [notifOpen, setNotifOpen] = useState(false)
  const [hasNotif, setHasNotif] = useState(true)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [msgOpen, setMsgOpen] = useState(false)
  const [, setSelectedIntern] = useState<typeof INTERNS[0] | null>(null)
  const [sessionOpen, setSessionOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackIntern, setFeedbackIntern] = useState('')

  const handleLogout = () => { logout(); navigate('/login') }
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const openFeedback = (name: string) => {
    setFeedbackIntern(name)
    setFeedbackOpen(true)
  }

  return (
    <div style={{ display: 'flex' }}>
      <div className="mentor-sidebar-theme">
        <Sidebar
          activePage={activePage}
          onNav={setActivePage}
          navSections={NAV_SECTIONS}
          brandSub="Mentor Portal"
          accentClass="mentor"
          onLogout={() => setLogoutOpen(true)}
        />
      </div>

      <main className="main mentor-main">
        <div className="topbar">
          <div className="page-title">{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</div>
          <div className="topbar-right">
            <div className="date-chip">☀️ {today}</div>
            <button className="notif-btn mentor-notif" onClick={() => { setNotifOpen(true); setHasNotif(false) }}>
              🔔{hasNotif && <span className="notif-dot" />}
            </button>
          </div>
        </div>

        <div className="content">
          {activePage === 'dashboard' ? (
            <>
              {/* WELCOME */}
          <div className="welcome-banner mentor-welcome">
            <div className="welcome-text">
              <h1>Good morning, {user?.firstName}! 🎓</h1>
              <p>You have {REVIEWS.length} reviews pending and 3 unread messages from your interns.</p>
            </div>
            <div className="welcome-badges">
              <div className="w-badge"><div className="w-badge-val">{INTERNS.length}</div><div className="w-badge-lbl">My Interns</div></div>
              <div className="w-badge"><div className="w-badge-val">{REVIEWS.length}</div><div className="w-badge-lbl">Reviews Due</div></div>
              <div className="w-badge"><div className="w-badge-val">Week 6</div><div className="w-badge-lbl">of 12 Program</div></div>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid mentor-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-val">{INTERNS.length}</div>
              <div className="stat-lbl">Active Interns</div>
              <div className="stat-trend trend-up">All engaged this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-val">{REVIEWS.length}</div>
              <div className="stat-lbl">Reviews Pending</div>
              <div className="stat-trend trend-down">Mid-term due Mar 12</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-val">78%</div>
              <div className="stat-lbl">Avg Progress</div>
              <div className="stat-trend trend-up">↑ 5% this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-val">4.8</div>
              <div className="stat-lbl">Mentor Rating</div>
              <div className="stat-trend trend-up">Top 10% of mentors</div>
            </div>
          </div>

          {/* TWO COL */}
          <div className="mentor-two-col">
            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* INTERNS */}
              <div className="card">
                <div className="card-head">
                  <h3>👥 My Interns</h3>
                  <button className="see-all mentor-see-all">View All →</button>
                </div>
                <div className="card-body" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
                  {INTERNS.map(intern => (
                    <div key={intern.id} className="intern-item">
                      <div className="intern-av" style={{ background: intern.gradient }}>{intern.initials}</div>
                      <div style={{ flex: 1 }}>
                        <div className="intern-name">{intern.name}</div>
                        <div className="intern-track">{intern.track}</div>
                      </div>
                      <div className="intern-prog" style={{ maxWidth: 120 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span className="prog-txt" style={{ color: intern.status === 'at-risk' ? 'var(--red)' : 'var(--teal)' }}>
                            {intern.progress}%
                          </span>
                          <span className={`tag ${intern.status === 'at-risk' ? 'tag-red' : 'tag-teal'}`}>
                            {intern.status === 'at-risk' ? 'At Risk' : 'On Track'}
                          </span>
                        </div>
                        <div className="mini-bar">
                          <div className="mini-fill" style={{
                            width: intern.progress + '%',
                            background: intern.status === 'at-risk' ? 'var(--red)' : 'var(--teal)'
                          }} />
                        </div>
                      </div>
                      <button className="btn btn-teal btn-sm" style={{ marginLeft: '0.5rem' }} onClick={() => openFeedback(intern.name)}>
                        Feedback
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* REVIEWS */}
              <div className="card">
                <div className="card-head">
                  <h3>📝 Pending Reviews</h3>
                  <button className="see-all mentor-see-all">All Reviews →</button>
                </div>
                <div className="card-body" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
                  {REVIEWS.map((r, i) => (
                    <div key={i} className="review-item">
                      <div className="review-header">
                        <span className="review-name">{r.name}</span>
                        <span className="tag tag-amber">{r.due}</span>
                        <span className="review-due" />
                      </div>
                      <div className="review-note">{r.note}</div>
                      <button className="btn btn-teal btn-sm" style={{ marginTop: '0.5rem' }} onClick={() => toast(`Review started for ${r.name}`, 'success')}>
                        Start Review
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* QUICK ACTIONS */}
              <div className="card">
                <div className="card-head"><h3>⚡ Quick Actions</h3></div>
                <div className="card-body">
                  <div className="action-grid">
                    <button className="action-btn" onClick={() => setSessionOpen(true)}>
                      <span className="a-icon">📹</span>
                      Schedule Session
                    </button>
                    <button className="action-btn" onClick={() => setMsgOpen(true)}>
                      <span className="a-icon">💬</span>
                      Message Intern
                    </button>
                    <button className="action-btn" onClick={() => toast('Resource uploaded!', 'success')}>
                      <span className="a-icon">📤</span>
                      Share Resource
                    </button>
                    <button className="action-btn" onClick={() => toast('Report generated!', 'success')}>
                      <span className="a-icon">📊</span>
                      Progress Report
                    </button>
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="card">
                <div className="card-head"><h3>💬 Messages</h3><button className="see-all mentor-see-all">All →</button></div>
                <div className="card-body" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
                  {MESSAGES.map((msg, i) => (
                    <div key={i} className={`msg-item${msg.unread ? ' msg-unread' : ''}`} onClick={() => { setSelectedIntern(null); setMsgOpen(true) }}>
                      <div className="intern-av" style={{ background: msg.gradient, width: 32, height: 32, fontSize: '0.75rem' }}>
                        {msg.initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: msg.unread ? 700 : 500, color: 'var(--navy)' }}>{msg.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.preview}</div>
                      </div>
                      <span className="msg-time">{msg.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AVAILABILITY */}
              <div className="card">
                <div className="card-head"><h3>🗓 My Availability</h3></div>
                <div className="card-body">
                  {[
                    { day: 'Monday', slots: '10am–12pm, 3–5pm', open: true },
                    { day: 'Wednesday', slots: '2pm–4pm', open: true },
                    { day: 'Friday', slots: 'Fully booked', open: false },
                  ].map((av, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < 2 ? '1px solid #f0f5f4' : 'none' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>{av.day}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{av.slots}</div>
                      </div>
                      <span className={`tag ${av.open ? 'tag-teal' : 'tag-red'}`}>{av.open ? 'Open' : 'Full'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </>
          ) : activePage === 'messages' ? (
            <MessagesPanel />
          ) : activePage === 'interns' ? (
            <GenericDataPanel title="My Assigned Interns" table="intern_profiles" roleFilter={true} hideAdd={true} columns={[{key: 'track', label: 'Track', type: 'text'}, {key: 'status', label: 'Status', type: 'select', options: ['on-track', 'at-risk', 'ahead']}, {key: 'progress', label: 'Progress (%)', type: 'text'}]} />
          ) : activePage === 'schedule' ? (
            <GenericDataPanel title="Schedule" table="schedule_events" roleFilter={true} columns={[{key: 'title', label: 'Title', type: 'text'}, {key: 'event_date', label: 'Date', type: 'date'}, {key: 'event_time', label: 'Time', type: 'time'}, {key: 'description', label: 'Details', type: 'textarea'}]} />
          ) : activePage === 'resources' ? (
            <GenericDataPanel title="Learning Resources" table="resources" columns={[{key: 'title', label: 'Title', type: 'text'}, {key: 'type', label: 'Type', type: 'select', options: ['article', 'video', 'course', 'document']}, {key: 'url', label: 'URL', type: 'text'}]} />
          ) : activePage === 'reviews' ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Reviews module is under construction</div>
          ) : activePage === 'settings' ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Settings panel is under construction</div>
          ) : activePage === 'notifications' ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>Notifications panel is under construction</div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>This section is currently under development.</div>
          )}
        </div>
      </main>

      <ToastContainer messages={toasts} onRemove={remove} />

      {/* MODAL: Message */}
      <Modal
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
        title="💬 Send Message"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setMsgOpen(false)}>Cancel</button>
            <button className="btn btn-teal" onClick={() => { setMsgOpen(false); toast('Message sent!', 'success') }}>Send</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">To</label>
          <select className="form-select">
            {INTERNS.map(i => <option key={i.id}>{i.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input className="form-input" type="text" placeholder="Subject…" />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-textarea" rows={4} placeholder="Type your message…" />
        </div>
      </Modal>

      {/* MODAL: Schedule Session */}
      <Modal
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        title="📹 Schedule Session"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setSessionOpen(false)}>Cancel</button>
            <button className="btn btn-teal" onClick={() => { setSessionOpen(false); toast('Session scheduled!', 'success') }}>Schedule</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Intern</label>
          <select className="form-select">{INTERNS.map(i => <option key={i.id}>{i.name}</option>)}</select>
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" />
        </div>
        <div className="form-group">
          <label className="form-label">Time</label>
          <input className="form-input" type="time" />
        </div>
        <div className="form-group">
          <label className="form-label">Platform</label>
          <select className="form-select">
            <option>Google Meet</option>
            <option>Zoom</option>
            <option>Microsoft Teams</option>
          </select>
        </div>
      </Modal>

      {/* MODAL: Feedback */}
      <Modal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title={`📝 Feedback — ${feedbackIntern}`}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setFeedbackOpen(false)}>Cancel</button>
            <button className="btn btn-teal" onClick={() => { setFeedbackOpen(false); setFeedbackText(''); toast('Feedback submitted!', 'success') }}>Submit</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Overall Rating</label>
          <select className="form-select">
            <option>⭐⭐⭐⭐⭐ Excellent</option>
            <option>⭐⭐⭐⭐ Good</option>
            <option>⭐⭐⭐ Average</option>
            <option>⭐⭐ Needs Improvement</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Feedback Notes</label>
          <textarea className="form-textarea" rows={5} placeholder="Detailed feedback…" value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
        </div>
      </Modal>

      {/* MODAL: Notifications */}
      <Modal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="🔔 Notifications"
        footer={<button className="btn btn-teal btn-full" onClick={() => { setNotifOpen(false); toast('Cleared', 'success') }}>Mark All as Read</button>}
      >
        {[
          { color: '#ef4444', text: <><strong>Ryan Chen</strong> missed 3rd check-in.</>, time: '30 min ago' },
          { color: '#0d9488', text: <><strong>Maya Patel</strong> submitted week 5 journal.</>, time: '1 hr ago' },
          { color: '#2f7cf0', text: <><strong>Mid-term review</strong> window opens March 12.</>, time: '2 days ago' },
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
