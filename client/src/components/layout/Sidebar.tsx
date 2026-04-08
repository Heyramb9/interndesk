

type NavItem = {
  page: string;
  icon: string;
  label: string;
  badge?: number;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

interface SidebarProps {
  activePage: string;
  onNav: (page: string) => void;
  navSections: NavSection[];
  brandSub: string;
  accentClass: string;
  onLogout: () => void;
}

export default function Sidebar({
  activePage,
  onNav,
  navSections,
  brandSub,
  accentClass,
  onLogout
}: SidebarProps) {
  return (
    <aside className={`sidebar ${accentClass}-sidebar`} style={{ width: '250px', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid #eaeaea', backgroundColor: '#fff', color: '#334155' }}>
      <div className="brand" style={{ padding: '1.5rem', borderBottom: '1px solid #eaeaea' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--navy, #0f172a)' }}>Intern Desk</h2>
        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{brandSub}</div>
      </div>

      <div className="nav-container" style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
        {navSections.map((section, idx) => (
          <div key={idx} className="nav-section" style={{ marginBottom: '1.5rem' }}>
            <div className="nav-section-title" style={{ padding: '0 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              {section.title}
            </div>
            {section.items.map((item, i) => {
              const isActive = activePage === item.page;
              return (
                <div
                  key={i}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onNav(item.page)}
                  style={{
                    padding: '0.6rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: isActive ? 'var(--primary, #2f7cf0)' : '#475569',
                    backgroundColor: isActive ? 'var(--primary-light, #f0f4fb)' : 'transparent',
                    borderRight: isActive ? '3px solid var(--primary, #2f7cf0)' : '3px solid transparent',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ marginRight: '0.75rem', fontSize: '1.25rem' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge !== undefined && (
                    <span style={{
                      backgroundColor: 'var(--red, #ef4444)',
                      color: 'white',
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '99px',
                      fontWeight: 600
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-footer" style={{ padding: '1.5rem', borderTop: '1px solid #eaeaea' }}>
        <button
          className="btn-logout"
          onClick={onLogout}
          style={{
            width: '100%',
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'color 0.2s'
          }}
        >
          <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
