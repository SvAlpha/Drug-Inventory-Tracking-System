import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../api/axios';

const STATUS_FLOW = ['Confirmed','In-Transit','Out-for-Delivery','Delivered'];

const statusColor = (s) => ({
  Pending:'gray', Confirmed:'cyan', 'In-Transit':'amber', 'Out-for-Delivery':'blue', Delivered:'emerald'
}[s]||'gray');

const colors = {
  cyan:    { bg:'rgba(191,77,90,0.10)',   border:'rgba(191,77,90,0.22)',    text:'var(--rose)' },
  red:     { bg:'rgba(184,90,102,0.10)',  border:'rgba(184,90,102,0.22)',   text:'var(--rose-strong)' },
  amber:   { bg:'rgba(191,133,84,0.10)',  border:'rgba(191,133,84,0.22)',   text:'var(--amber)' },
  emerald: { bg:'rgba(111,141,132,0.10)', border:'rgba(111,141,132,0.22)',  text:'var(--sage)' },
  blue:    { bg:'rgba(115,144,168,0.10)', border:'rgba(115,144,168,0.22)',  text:'var(--blue)' },
  gray:    { bg:'rgba(255,255,255,0.4)', border:'var(--border)',            text:'var(--text-secondary)' },
};
const Tag = ({ children, color='cyan' }) => {
  const c = colors[color]||colors.gray;
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:600, background:c.bg, border:`1px solid ${c.border}`, color:c.text }}>{children}</span>;
};

export default function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [msg, setMsg] = useState({ text:'', type:'' });
  const [updating, setUpdating] = useState('');

  useEffect(()=>{ fetchOrders(); },[]);
  const fetchOrders = async ()=>{
    try{ const { data }=await API.get('/orders'); setOrders(data); }
    catch(e){ console.error(e); }
  };

  const flash=(text,type='success')=>{ setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3500); };

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await API.put(`/orders/${orderId}/status`, { status, note:`Status updated to ${status}` });
      flash(`Order marked as ${status}.`);
      fetchOrders();
      if(selectedOrder?._id===orderId) fetchTimeline(orderId);
    } catch(err){ flash(err.response?.data?.message||'Failed.','error'); }
    finally{ setUpdating(''); }
  };

  const fetchTimeline = async (orderId) => {
    try{
      const { data }=await API.get(`/shipment/${orderId}`);
      setTimeline(data.timeline); setSelectedOrder(data.order);
    } catch(e){ console.error(e); }
  };

  const getNext = (s) => { const i=STATUS_FLOW.indexOf(s); return i<STATUS_FLOW.length-1?STATUS_FLOW[i+1]:null; };

  const active = orders.filter(o=>o.status!=='Delivered');
  const delivered = orders.filter(o=>o.status==='Delivered');

  return (
    <div className="app-shell surface-grid" style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      <Navbar title="Vendor Portal" subtitle="SHIPMENT MANAGEMENT" />
      <div className="page-shell">

        <section className="panel hero-banner fade-up" style={{ marginBottom: 24 }}>
          <div>
            <div className="section-eyebrow">Vendor shipment view</div>
            <h1>Track fulfillment with clearer state changes.</h1>
            <p>
              The tracking workflow is the same, but the presentation is calmer and easier to scan across a busy operations team.
            </p>
          </div>

          <div className="hero-kpis">
            <div className="hero-kpi">
              <span>Active orders</span>
              <strong>{active.length}</strong>
            </div>
            <div className="hero-kpi">
              <span>Delivered</span>
              <strong>{delivered.length}</strong>
            </div>
            <div className="hero-kpi">
              <span>Total assigned</span>
              <strong>{orders.length}</strong>
            </div>
            <div className="hero-kpi">
              <span>Current mode</span>
              <strong>Dispatch</strong>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
          {[
            { label:'Active Orders',  value:active.length,    color:'var(--amber)', icon:'PO' },
            { label:'Delivered',      value:delivered.length, color:'var(--sage)', icon:'DL' },
            { label:'Total Assigned', value:orders.length,    color:'var(--rose)', icon:'AS'  },
          ].map((s,i)=>(
            <div key={s.label} className={`fade-up-${i+1}`} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:'20px 24px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, right:0, width:70, height:70, borderRadius:'0 0 0 70px', background:`radial-gradient(circle at top right, ${s.color}15, transparent 70%)` }}/>
              <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--text-muted)', marginBottom:10 }}>{s.label}</div>
              <div style={{ fontSize:36, fontWeight:700, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Flash */}
        {msg.text&&(
          <div style={{ marginBottom:16, borderRadius:12, padding:'12px 16px', fontSize:13, display:'flex', justifyContent:'space-between',
            background:msg.type==='error'?'var(--red-dim)':'var(--emerald-dim)',
            border:`1px solid ${msg.type==='error'?'rgba(239,68,68,0.3)':'rgba(16,185,129,0.3)'}`,
            color:msg.type==='error'?'#fca5a5':'#6ee7b7' }}>
            <span>{msg.text}</span>
            <button onClick={()=>setMsg({text:'',type:''})} style={{ background:'none',border:'none',cursor:'pointer',color:'inherit' }}>✕</button>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* Orders panel */}
          <div className="panel fade-up" style={{ overflow:'hidden' }}>
            <div className="panel-header">
              <div>
                <h2 className="section-title">Assigned Orders</h2>
                <div className="section-subtitle mono" style={{ marginTop:2 }}>{orders.length} total · click to view timeline</div>
              </div>
            </div>

            <div style={{ overflowY:'auto', maxHeight:600 }}>
              {orders.length===0&&<div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>No orders assigned yet.</div>}
              {orders.map(order=>{
                const next = getNext(order.status);
                const selected = selectedOrder?._id===order._id;
                return (
                  <div key={order._id}
                    onClick={()=>fetchTimeline(order._id)}
                    style={{
                      padding:'16px 20px', borderBottom:'1px solid var(--border)', cursor:'pointer', transition:'background .15s',
                      background: selected ? 'rgba(191,77,90,0.05)' : 'transparent',
                      borderLeft: selected ? '3px solid var(--rose)' : '3px solid transparent',
                    }}
                    onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background='var(--bg-card-hover)'; }}
                    onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background='transparent'; }}
                  >
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, color:'var(--text-primary)' }}>{order.drugId?.drugName}</div>
                        <div className="mono" style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>
                          Qty: {order.quantity} · {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Tag color={statusColor(order.status)}>{order.status}</Tag>
                    </div>

                    {next&&(
                      <button
                        onClick={e=>{ e.stopPropagation(); updateStatus(order._id, next); }}
                        disabled={updating===order._id}
                        style={{
                          width:'100%', padding:'9px', borderRadius:10, fontSize:12, fontWeight:700,
                          cursor:updating===order._id?'not-allowed':'pointer', border:'none', transition:'all .2s',
                          background: updating===order._id ? 'rgba(191,77,90,0.28)' : 'rgba(191,77,90,0.10)',
                          color:'var(--rose)',
                          boxShadow: 'none',
                        }}
                      >
                        {updating===order._id ? '⟳ Updating…' : `→ Mark as ${next}`}
                      </button>
                    )}
                    {!next&&order.status==='Delivered'&&(
                      <div style={{ textAlign:'center', padding:'8px', borderRadius:10, background:'var(--sage-dim)', border:'1px solid rgba(111,141,132,0.2)', fontSize:12, color:'var(--sage)' }}>
                        ✓ Fully Delivered
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline panel */}
          <div className="panel fade-up-2" style={{ overflow:'hidden' }}>
            <div className="panel-header">
              <div>
                <h2 className="section-title">
                {selectedOrder ? `Shipment — ${selectedOrder.drugId?.drugName}` : 'Shipment Timeline'}
                </h2>
                <div className="section-subtitle mono" style={{ marginTop:2 }}>
                {selectedOrder ? `PO · ${selectedOrder._id}` : 'Select an order to view tracking'}
                </div>
              </div>
            </div>

            {!selectedOrder&&(
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:60, gap:12 }}>
                <div style={{ fontSize:36, opacity:0.3 }}>◈</div>
                <div style={{ color:'var(--text-muted)', fontSize:13 }}>Click an order on the left</div>
              </div>
            )}

            {timeline&&(
              <div style={{ padding:24 }}>
                {/* Progress bar */}
                {selectedOrder&&(
                  <div style={{ marginBottom:28 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      {STATUS_FLOW.map((s,i)=>{
                        const done = STATUS_FLOW.indexOf(selectedOrder.status)>=i;
                        return (
                          <div key={s} style={{ textAlign:'center', flex:1 }}>
                            <div style={{ width:28, height:28, borderRadius:'50%', margin:'0 auto 6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, transition:'all .3s',
                              background: done ? 'var(--amber)' : 'var(--bg-secondary)',
                              border: `2px solid ${done ? 'var(--amber)' : 'var(--border)'}`,
                              color: done ? '#001' : 'var(--text-muted)',
                            }}>{i+1}</div>
                            <div style={{ fontSize:10, color: done ? 'var(--amber)' : 'var(--text-muted)', fontWeight:600 }}>{s.replace('-',' ')}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Timeline entries */}
                <div style={{ position:'relative' }}>
                  {timeline.map((entry,i)=>(
                    <div key={entry._id} style={{ display:'flex', gap:16, marginBottom: i<timeline.length-1?20:0 }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                          <div style={{ width:12, height:12, borderRadius:'50%', flexShrink:0, marginTop:3, transition:'all .3s',
                            background: i===timeline.length-1 ? 'var(--rose)' : 'var(--border-light)',
                            boxShadow: 'none',
                        }}/>
                        {i<timeline.length-1&&<div style={{ width:2, flex:1, background:'var(--border)', marginTop:6 }}/>}
                      </div>
                      <div style={{ paddingBottom: i<timeline.length-1?20:0 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:'var(--text-primary)' }}>{entry.status}</div>
                        {entry.location&&<div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>📍 {entry.location}</div>}
                        {entry.note&&<div style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic', marginTop:2 }}>{entry.note}</div>}
                        <div className="mono" style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>{new Date(entry.updatedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                  {timeline.length===0&&<div style={{ textAlign:'center', color:'var(--text-muted)', padding:32 }}>No tracking entries yet.</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}