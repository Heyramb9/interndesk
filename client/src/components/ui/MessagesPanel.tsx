import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import API_BASE_URL from '../../apiConfig';
import Modal from './Modal';

export default function MessagesPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const API_URL = API_BASE_URL;
  
  const [inbox, setInbox] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [tab, setTab] = useState<'inbox'|'sent'>('inbox');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    try {
      const inboxRes = await fetch(`${API_URL}/api/messages/inbox`, { headers: { Authorization: `Bearer ${token}` } });
      const inboxData = await inboxRes.json();
      if (inboxData.success) setInbox(inboxData.messages);
      
      const sentRes = await fetch(`${API_URL}/api/messages/sent`, { headers: { Authorization: `Bearer ${token}` } });
      const sentData = await sentRes.json();
      if (sentData.success) setSent(sentData.messages);
    } catch (err) {}
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users.filter((u: any) => u.id !== user?.id));
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const handleSend = async () => {
    if (!composeTo || !composeBody) return toast('Please select recipient and write a message', 'error');
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: composeTo, subject: composeSubject, body: composeBody })
      });
      const data = await res.json();
      if (data.success) {
        toast('Message sent successfully', 'success');
        setComposeOpen(false);
        setComposeTo(''); setComposeSubject(''); setComposeBody('');
        fetchMessages();
      } else {
        toast(data.message, 'error');
      }
    } catch (err) {
      toast('Failed to send message', 'error');
    } finally {
      setLoading(false);
    }
  };

  const msgs = tab === 'inbox' ? inbox : sent;

  return (
    <div className="card" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>💬 Secure Messaging</h3>
        <button className="btn btn-violet" onClick={() => setComposeOpen(true)}>+ Compose Message</button>
      </div>
      <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.8rem' }}>
          <button style={{ fontSize: '1rem', fontWeight: tab === 'inbox' ? 600 : 400, background: 'none', border: 'none', cursor: 'pointer', color: tab === 'inbox' ? 'var(--violet)' : 'var(--muted)' }} onClick={() => setTab('inbox')}>Inbox ({inbox.length})</button>
          <button style={{ fontSize: '1rem', fontWeight: tab === 'sent' ? 600 : 400, background: 'none', border: 'none', cursor: 'pointer', color: tab === 'sent' ? 'var(--violet)' : 'var(--muted)' }} onClick={() => setTab('sent')}>Sent ({sent.length})</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {msgs.length === 0 ? <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '3rem' }}>No messages found in {tab}.</p> : msgs.map(m => (
            <div key={m.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #f0f4fb', borderRadius: '8px', marginBottom: '0.5rem', background: '#f8fafc' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: m.avatar_gradient || '#ccc', color: '#fff', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {m.first_name[0]}{m.last_name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#0f172a' }}>{m.first_name} {m.last_name}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <div style={{ fontWeight: m.is_read ? 'normal' : 600, color: '#334155', margin: '0.25rem 0', fontSize: '0.95rem' }}>{m.subject || '(No Subject)'}</div>
                <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.4' }}>{m.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="📝 Compose Message"
        footer={<><button className="btn btn-ghost" onClick={() => setComposeOpen(false)}>Cancel</button><button className="btn btn-violet" onClick={handleSend} disabled={loading}>{loading ? 'Sending...' : 'Send Message'}</button></>}
      >
        <div className="form-group">
          <label className="form-label">To: Recipient</label>
          <select className="form-select" value={composeTo} onChange={e => setComposeTo(e.target.value)}>
            <option value="">Select recipient...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Subject</label><input className="form-input" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} placeholder="Enter subject" /></div>
        <div className="form-group"><label className="form-label">Message Body</label><textarea className="form-textarea" rows={6} value={composeBody} onChange={e => setComposeBody(e.target.value)} placeholder="Type your message here..." style={{ resize: 'vertical' }} /></div>
      </Modal>
    </div>
  );
}
