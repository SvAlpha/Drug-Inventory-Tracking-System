import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

const Tag = ({ children, color='cyan' }) => {
  const colors = {
    cyan:    { bg:'rgba(191,77,90,0.10)',   border:'rgba(191,77,90,0.22)',    text:'var(--rose)' },
    red:     { bg:'rgba(184,90,102,0.10)',  border:'rgba(184,90,102,0.22)',   text:'var(--rose-strong)' },
    amber:   { bg:'rgba(191,133,84,0.10)',  border:'rgba(191,133,84,0.22)',   text:'var(--amber)' },
    emerald: { bg:'rgba(111,141,132,0.10)', border:'rgba(111,141,132,0.22)',  text:'var(--sage)' },
    blue:    { bg:'rgba(115,144,168,0.10)', border:'rgba(115,144,168,0.22)',  text:'var(--blue)' },
  };
  const c = colors[color]||colors.cyan;
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:600, background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>{children}</span>;
};

const TABS = ['Stock','Log Consumption','My Logs','Deliveries'];

export default function HospitalDashboard() {
  const [tab, setTab] = useState('Stock');
  const [stock, setStock] = useState([]);
  const [myLogs, setMyLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ drugId:'', quantityConsumed:'' });
  const [msg, setMsg] = useState({ text:'', type:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    try {
      const [s,l,o] = await Promise.all([API.get('/stock'), API.get('/consume/my'), API.get('/orders')]);
      setStock(s.data); setMyLogs(l.data); setOrders(o.data);
    } catch(e){ console.error(e); }
  };

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3500); };

  const logConsumption = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await API.post('/consume', { drugId:form.drugId, quantityConsumed:+form.quantityConsumed });
      flash(`✓ Logged. Stock now: ${data.stockLevelAfter} units.${data.criticalAlert?' ⚠ Auto PO generated.':''}`);
      setForm({ drugId:'', quantityConsumed:'' }); fetchAll();
    } catch(err){ flash(err.response?.data?.message||'Failed.','error'); }
    finally{ setLoading(false); }
  };

  const acknowledge = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status:'Delivered', note:'Acknowledged by hospital staff.' });
      flash('✓ Delivery acknowledged. Stock replenished.'); fetchAll();
    } catch(err){ flash(err.response?.data?.message||'Failed.','error'); }
  };

  const inp = { background:'var(--bg-secondary)', border:'1px solid var(--border)', color:'var(--text-primary)', borderRadius:12, padding:'12px 16px', fontSize:14, outline:'none', width:'100%' };

  return (
    <div className="app-shell surface-grid" style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      <Navbar title="Hospital Staff" subtitle="CONSUMPTION & DELIVERY PORTAL" />
      <div className="page-shell">

        <section className="panel hero-banner fade-up" style={{ marginBottom: 24 }}>
          <div>
            <div className="section-eyebrow">Hospital operations</div>
            <h1>Log, track, and receive with less friction.</h1>
            <p>
              The workflow is unchanged, but the interface is softer, clearer, and more aligned with a modern healthcare product.
            </p>
          </div>

          <div className="hero-kpis">
            <div className="hero-kpi">
              <span>Available drugs</span>
              <strong>{stock.length}</strong>
            </div>
            <div className="hero-kpi">
              <span>Usage logs</span>
              <strong>{myLogs.length}</strong>
            </div>
            <div className="hero-kpi">
              <span>Active deliveries</span>
              <strong>{orders.filter(o=>['Confirmed','In-Transit','Out-for-Delivery'].includes(o.status)).length}</strong>
            </div>
            <div className="hero-kpi">
              <span>Current mode</span>
              <strong>Ward flow</strong>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
          {[
            { label:'Available Drugs',  value:stock.length,                                          color:'var(--rose)', icon:'RX' },
            { label:'My Usage Logs',    value:myLogs.length,                                         color:'var(--sage)', icon:'LG' },
            { label:'Active Deliveries',value:orders.filter(o=>['Confirmed','In-Transit','Out-for-Delivery'].includes(o.status)).length, color:'var(--amber)', icon:'TR' },
          ].map((s,i)=>(
            <div key={s.label} className={`fade-up-${i+1}`} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, right:0, width:70, height:70, borderRadius:'0 0 0 70px', background:`radial-gradient(circle at top right, ${s.color}15, transparent 70%)` }}/>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:10 }}>{s.label}</div>
              <div style={{ fontSize:36, fontWeight:700, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Flash */}
        {msg.text && (
          <div style={{ marginBottom:16, borderRadius:12, padding:'12px 16px', fontSize:13, display:'flex', justifyContent:'space-between',
            background:msg.type==='error'?'var(--red-dim)':'var(--emerald-dim)',
            border:`1px solid ${msg.type==='error'?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'}`,
            color:msg.type==='error'?'#fca5a5':'#6ee7b7' }}>
            <span>{msg.text}</span>
            <button onClick={()=>setMsg({text:'',type:''})} style={{ background:'none',border:'none',cursor:'pointer',color:'inherit' }}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div className="soft-tabbar" style={{ marginBottom:24 }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`soft-tab ${tab===t ? 'soft-tab--active' : ''}`}>{t}</button>
          ))}
        </div>

        {/* STOCK */}
        {tab==='Stock' && (
          <div className="panel fade-up" style={{ overflow:'hidden' }}>
            <div className="panel-header">
              <div>
                <h2 className="section-title">Live Inventory</h2>
                <div className="section-subtitle mono" style={{ marginTop:2 }}>Read-only view · {stock.length} drugs</div>
              </div>
            </div>
            <table className="table-shell">
              <thead><tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Drug Name','Category','Available Stock','Status'].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {stock.map(drug=>{
                  const crit = drug.currentLevel<=drug.criticalLimit;
                  return (
                    <tr key={drug._id} style={{ borderBottom:'1px solid rgba(26,39,64,0.6)', transition:'background .15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card-hover)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'14px 20px', fontWeight:600 }}>{drug.drugName}</td>
                      <td style={{ padding:'14px 20px', color:'var(--text-secondary)' }}>{drug.category}</td>
                      <td style={{ padding:'14px 20px' }}>
                        <span className="mono" style={{ color:crit?'var(--red)':'var(--text-primary)', fontWeight:600 }}>{drug.currentLevel}</span>
                        <span style={{ color:'var(--text-muted)', fontSize:11, marginLeft:4 }}>{drug.unit}</span>
                      </td>
                      <td style={{ padding:'14px 20px' }}><Tag color={crit?'red':'emerald'}>{crit?'⚠ Low Stock':'✓ In Stock'}</Tag></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* LOG */}
        {tab==='Log Consumption' && (
          <div className="fade-up" style={{ maxWidth:480 }}>
            <div className="panel" style={{ padding:28 }}>
              <div className="section-title" style={{ marginBottom:4 }}>Log Drug Consumption</div>
              <div className="section-subtitle mono" style={{ marginBottom:24 }}>
                This triggers the automated supply chain flow.
              </div>
              <form onSubmit={logConsumption} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:8 }}>Select Drug</div>
                  <select required value={form.drugId} onChange={e=>setForm({...form,drugId:e.target.value})}
                    style={{ ...inp, appearance:'none' }}
                    onFocus={e=>e.target.style.borderColor='var(--rose)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}
                  >
                    <option value="">— Select a drug —</option>
                    {stock.map(d=><option key={d._id} value={d._id}>{d.drugName} ({d.currentLevel} {d.unit} available)</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:8 }}>Quantity Used</div>
                  <input type="number" min="1" required value={form.quantityConsumed} placeholder="e.g. 50"
                    onChange={e=>setForm({...form,quantityConsumed:e.target.value})} style={inp}
                    onFocus={e=>e.target.style.borderColor='var(--rose)'}
                    onBlur={e=>e.target.style.borderColor='var(--border)'}
                  />
                </div>
                <div style={{ background:'rgba(191,77,90,0.06)', border:'1px solid rgba(191,77,90,0.2)', borderRadius:12, padding:'12px 16px', fontSize:12, color:'var(--rose)' }}>
                  ℹ If stock drops below critical limit, a notification and purchase order will be automatically generated.
                </div>
                <button type="submit" disabled={loading} className="primary-button" style={{ opacity: loading ? 0.8 : 1 }}>
                  {loading ? '⟳ Logging…' : 'Submit Consumption →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MY LOGS */}
        {tab==='My Logs' && (
          <div className="panel fade-up" style={{ overflow:'hidden' }}>
            <div className="panel-header">
              <div>
                <h2 className="section-title">My Consumption History</h2>
                <div className="section-subtitle mono" style={{ marginTop:2 }}>{myLogs.length} entries</div>
              </div>
            </div>
            <table className="table-shell">
              <thead><tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['Drug','Qty Used','Stock After','Date'].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {myLogs.map(log=>(
                  <tr key={log._id} style={{ borderBottom:'1px solid rgba(26,39,64,0.6)', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-card-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'14px 20px', fontWeight:600 }}>{log.drugId?.drugName}</td>
                    <td style={{ padding:'14px 20px' }} className="mono">{log.quantityConsumed}</td>
                    <td style={{ padding:'14px 20px' }} className="mono">{log.stockLevelAfter}</td>
                    <td style={{ padding:'14px 20px', color:'var(--text-muted)', fontSize:12 }} className="mono">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {myLogs.length===0&&<tr><td colSpan={4} className="empty-state">No logs yet. Use Log Consumption tab.</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* DELIVERIES */}
        {tab==='Deliveries' && (
          <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {orders.filter(o=>['Confirmed','In-Transit','Out-for-Delivery'].includes(o.status)).map(order=>(
              <div key={order._id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:'var(--blue-dim)', border:'1px solid rgba(115,144,168,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>TR</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{order.drugId?.drugName}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>
                      Qty: {order.quantity} · Vendor: {order.fulfilledBy?.companyName||'Not assigned'}
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Tag color="blue">{order.status}</Tag>
                  {order.status==='Out-for-Delivery'&&(
                    <button onClick={()=>acknowledge(order._id)} style={{
                      padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', border:'none',
                      background:'var(--sage)', color:'#fff',
                      boxShadow:'none',
                    }}>✓ Acknowledge Receipt</button>
                  )}
                </div>
              </div>
            ))}
            {orders.filter(o=>['Confirmed','In-Transit','Out-for-Delivery'].includes(o.status)).length===0&&(
              <div className="panel empty-state">No active deliveries.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}