import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ROLES = [
  { value: 'hq_admin',       label: 'HQ Admin',    sub: 'Full control',     icon: 'HQ', tone: 'rose' },
  { value: 'hospital_staff', label: 'Hospital',    sub: 'Log consumption',  icon: 'HP', tone: 'sage' },
  { value: 'vendor',         label: 'Vendor',      sub: 'Track shipments',  icon: 'VN', tone: 'blue' },
];
const REDIRECT = { hq_admin: '/admin', hospital_staff: '/hospital', vendor: '/vendor' };

const toneMap = {
  rose: { accent: 'var(--rose)', soft: 'rgba(191, 77, 90, 0.08)', border: 'rgba(191, 77, 90, 0.22)' },
  sage: { accent: 'var(--sage)', soft: 'rgba(111, 141, 132, 0.08)', border: 'rgba(111, 141, 132, 0.22)' },
  blue: { accent: 'var(--blue)', soft: 'rgba(115, 144, 168, 0.08)', border: 'rgba(115, 144, 168, 0.22)' },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('hq_admin');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { ...form, role });
      login(data); navigate(REDIRECT[data.role]);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-shell login-page surface-grid">
      <div className="login-grid">
        <section className="panel panel--soft login-brand fade-up">
          <div>
            <div className="section-eyebrow">Healthcare supply operations</div>
            <h1>Drug Inventory System</h1>
            <p>
              A calm control surface for hospitals, headquarters, and vendors. The interface now focuses on clarity, hierarchy, and professional medical branding.
            </p>

            <div className="login-brand__panel">
              <div className="login-feature">
                <span>Inventory</span>
                <strong>Stock visibility</strong>
                <p>See quantities, critical limits, and safe status cues at a glance.</p>
              </div>
              <div className="login-feature">
                <span>Workflow</span>
                <strong>Operational flow</strong>
                <p>Orders, consumption, shipment tracking, and audit trails remain connected.</p>
              </div>
              <div className="login-feature">
                <span>Audience</span>
                <strong>Role-specific access</strong>
                <p>Clear entry points for HQ, hospital staff, and vendors.</p>
              </div>
              <div className="login-feature">
                <span>Visual tone</span>
                <strong>Healthcare first</strong>
                <p>Warm white surfaces, muted rose accents, and no glowing effects.</p>
              </div>
            </div>
          </div>

          <div className="login-brand__footnote mono">
            Designed for a professional healthcare setting, with restrained color and strong readability.
          </div>
        </section>

        <section className="panel login-card fade-up-1">
          <div className="login-card__header">
            <div>
              <div className="section-eyebrow">Secure sign in</div>
              <h2>Choose your workspace</h2>
              <p>Pick a role, enter your credentials, and continue to the relevant dashboard.</p>
            </div>
            <div className="login-chip">Protected access</div>
          </div>

          <div className="role-grid">
            {ROLES.map((r) => {
              const selected = role === r.value;
              const tone = toneMap[r.tone];

              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`role-card ${selected ? 'role-card--active' : ''}`}
                  style={{
                    background: selected ? tone.soft : 'var(--bg-secondary)',
                    borderColor: selected ? tone.border : 'var(--border)',
                  }}
                >
                  <div className="role-card__badge" style={selected ? { color: '#fff', background: tone.accent } : undefined}>
                    {r.icon}
                  </div>
                  <div className="role-card__title">{r.label}</div>
                  <p className="role-card__note">{r.sub}</p>
                </button>
              );
            })}
          </div>

          <div className="helper-copy mono">Credentials</div>

          <form onSubmit={submit} className="form-stack">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                value={form.email}
                placeholder="admin@hospital.com"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="field"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                value={form.password}
                placeholder="••••••••"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="field"
              />
            </div>

            {error && (
              <div className="alert-card" style={{
                alignItems: 'center',
                background: 'rgba(191, 77, 90, 0.08)',
                borderColor: 'rgba(191, 77, 90, 0.22)',
                color: 'var(--rose-strong)',
              }}>
                <span style={{ fontWeight: 800 }}>Access issue</span>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="primary-button" style={{ width: '100%', marginTop: 2, opacity: loading ? 0.78 : 1 }}>
              {loading ? 'Authenticating…' : 'Sign in to dashboard'}
            </button>
          </form>

          <div style={{ marginTop: 18, color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }} className="mono">
            The login flow is unchanged. Only the interface has been restyled for a cleaner healthcare look.
          </div>
        </section>
      </div>
    </div>
  );
}