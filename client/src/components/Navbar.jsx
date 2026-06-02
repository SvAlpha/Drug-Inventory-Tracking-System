import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLES = {
  hq_admin:       { label: 'HQ Admin',       color: 'var(--rose)',   icon: 'HQ' },
  hospital_staff: { label: 'Hospital Staff', color: 'var(--sage)',   icon: 'HP' },
  vendor:         { label: 'Vendor',         color: 'var(--blue)',   icon: 'VN' },
};

export default function Navbar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleInfo = ROLES[user?.role] || {};

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      margin: '18px 18px 0',
      padding: '14px 18px',
      backdropFilter: 'blur(16px)',
      background: 'rgba(255, 250, 248, 0.88)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 900,
            letterSpacing: '0.1em',
            color: '#fff',
            background: 'linear-gradient(180deg, var(--rose) 0%, var(--rose-strong) 100%)',
          }}>
            DI
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            {subtitle && <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.08em' }}>{subtitle}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="badge badge--sage" style={{ padding: '6px 11px' }}>
            <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }} />
            Active session
          </div>

          <div className="badge" style={{
            padding: '6px 11px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--border)',
          }}>
            <span style={{ color: roleInfo.color, fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' }}>{roleInfo.icon}</span>
            {roleInfo.label}
          </div>

          <button onClick={handleLogout} className="danger-button" style={{ padding: '9px 14px', fontSize: 12 }}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}