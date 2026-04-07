import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import { Modal, ToastContainer, useToast, MessagesPanel, GenericDataPanel } from '../components/ui';
import { Task } from '../types'
import '../styles/intern-dashboard.css'

const INITIAL_TASKS: Task[] = [
  { id: 1, name: 'Complete onboarding checklist', done: true, due: 'Mar 5', priority: 'upcoming' },
  { id: 2, name: 'Submit weekly progress report', done: false, due: 'Today', priority: 'urgent' },
  { id: 3, name: 'Review PR #47 – Authentication module', done: false, due: 'Today', priority: 'in-progress' },
  { id: 4, name: 'Finish System Design Primer – Module 3', done: false, due: 'Mar 10', priority: 'learning' },
  { id: 5, name: 'Prepare for mentor check-in', done: false, due: 'Today', priority: 'upcoming' },
]

const NAV_SECTIONS = [
  {
    title: 'Main',
    items: [
      { page: 'dashboard', icon: '🏠', label: 'Dashboard' },
      { page: 'tasks', icon: '✅', label: 'My Tasks' },
      { page: 'schedule', icon: '📅', label: 'Schedule' },
      { page: 'progress', icon: '📊', label: 'Progress' },
    ]
  },
  {
    title: 'Learning',
    items: [
      { page: 'resources', icon: '📚', label: 'Resources' },
      { page: 'goals', icon: '🎯', label: 'Goals' },
      { page: 'journals', icon: '📝', label: 'Journals' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { page: 'messages', icon: '💬', label: 'Messages' },
      { page: 'mentor', icon: '👤', label: 'My Mentor' },
      { page: 'announcements', icon: '📣', label: 'Announcements' },
    ]
  }
]

const TAG_COLORS: Record<string, string> = {
  urgent: 'tag-red',
  'in-progress': 'tag-blue',
  upcoming: 'tag-amber',
  learning: 'tag-teal',
}
const TAG_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  'in-progress': 'In Progress',
  upcoming: 'Upcoming',
  learning: 'Learning',
}

export default function InternDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { messages: toasts, toast, remove: removeToast } = useToast()

  const [activePage, setActivePage] = useState('dashboard')
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(`intern_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  })
  
  useEffect(() => {
    localStorage.setItem(`intern_tasks`, JSON.stringify(tasks));
  }, [tasks]);
  const [notifOpen, setNotifOpen] = useState(false)
  const [hasNotif, setHasNotif] = useState(true)
  const [msgOpen, setMsgOpen] = useState(false)
  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [annOpen, setAnnOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const [msgSubject, setMsgSubject] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDue, setNewTaskDue] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('upcoming')
  const [schedTitle, setSchedTitle] = useState('')
  const [schedTime, setSchedTime] = useState('')
  const [schedDetail, setSchedDetail] = useState('')

  const [schedEvents, setSchedEvents] = useState([
    { time: '9:00 AM', title: 'Team Standup', sub: 'Google Meet · 15 min', color: '#2f7cf0' },
    { time: '11:00 AM', title: 'Code Review Session', sub: 'With Sarah Rodriguez · 45 min', color: '#f59e0b' },
    { time: '3:00 PM', title: 'Weekly Mentor Check-in', sub: 'Zoom · 30 min', color: '#00c896' },
    { time: '5:00 PM', title: 'Submit Progress Report', sub: 'Deadline · via Intern Desk', color: '#ef4444' },
  ])

  // Animate progress bars on mount
  const progressRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const fills = document.querySelectorAll('.progress-fill[data-target]')
      fills.forEach(el => {
        const target = (el as HTMLElement).dataset.target
        if (target) (el as HTMLElement).style.width = target + '%'
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [])

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const addTask = () => {
    if (!newTaskName.trim()) return
    setTasks(prev => [...prev, {
      id: Date.now(),
      name: newTaskName,
      done: false,
      due: newTaskDue || undefined,
      priority: newTaskPriority,
    }])
    setNewTaskName('')
    setNewTaskDue('')
    setNewTaskPriority('upcoming')
    setAddTaskOpen(false)
    toast('Task added successfully', 'success')
  }

  const sendMsg = () => {
    if (!msgSubject.trim() || !msgBody.trim()) return
    setMsgSubject('')
    setMsgBody('')
    setMsgOpen(false)
    toast('Message sent to Sarah Rodriguez', 'success')
  }

  const addSchedEvent = () => {
    if (!schedTitle.trim() || !schedTime.trim()) return
    const [h, m] = schedTime.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hr = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const timeStr = `${hr}:${m} ${ampm}`
    setSchedEvents(prev => [...prev, {
      time: timeStr,
      title: schedTitle,
      sub: schedDetail,
      color: '#2f7cf0',
    }])
    setSchedTitle('')
    setSchedTime('')
    setSchedDetail('')
    setScheduleOpen(false)
    toast('Event added to schedule', 'success')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const doneTasks = tasks.filter(t => t.done).length
  const pendingTasks = tasks.filter(t => !t.done).length

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ display: 'flex' }}>
      <div className="intern-sidebar-theme">
        <Sidebar
          activePage={activePage}
          onNav={setActivePage}
          navSections={NAV_SECTIONS}
          brandSub="Intern Portal"
          accentClass="intern"
          onLogout={() => setLogoutOpen(true)}
        />
      </div>

      <main className="main">
        <div className="topbar">
          <div className="page-title" id="page-title">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </div>
          <div className="topbar-right">
            <div className="date-chip">☀️ {today}</div>
            <button
              className="notif-btn intern-notif"
              onClick={() => { setNotifOpen(true); setHasNotif(false) }}
            >
              🔔
              {hasNotif && <span className="notif-dot" />}
            </button>
          </div>
        </div>

        <div className="content" ref={progressRef}>
          {activePage === 'dashboard' ? (
            <>
              {/* WELCOME */}
          <div className="welcome-banner intern-welcome">
            <div className="welcome-text">
              <h1>Good morning, {user?.firstName}! 👋</h1>
              <p>You have {pendingTasks} tasks pending and a check-in at 3:00 PM. Keep it up!</p>
            </div>
            <div className="welcome-badge-solo">
              <div className="badge-val">Week 6</div>
              <div className="badge-lbl">of 12-week program</div>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid intern-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-val">{doneTasks}</div>
              <div className="stat-lbl">Tasks Completed</div>
              <div className="stat-trend trend-up">↑ 3 this week</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-val">{pendingTasks}</div>
              <div className="stat-lbl">Tasks Pending</div>
              <div className="stat-trend trend-down">3 due today</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-val">82%</div>
              <div className="stat-lbl">Overall Progress</div>
              <div className="stat-trend trend-up">↑ 7% from last week</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-val">4.6</div>
              <div className="stat-lbl">Mentor Rating</div>
              <div className="stat-trend trend-up">Last review: excellent</div>
            </div>
          </div>

          {/* TWO COL */}
          <div className="intern-two-col">
            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* TASKS */}
              <div className="card">
                <div className="card-head">
                  <h3>📋 My Tasks</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAddTaskOpen(true)}>+ Add Task</button>
                </div>
                <div className="card-body" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
                  {tasks.map(task => (
                    <div key={task.id} className="task-item" onClick={() => toggleTask(task.id)}>
                      <div className={`task-check${task.done ? ' done' : ''}`}>
                        {task.done && '✓'}
                      </div>
                      <div className="task-info">
                        <div className={`task-name${task.done ? ' done-text' : ''}`}>{task.name}</div>
                        <div className="task-meta">
                          {task.due && <span className="task-due">📅 {task.due}</span>}
                          {task.priority && (
                            <span className={`tag ${TAG_COLORS[task.priority]}`}>
                              {TAG_LABELS[task.priority]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SKILL PROGRESS */}
              <div className="card">
                <div className="card-head">
                  <h3>📊 Skill Progress</h3>
                  <button className="see-all intern-see-all">Details →</button>
                </div>
                <div className="card-body">
                  {[
                    { label: 'Frontend Development', pct: 85, cls: '' },
                    { label: 'Backend / APIs', pct: 62, cls: '' },
                    { label: 'Communication & Soft Skills', pct: 78, cls: 'green' },
                    { label: 'Project Management', pct: 55, cls: 'amber' },
                  ].map(s => (
                    <div key={s.label} className="progress-wrap">
                      <div className="progress-header">
                        <span className="progress-label">{s.label}</span>
                        <span className="progress-pct">{s.pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill${s.cls ? ' ' + s.cls : ''}`}
                          style={{ width: 0 }}
                          data-target={s.pct}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* MENTOR */}
              <div className="mentor-card">
                <div className="mentor-card-label">Your Mentor</div>
                <div className="mentor-row">
                  <div className="mentor-avatar">SR</div>
                  <div>
                    <div className="mentor-name">Sarah Rodriguez</div>
                    <div className="mentor-title">Senior Software Engineer</div>
                    <div className="mentor-status">
                      <span className="status-dot" />
                      Available now
                    </div>
                  </div>
                </div>
                <button className="btn btn-blue btn-full" onClick={() => setMsgOpen(true)}>💬 Send Message</button>
              </div>

              {/* SCHEDULE */}
              <div className="card">
                <div className="card-head">
                  <h3>📅 Today's Schedule</h3>
                  <button className="see-all intern-see-all" onClick={() => setScheduleOpen(true)}>+ Add</button>
                </div>
                <div className="card-body" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
                  {schedEvents.map((ev, i) => (
                    <div key={i} className="sched-item">
                      <div className="sched-time">{ev.time}</div>
                      <div className="sched-dot" style={{ background: ev.color }} />
                      <div>
                        <div className="sched-title">{ev.title}</div>
                        <div className="sched-sub">{ev.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ANNOUNCEMENTS */}
              <div className="card">
                <div className="card-head">
                  <h3>📣 Announcements</h3>
                  <button className="see-all intern-see-all" onClick={() => setAnnOpen(true)}>All →</button>
                </div>
                <div className="card-body" style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
                  {[
                    { text: <><strong>Mid-term reviews</strong> start March 12. Please update your goal tracker.</>, date: 'Mar 6, 2026', color: '#2f7cf0' },
                    { text: <><strong>Intern Showcase</strong> event March 25. Sign-up deadline: March 15.</>, date: 'Mar 4, 2026', color: '#00c896' },
                    { text: <>New learning resources: <strong>System Design Primer</strong> series.</>, date: 'Mar 1, 2026', color: '#f59e0b' },
                  ].map((a, i) => (
                    <div key={i} className="announce-item">
                      <div className="announce-dot" style={{ background: a.color }} />
                      <div>
                        <div className="announce-text">{a.text}</div>
                        <div className="announce-date">{a.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </>
          ) : activePage === 'messages' ? (
            <MessagesPanel />
          ) : activePage === 'tasks' ? (
            <GenericDataPanel title="My Tasks" table="tasks" roleFilter={true} columns={[{key: 'name', label: 'Name', type: 'text'}, {key: 'due_date', label: 'Due Date', type: 'date'}, {key: 'priority', label: 'Priority', type: 'select', options: ['urgent', 'in-progress', 'upcoming', 'learning']}, {key: 'is_done', label: 'Done', type: 'checkbox'}]} />
          ) : activePage === 'schedule' ? (
            <GenericDataPanel title="Schedule" table="schedule_events" roleFilter={true} columns={[{key: 'title', label: 'Title', type: 'text'}, {key: 'event_date', label: 'Date', type: 'date'}, {key: 'event_time', label: 'Time', type: 'time'}, {key: 'description', label: 'Details', type: 'textarea'}]} />
          ) : activePage === 'goals' ? (
            <GenericDataPanel title="Goals" table="goals" roleFilter={true} columns={[{key: 'title', label: 'Goal', type: 'text'}, {key: 'due_date', label: 'Target Date', type: 'date'}, {key: 'is_completed', label: 'Done', type: 'checkbox'}]} />
          ) : activePage === 'journals' ? (
            <GenericDataPanel title="Journals" table="journals" roleFilter={true} columns={[{key: 'title', label: 'Title', type: 'text'}, {key: 'week_number', label: 'Week', type: 'text'}, {key: 'content', label: 'Entry', type: 'textarea'}]} />
          ) : activePage === 'resources' ? (
            <GenericDataPanel title="Learning Resources" table="resources" columns={[{key: 'title', label: 'Title', type: 'text'}, {key: 'type', label: 'Type', type: 'select', options: ['article', 'video', 'course', 'document']}, {key: 'url', label: 'URL', type: 'text'}]} />
          ) : activePage === 'announce' ? (
            <GenericDataPanel title="Announcements" table="announcements" columns={[{key: 'title', label: 'Announcement', type: 'text'}, {key: 'body', label: 'Message', type: 'textarea'}, {key: 'audience', label: 'Audience', type: 'select', options: ['all', 'interns', 'mentors']}]} />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>This section is currently under development.</div>
          )}
        </div>
      </main>

      {/* TOASTS */}
      <ToastContainer messages={toasts} onRemove={removeToast} />

      {/* MODAL: Send Message */}
      <Modal
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
        title="💬 Message Sarah Rodriguez"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setMsgOpen(false)}>Cancel</button>
            <button className="btn btn-blue" onClick={sendMsg}>Send Message</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input className="form-input" type="text" placeholder="e.g., Question about PR #47" value={msgSubject} onChange={e => setMsgSubject(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea className="form-textarea" rows={4} placeholder="Type your message…" value={msgBody} onChange={e => setMsgBody(e.target.value)} />
        </div>
      </Modal>

      {/* MODAL: Add Task */}
      <Modal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        title="➕ Add New Task"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAddTaskOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={addTask}>Add Task</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Task Name</label>
          <input className="form-input" type="text" placeholder="e.g., Review PR #50" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input className="form-input" type="date" value={newTaskDue} onChange={e => setNewTaskDue(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value as Task['priority'])}>
            <option value="upcoming">Upcoming</option>
            <option value="urgent">Urgent</option>
            <option value="in-progress">In Progress</option>
            <option value="learning">Learning</option>
          </select>
        </div>
      </Modal>

      {/* MODAL: Add Schedule Event */}
      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        title="📅 Add Schedule Event"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setScheduleOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={addSchedEvent}>Add Event</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Event Title</label>
          <input className="form-input" type="text" placeholder="e.g., 1:1 with mentor" value={schedTitle} onChange={e => setSchedTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Time</label>
          <input className="form-input" type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Details</label>
          <input className="form-input" type="text" placeholder="e.g., Zoom · 30 min" value={schedDetail} onChange={e => setSchedDetail(e.target.value)} />
        </div>
      </Modal>

      {/* MODAL: Notifications */}
      <Modal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="🔔 Notifications"
        footer={
          <button className="btn btn-primary btn-full" onClick={() => { setNotifOpen(false); toast('All notifications cleared', 'success') }}>
            Mark All as Read
          </button>
        }
      >
        <div style={{ padding: '0 0 0.5rem' }}>
          {[
            { color: '#ef4444', text: <><strong>Task Overdue:</strong> Submit weekly progress report.</>, time: 'Just now' },
            { color: '#2f7cf0', text: <><strong>Mentor message:</strong> Sarah left feedback on your latest commit.</>, time: '1 hr ago' },
            { color: '#00c896', text: <><strong>Progress update:</strong> You hit 85% on Frontend Development!</>, time: '3 hrs ago' },
          ].map((n, i) => (
            <div key={i} className="announce-item">
              <div className="announce-dot" style={{ background: n.color }} />
              <div>
                <div className="announce-text">{n.text}</div>
                <div className="announce-date">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* MODAL: All Announcements */}
      <Modal
        open={annOpen}
        onClose={() => setAnnOpen(false)}
        title="📣 All Announcements"
        maxWidth="540px"
        footer={<button className="btn btn-ghost" onClick={() => setAnnOpen(false)}>Close</button>}
      >
        <div style={{ padding: '0 0 0.5rem' }}>
          {[
            { text: <><strong>Mid-term reviews</strong> start March 12. Please update your goal tracker.</>, date: 'Mar 6, 2026', color: '#2f7cf0' },
            { text: <><strong>Intern Showcase</strong> event on March 25. Sign-up deadline: March 15.</>, date: 'Mar 4, 2026', color: '#00c896' },
            { text: <>New learning resources: <strong>System Design Primer</strong> series.</>, date: 'Mar 1, 2026', color: '#f59e0b' },
            { text: <>Office hours with <strong>Program Manager</strong> every Friday 4–5 PM.</>, date: 'Feb 28, 2026', color: '#7c3aed' },
          ].map((a, i) => (
            <div key={i} className="announce-item">
              <div className="announce-dot" style={{ background: a.color }} />
              <div>
                <div className="announce-text">{a.text}</div>
                <div className="announce-date">{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* MODAL: Logout */}
      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Sign Out"
        maxWidth="360px"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setLogoutOpen(false)}>Stay</button>
            <button className="btn btn-danger" onClick={handleLogout}>Sign Out</button>
          </>
        }
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Are you sure you want to sign out of Intern Desk?</p>
      </Modal>
    </div>
  )
}
