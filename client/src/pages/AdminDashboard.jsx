import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

const TABS = [
  { id:'inventory',  label:'Inventory',     icon:'◈' },
  { id:'orders',     label:'Supply Orders',  icon:'⬡' },
  { id:'notifs',     label:'Alerts',         icon:'⚑' },
  { id:'audit',      label:'Audit Log',      icon:'≡' },
];

const Tag = ({ children, color='cyan' }) => {
  const colors = {
    cyan:    { bg:'var(--cyan-glow)',    border:'rgba(6,182,212,0.3)',    text:'var(--cyan)' },
    red:     { bg:'var(--red-dim)',      border:'rgba(239,68,68,0.3)',     text:'#fca5a5' },
    amber:   { bg:'var(--amber-dim)',    border:'rgba(245,158,11,0.3)',    text:'#fcd34d' },
    emerald: { bg:'var(--emerald-dim)',  border:'rgba(16,185,129,0.3)',    text:'#6ee7b7' },
    blue:    { bg:'rgba(115,144,168,0.10)', border:'rgba(115,144,168,0.22)', text:'var(--blue)' },
    gray:    { bg:'rgba(255,255,255,0.04)', border:'var(--border)',        text:'var(--text-secondary)' },
  };
  const c = colors[color];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:600,
      background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>
      {children}
    </span>
  );
};

const StatCard = ({ label, value, icon, color, delay }) => {
  const colors = {
    cyan:    'var(--cyan)',
    red:     'var(--red)',
    amber:   'var(--amber)',
    emerald: 'var(--emerald)',
  };
  return (
    <div className={`fade-up-${delay}`} style={{
      background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16,
      padding:'20px 24px', position:'relative', overflow:'hidden',
      transition:'border-color .2s, transform .2s',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.borderColor=colors[color]; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
    >
      <div style={{ position:'absolute', top:0, right:0, width:80, height:80, borderRadius:'0 0 0 80px',
        background:`radial-gradient(circle at top right, ${colors[color]}15, transparent 70%)` }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <span style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize:18, opacity:0.6 }}>{icon}</span>
      </div>
      <div style={{ fontSize:36, fontWeight:700, color: colors[color], lineHeight:1 }}>{value}</div>
    </div>
  );
};

const inputStyle = {
  background:'var(--bg-secondary)', border:'1px solid var(--border)', color:'var(--text-primary)',
  borderRadius:10, padding:'10px 14px', fontSize:13, outline:'none', width:'100%',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('inventory');
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [audit, setAudit] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [drugForm, setDrugForm] = useState({ drugName:'', category:'', currentLevel:'', criticalLimit:'', unit:'units' });
  const [msg, setMsg] = useState({ text:'', type:'' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [s,o,n,a] = await Promise.all([API.get('/stock'), API.get('/orders'), API.get('/notifications'), API.get('/audit')]);
      setStock(s.data); setOrders(o.data); setNotifs(n.data); setAudit(a.data);
    } catch(e){ console.error(e); }
  };

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3500); };

  const addDrug = async (e) => {
    e.preventDefault();
    try {
      await API.post('/stock', { ...drugForm, currentLevel:+drugForm.currentLevel, criticalLimit:+drugForm.criticalLimit });
      flash('Drug added to inventory.'); setShowAdd(false);
      setDrugForm({ drugName:'', category:'', currentLevel:'', criticalLimit:'', unit:'units' });
      fetchAll();
    } catch(err){ flash(err.response?.data?.message||'Failed.','error'); }
  };

  const deleteDrug = async (id) => {
    if(!window.confirm('Delete this drug?')) return;
    await API.delete(`/stock/${id}`); fetchAll();
  };

  const assignVendor = async (orderId, vendorId) => {
    try {
      await API.put(`/orders/${orderId}/assign`, { vendorId });
      flash('Vendor assigned successfully.'); fetchAll();
    } catch(err){ flash(err.response?.data?.message||'Failed.','error'); }
  };

  const markRead = async (id) => { await API.put(`/notifications/${id}/read`); fetchAll(); };

  const criticalCount = stock.filter(s=>s.currentLevel<=s.criticalLimit).length;
  const unreadCount = notifs.filter(n=>!n.isRead).length;
  const pendingCount = orders.filter(o=>o.status==='Pending').length;

  const statusColor = (s) => ({ Pending:'amber', Confirmed:'cyan', 'In-Transit':'blue', 'Out-for-Delivery':'blue', Delivered:'emerald' }[s]||'gray');

  return (
    <div className="app-shell surface-grid" style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      <Navbar title="HQ Admin" subtitle="DRUG INVENTORY SYSTEM" />

      <div className="page-shell page-shell--wide">
        <section className="panel hero-banner fade-up" style={{ marginBottom: 24 }}>
          <div>
            <div className="section-eyebrow">Headquarters overview</div>
            <h1>Clinical supply control, simplified.</h1>
            <p>
              A calmer admin workspace for inventory, orders, alerts, and audit history. The structure now emphasizes readability and operations instead of visual noise.
            </p>
          </div>

          <div className="hero-kpis">
            <div className="hero-kpi">
              <span>Total drugs</span>
              <strong>{stock.length}</strong>
            </div>
            <div className="hero-kpi">
              <span>Critical stock</span>
              <strong>{criticalCount}</strong>
            </div>
            <div className="hero-kpi">
              <span>Pending orders</span>
              <strong>{pendingCount}</strong>
            </div>
            <div className="hero-kpi">
              <span>Unread alerts</span>
              <strong>{unreadCount}</strong>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
          <StatCard delay={1} label="Total Drugs"     value={stock.length}   icon="💊" color="cyan" />
          <StatCard delay={2} label="Critical Stock"  value={criticalCount}  icon="⚠" color="red" />
          <StatCard delay={3} label="Pending Orders"  value={pendingCount}   icon="📋" color="amber" />
          <StatCard delay={4} label="Unread Alerts"   value={unreadCount}    icon="🔔" color="emerald" />
        </div>

        {/* Flash message */}
        {msg.text && (
          <div style={{
            marginBottom:16, borderRadius:12, padding:'12px 16px', fontSize:13, display:'flex', justifyContent:'space-between',
            background: msg.type==='error' ? 'var(--red-dim)' : 'var(--emerald-dim)',
            border: `1px solid ${msg.type==='error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            color: msg.type==='error' ? '#fca5a5' : '#6ee7b7',
          }}>
            <span>{msg.text}</span>
            <button onClick={()=>setMsg({text:'',type:''})} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', fontSize:14 }}>✕</button>
          </div>
        )}

        {/* Tab bar */}
        <div className="soft-tabbar" style={{ marginBottom:24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`soft-tab ${tab===t.id ? 'soft-tab--active' : ''}`} style={{ display:'flex', alignItems:'center', gap:7 }}>
              <span>{t.icon}</span> {t.label}
              {t.id==='notifs' && unreadCount>0 && (
                <span className="badge badge--rose" style={{ marginLeft: 2, padding: '1px 6px', fontSize: 10 }}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* INVENTORY */}
        {tab==='inventory' && (
          <div className="panel fade-up" style={{ overflow:'hidden' }}>
            <div className="panel-header">
              <div>
                <h2 className="section-title">Drug Inventory</h2>
                <div className="section-subtitle mono" style={{ marginTop: 2 }}>{stock.length} records · MongoDB Atlas</div>
              </div>
              <button onClick={()=>setShowAdd(!showAdd)} className={showAdd ? 'danger-button' : 'primary-button'} style={{ padding:'9px 18px', fontSize:13 }}>
                {showAdd ? '✕ Cancel' : '+ Add Drug'}
              </button>
            </div>

            {showAdd && (
              <form onSubmit={addDrug} style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', background:'rgba(191,77,90,0.03)', display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
                {[['drugName','Drug Name','text'],['category','Category','text'],['currentLevel','Current Stock','number'],['criticalLimit','Critical Limit','number'],['unit','Unit','text']].map(([k,ph,tp])=>(
                  <input key={k} type={tp} placeholder={ph} required value={drugForm[k]}
                    onChange={e=>setDrugForm({...drugForm,[k]:e.target.value})}
                    className="field"
                    onFocus={e=>e.target.style.borderColor='var(--rose)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}
                  />
                ))}
                <button type="submit" className="primary-button" style={{ gridColumn:'1/-1', width:'auto', padding:'11px' }}>
                  Save Drug to Database
                </button>
              </form>
            )}

            <table className="table-shell">
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Drug Name','Category','Current Stock','Critical Limit','Status','Action'].map(h=>(
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stock.map((drug,i)=>{
                  const crit = drug.currentLevel<=drug.criticalLimit;
                  return (
                    <tr key={drug._id} style={{ borderBottom:'1px solid rgba(26,39,64,0.6)', transition:'background .15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card-hover)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'14px 20px', fontWeight:600, color:'var(--text-primary)' }}>{drug.drugName}</td>
                      <td style={{ padding:'14px 20px', color:'var(--text-secondary)' }}>{drug.category}</td>
                      <td style={{ padding:'14px 20px' }}>
                        <span className="mono" style={{ color: crit ? 'var(--red)' : 'var(--text-primary)', fontWeight:600 }}>{drug.currentLevel}</span>
                        <span style={{ color:'var(--text-muted)', fontSize:11, marginLeft:4 }}>{drug.unit}</span>
                      </td>
                      <td style={{ padding:'14px 20px', color:'var(--text-secondary)' }} className="mono">{drug.criticalLimit}</td>
                      <td style={{ padding:'14px 20px' }}>
                        <Tag color={crit?'red':'emerald'}>{crit?'⚠ Critical':'✓ Normal'}</Tag>
                      </td>
                      <td style={{ padding:'14px 20px' }}>
                        <button onClick={()=>deleteDrug(drug._id)} style={{
                          padding:'5px 12px', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer',
                          background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5',
                          transition:'all .2s',
                        }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
                {stock.length===0&&<tr><td colSpan={6} className="empty-state">No drugs in inventory. Add one above.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS */}
        {tab==='orders' && (
          <div className="panel fade-up" style={{ overflow:'hidden' }}>
            <div className="panel-header">
              <div>
                <h2 className="section-title">Supply Orders</h2>
                <div className="section-subtitle mono" style={{ marginTop:2 }}>Auto-generated purchase orders · {orders.length} total</div>
              </div>
            </div>
            <table className="table-shell">
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Drug','Quantity','Status','Vendor','Date','Assign Vendor ID'].map(h=>(
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o=>(
                  <tr key={o._id} style={{ borderBottom:'1px solid rgba(26,39,64,0.6)', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'14px 20px', fontWeight:600 }}>{o.drugId?.drugName||'—'}</td>
                    <td style={{ padding:'14px 20px' }} className="mono">{o.quantity}</td>
                    <td style={{ padding:'14px 20px' }}><Tag color={statusColor(o.status)}>{o.status}</Tag></td>
                    <td style={{ padding:'14px 20px', color:'var(--text-secondary)' }}>{o.fulfilledBy?.companyName||<span style={{color:'var(--text-muted)',fontStyle:'italic'}}>Unassigned</span>}</td>
                    <td style={{ padding:'14px 20px', color:'var(--text-muted)', fontSize:12 }} className="mono">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding:'14px 20px' }}>
                      {o.status==='Pending'&&(
                        <input type="text" placeholder="Paste vendor _id → Enter"
                          className="field"
                          style={{ width:200 }}
                          onBlur={e=>e.target.style.borderColor='var(--border)'}
                          onKeyDown={e=>{ if(e.key==='Enter'&&e.target.value.trim()){ assignVendor(o._id,e.target.value.trim()); e.target.value=''; }}}
                        />
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length===0&&<tr><td colSpan={6} className="empty-state">No supply orders yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* ALERTS */}
        {tab==='notifs' && (
          <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {notifs.length===0&&<div className="panel empty-state">No notifications yet.</div>}
            {notifs.map(n=>(
              <div key={n._id} className={`alert-card ${n.isRead ? '' : 'alert-card--warm'}`}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                    background: n.isRead ? 'var(--bg-secondary)' : 'var(--amber-dim)', border:`1px solid ${n.isRead?'var(--border)':'rgba(191,133,84,0.3)'}` }}>
                    {n.isRead ? '✓' : '⚑'}
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight: n.isRead?400:600, color: n.isRead?'var(--text-secondary)':'var(--text-primary)' }}>{n.message}</div>
                    <div className="mono" style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                {!n.isRead&&(
                  <button onClick={()=>markRead(n._id)} className="secondary-button" style={{ padding:'6px 14px', fontSize:12, whiteSpace:'nowrap', color:'var(--amber)', background:'var(--amber-dim)', borderColor:'rgba(191,133,84,0.25)' }}>Mark Read</button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AUDIT */}
        {tab==='audit' && (
          <div className="panel fade-up" style={{ overflow:'hidden' }}>
            <div className="panel-header">
              <div>
                <h2 className="section-title">System Audit Log</h2>
                <div className="section-subtitle mono" style={{ marginTop:2 }}>Full action trail · last {audit.length} entries</div>
              </div>
            </div>
            <table className="table-shell">
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Action','Role','Description','Timestamp'].map(h=>(
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {audit.map(log=>(
                  <tr key={log._id} style={{ borderBottom:'1px solid rgba(26,39,64,0.6)', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <td style={{ padding:'12px 20px' }}><Tag color="cyan">{log.action}</Tag></td>
                    <td style={{ padding:'12px 20px', color:'var(--text-secondary)', fontSize:12 }} className="mono">{log.userRole}</td>
                    <td style={{ padding:'12px 20px', color:'var(--text-secondary)', maxWidth:400 }}>{log.description}</td>
                    <td style={{ padding:'12px 20px', color:'var(--text-muted)', fontSize:12 }} className="mono">{new Date(log.performedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {audit.length===0&&<tr><td colSpan={4} className="empty-state">No audit entries yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}