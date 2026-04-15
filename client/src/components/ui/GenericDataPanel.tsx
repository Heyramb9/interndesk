import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../apiConfig';
import { useToast } from './Toast';
import Modal from './Modal';

export interface Column {
  key: string;
  label: string;
  type: 'text' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox';
  options?: string[];
  hidden?: boolean;
}

interface GenericDataPanelProps {
  title: string;
  table: string;
  columns: Column[];
  roleFilter?: boolean; 
  hideAdd?: boolean;
  customAction?: {
    label: string;
    onClick: (id: number) => void;
    color?: string;
  };
}

export default function GenericDataPanel({ title, table, columns, roleFilter, hideAdd, customAction }: GenericDataPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const API_URL = API_BASE_URL;
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const filterQuery = roleFilter ? (user?.role === 'intern' ? `?intern_id=${user?.id}` : `?user_id=${user?.id}`) : '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/data/${table}${filterQuery}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const js = await res.json();
      if (js.success) setData(js.data);
    } catch(err) {
      toast(`Failed to load ${title}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData() }, [table, filterQuery]);

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };
      if (roleFilter) {
        if (table === 'tasks' || table === 'journals' || table === 'goals' || table === 'skill_progress') payload.intern_id = user?.id;
        else if (table === 'schedule_events' || table === 'intern_profiles' || table === 'mentor_profiles') payload.user_id = user?.id;
        else if (table === 'resources' || table === 'announcements') payload.posted_by = user?.id;
      }
      
      const res = await fetch(`${API_URL}/api/data/${table}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      const js = await res.json();
      if (js.success) {
        toast(`${title} saved!`, 'success');
        setAddOpen(false);
        setFormData({});
        fetchData();
      } else {
        toast(js.message, 'error');
      }
    } catch(err) { toast('Error saving', 'error'); }
  };
  
  const handleToggleDone = async (item: any, doneField: string) => {
    try {
      await fetch(`${API_URL}/api/data/${table}/${item.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ [doneField]: item[doneField] ? 0 : 1 })
      });
      fetchData();
    } catch (err) {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      await fetch(`${API_URL}/api/data/${table}/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast('Deleted', 'success');
      fetchData();
    } catch (err) {}
  };

  const displayCols = columns.filter(c => !c.hidden);

  return (
    <div className="card" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {!hideAdd && (
          <button className="btn btn-violet" onClick={() => { setFormData({}); setAddOpen(true); }}>+ Add New</button>
        )}
      </div>
      <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {loading ? <p style={{ color: 'var(--muted)' }}>Loading...</p> : data.length === 0 ? <p style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '2rem' }}>No {title.toLowerCase()} recorded yet.</p> : (
          <table className="people-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
              <tr>
                {displayCols.map(c => <th key={c.key} style={{ padding: '0.75rem', color: 'var(--muted)' }}>{c.label}</th>)}
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {displayCols.map(c => (
                    <td key={c.key} style={{ padding: '0.75rem' }}>
                      {c.type === 'checkbox' ? (
                        <input type="checkbox" checked={!!row[c.key]} onChange={() => handleToggleDone(row, c.key)} />
                      ) : row[c.key]}
                    </td>
                  ))}
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {customAction ? (
                      <button 
                        className="btn btn-ghost btn-sm" 
                        onClick={() => customAction.onClick(row.id)} 
                        style={{ color: customAction.color || '#ef4444' }}
                      >
                        {customAction.label}
                      </button>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(row.id)} style={{ color: '#ef4444' }}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={`➕ Add ${title}`}
        footer={<><button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button><button className="btn btn-violet" onClick={handleSubmit}>Save</button></>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {columns.filter(c => !c.hidden && c.type !== 'checkbox').map(c => (
            <div key={c.key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">{c.label}</label>
              {c.type === 'textarea' ? (
                <textarea className="form-textarea" rows={3} value={formData[c.key] || ''} onChange={e => setFormData({ ...formData, [c.key]: e.target.value })} />
              ) : c.type === 'select' ? (
                <select className="form-select" value={formData[c.key] || ''} onChange={e => setFormData({ ...formData, [c.key]: e.target.value })}>
                  <option value="">Select...</option>
                  {c.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input className="form-input" type={c.type} value={formData[c.key] || ''} onChange={e => setFormData({ ...formData, [c.key]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
