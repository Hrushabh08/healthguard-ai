import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── THEME from Login screenshot ───────────────────────────────────────────
   Purple gradient: #6C3DE8 → #8B5CF6 → #A78BFA
   Accent cyan:    #06B6D4
   Background:     #F0F2FF (lavender-white)
   Cards:          #FFFFFF with purple border hints
   Text primary:   #1E1B4B
   Text muted:     #6B7280
──────────────────────────────────────────────────────────────────────────── */

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = ({ path, size = 20, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const IcoHome    = () => <Ico path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;
const IcoRisk    = () => <Ico path="M22 12h-4l-3 9L9 3l-3 9H2" />;
const IcoWhatIf  = () => <Ico path="M9.663 17h4.674M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />;
const IcoAI      = () => <Ico path="M12 2a10 10 0 1 0 10 10M12 8v4l3 3M22 2l-5 5M17 2h5v5" />;
const IcoMembers = () => <Ico path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 1-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />;
const IcoReport  = () => <Ico path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />;
const IcoNotif   = () => <Ico path="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" />;
const IcoLogout  = () => <Ico path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />;
const IcoMenu    = () => <Ico path="M3 12h18 M3 6h18 M3 18h18" />;
const IcoTrend   = () => <Ico path="M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6" />;
const IcoStar    = () => <Ico path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" sw={0} />;
const IcoChev    = () => <Ico path="M9 18l6-6-6-6" size={16} />;
const IcoCheck   = () => <Ico path="M20 6L9 17l-5-5" size={16} />;
const IcoShield  = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="url(#shieldGrad)" stroke="none">
    <defs>
      <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/>
        <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.9"/>
      </linearGradient>
    </defs>
    <path d="M12 2l9 4v6c0 5.25-3.75 10.15-9 11.25C6.75 22.15 3 17.25 3 12V6l9-4z"/>
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const USER = { name:"Priya Sharma", role:"Software Engineer", avatar:"PS", email:"priya@healthguard.ai", plan:"Pro" };

const MEMBERS = [
  { name:"Rahul Mehta",  av:"RM", score:68, status:"At Risk",   color:"#F59E0B", trend:"+3", avatar_color:"#FEF3C7" },
  { name:"Ananya Singh", av:"AS", score:81, status:"High Risk", color:"#EF4444", trend:"+8", avatar_color:"#FEE2E2" },
  { name:"Dev Patel",    av:"DP", score:42, status:"Healthy",   color:"#10B981", trend:"-5", avatar_color:"#D1FAE5" },
  { name:"Meera Iyer",   av:"MI", score:55, status:"Moderate",  color:"#8B5CF6", trend:"-2", avatar_color:"#EDE9FE" },
];

const NOTIFS = [
  { id:1, text:"Stress spike detected — 23% above baseline", time:"2m ago",  unread:true,  icon:<IcoTrend/>, color:"#EF4444" },
  { id:2, text:"Sleep goal missed — only 5.1 hrs logged",    time:"1h ago",  unread:true,  icon:<IcoRisk/>, color:"#8B5CF6" },
  { id:3, text:"Rahul's risk score improved this week",      time:"3h ago",  unread:false, icon:<IcoStar/>, color:"#10B981" },
  { id:4, text:"New AI health insight ready for you",        time:"5h ago",  unread:false, icon:<IcoAI/>, color:"#06B6D4" },
  { id:5, text:"You're on a 3-day improvement streak!",      time:"8h ago",  unread:false, icon:<IcoTrend/>, color:"#F59E0B" },
];

const WEEK = [{ d:"M",v:62},{ d:"T",v:70},{ d:"W",v:65},{ d:"T",v:74},{ d:"F",v:69},{ d:"S",v:76},{ d:"S",v:74}];

const AI_ACTIONS = [
  { icon:<IcoRisk />, title:"Sleep by 10:30 PM", desc:"Adds ~1.5hrs quality sleep → -18 pts risk", color:"#8B5CF6", impact:"-18" },
  { icon:<IcoTrend />, title:"5-min breathing now", desc:"Lowers cortisol → reduces stress factor -12 pts", color:"#06B6D4", impact:"-12" },
  { icon:<IcoStar />, title:"10-min walk after lunch", desc:"Boosts activity score → -8 pts risk today", color:"#10B981", impact:"-8" },
];

// ─── Risk helpers ─────────────────────────────────────────────────────────────
const riskColor = s => s >= 70 ? "#EF4444" : s >= 50 ? "#F59E0B" : "#10B981";
const riskLabel = s => s >= 70 ? "High Risk" : s >= 50 ? "Moderate" : "Healthy";
const riskGrad  = s => s >= 70
  ? "linear-gradient(135deg,#FEE2E2,#FECACA)"
  : s >= 50 ? "linear-gradient(135deg,#FEF3C7,#FDE68A)"
  : "linear-gradient(135deg,#D1FAE5,#A7F3D0)";

// ─── Animated Risk Ring ───────────────────────────────────────────────────────
function RiskRing({ score, size = 160, strokeW = 12 }) {
  const [cur, setCur] = useState(0);
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (cur / 100) * circ;
  const col = riskColor(cur);

  useEffect(() => {
    let raf, n = 0;
    const t = setTimeout(() => {
      const go = () => { n += 1.5; if (n >= score) { setCur(score); return; } setCur(Math.round(n)); raf = requestAnimationFrame(go); };
      raf = requestAnimationFrame(go);
    }, 300);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [score]);

  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDE9FE" strokeWidth={strokeW} />
        {/* Progress */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={strokeW}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset .05s linear, stroke .6s ease",
                   filter:`drop-shadow(0 0 10px ${col}88)` }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:size > 130 ? 40 : 28, fontWeight:800, color:col, lineHeight:1, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{cur}</div>
        <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2, letterSpacing:"0.1em", fontWeight:600 }}>/ 100</div>
        <div style={{ marginTop:6, fontSize:11, fontWeight:700, color:col, background:`${col}18`, padding:"2px 10px", borderRadius:999 }}>{riskLabel(cur)}</div>
      </div>
    </div>
  );
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color = "#8B5CF6", h = 48 }) {
  const w = 220;
  const vals = data.map(d => d.v);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const xs = vals.map((_, i) => 8 + (i / (vals.length - 1)) * (w - 16));
  const ys = vals.map(v => h - 8 - ((v - mn) / (mx - mn || 1)) * (h - 16));
  const line = xs.map((x, i) => `${i ? "L" : "M"}${x},${ys[i]}`).join(" ");
  const area = `${line} L${xs.at(-1)},${h} L${xs[0]},${h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg${color.replace("#","")})`}/>
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r={i === vals.length-1 ? 4 : 2.5} fill={color} opacity={i === vals.length-1 ? 1 : 0.45} key={i}/>)}
    </svg>
  );
}

// ─── Custom Slider ────────────────────────────────────────────────────────────
function Slider({ label, icon, value, min, max, step=1, unit, color, onChange, description }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontSize:18 }}>{icon}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#1E1B4B" }}>{label}</div>
            <div style={{ fontSize:10, color:"#9CA3AF" }}>{description}</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:18, fontWeight:800, color, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{typeof value === "number" && step < 1 ? value.toFixed(1) : value}<span style={{ fontSize:11, fontWeight:500, opacity:.7 }}>{unit}</span></div>
        </div>
      </div>
      <div style={{ position:"relative", height:8, borderRadius:4, background:"#EDE9FE", cursor:"pointer" }}>
        <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${pct}%`, borderRadius:4, background:`linear-gradient(90deg,${color}88,${color})`, transition:"width .08s", boxShadow:`0 0 10px ${color}55` }}/>
        <div style={{ position:"absolute", top:"50%", left:`${pct}%`, transform:"translate(-50%,-50%)", width:18, height:18, borderRadius:"50%", background:"#fff", border:`2px solid ${color}`, boxShadow:`0 2px 8px ${color}44`, transition:"left .08s", pointerEvents:"none" }}/>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
          style={{ position:"absolute", inset:0, opacity:0, cursor:"pointer", width:"100%", height:"100%", margin:0 }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
        <span style={{ fontSize:9, color:"#C4B5FD", fontWeight:600 }}>{min}{unit}</span>
        <span style={{ fontSize:9, color:"#C4B5FD", fontWeight:600 }}>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate  = useNavigate();
  const [nav, setNav]           = useState("dashboard");
  const [sidebar, setSidebar]   = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [showProf, setShowProf]   = useState(false);
  const [notifs, setNotifs]       = useState(NOTIFS);
  const [sleep, setSleep]         = useState(5.1);
  const [stress, setStress]       = useState(72);
  const [activity, setActivity]   = useState(2400);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText]       = useState("");
  const [showActions, setShowActions] = useState(false);
  const [whatIfMode, setWhatIfMode]   = useState(false);
  const [baseScore, setBaseScore]     = useState(74);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [tempSleep, setTempSleep] = useState(5.1);
  const [tempStress, setTempStress] = useState(72);
  const [tempActivity, setTempActivity] = useState(2400);

  const [workHrs, setWorkHrs]       = useState(8);
  const [water, setWater]           = useState(4);
  const [smoking, setSmoking]       = useState(0);
  const [alcohol, setAlcohol]       = useState(0);

  const [tempWorkHrs, setTempWorkHrs] = useState(8);
  const [tempWater, setTempWater]     = useState(4);
  const [tempSmoking, setTempSmoking] = useState(0);
  const [tempAlcohol, setTempAlcohol] = useState(0);
  const notifRef = useRef(null);
  const profRef  = useRef(null);

  const score = Math.min(100, Math.round(
    stress * 0.40 +
    Math.max(0, (8 - sleep) / 8) * 100 * 0.35 +
    Math.max(0, (10000 - activity) / 10000) * 100 * 0.25
  ));

  const scoreDelta = score - baseScore;
  const unread = notifs.filter(n => n.unread).length;

  useEffect(() => {
    const h = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profRef.current  && !profRef.current.contains(e.target))  setShowProf(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const runAI = () => {
    setAiLoading(true); setAiText(""); setShowActions(false);
    const msg = `Your health risk score is ${score}/100. Sleep: ${sleep}hrs, Stress: ${stress}%, Activity: ${activity} steps. Sleep contributes ${Math.round(Math.max(0,(8-sleep)/8)*100*0.35)} pts, Stress contributes ${Math.round(stress*0.4)} pts, Activity contributes ${Math.round(Math.max(0,(10000-activity)/10000)*100*0.25)} pts. ${score>=70?"Your primary driver is stress (${Math.round(stress*0.4)} pts) combined with insufficient sleep. Cortisol from sustained stress is compounding the impact of reduced sleep quality. Based on WHO guidelines, you need immediate interventions.":"Your risk is moderate. Small consistent changes will move you to healthy range within a week."} Here are your 3 priority actions for today.`;
    let i = 0;
    const t = setInterval(() => {
      if (i >= msg.length) { clearInterval(t); setAiLoading(false); setShowActions(true); return; }
      setAiText(msg.slice(0, i + 1)); i += 2;
    }, 22);
  };

  const NAV_ITEMS = [
    { id:"dashboard", icon:<IcoHome />,    label:"Dashboard"   },
    { id:"risk",      icon:<IcoRisk />,    label:"Risk Score"  },
    { id:"whatif",    icon:<IcoWhatIf />,  label:"What-If Sim" },
    { id:"ai",        icon:<IcoAI />,      label:"AI Insights" },
    { id:"members",   icon:<IcoMembers />, label:"Members"     },
    { id:"report",    icon:<IcoReport />,  label:"Reports"     },
  ];

  const STYLE = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body,html{font-family:'Plus Jakarta Sans',sans-serif}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:#C4B5FD;border-radius:2px}

    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes pop{from{opacity:0;transform:scale(.94) translateY(-8px)}to{opacity:1;transform:scale(1) translateY(0)}}
    @keyframes pulse{0%,100%{opacity:.7}50%{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes countUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}

    .fu{animation:fadeUp .55s cubic-bezier(.22,1,.36,1) both}
    .d1{animation-delay:.04s}.d2{animation-delay:.08s}.d3{animation-delay:.12s}
    .d4{animation-delay:.16s}.d5{animation-delay:.20s}.d6{animation-delay:.24s}.d7{animation-delay:.28s}

    .nav-link{
      display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;
      cursor:pointer;transition:all .2s;color:#6B7280;font-size:13.5px;font-weight:600;
      border:1.5px solid transparent;white-space:nowrap;overflow:hidden;
    }
    .nav-link:hover{background:#F5F3FF;color:#7C3AED}
    .nav-link.active{background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;
      box-shadow:0 4px 16px rgba(124,58,237,.35);border-color:transparent}

    .card{
      background:#fff;border-radius:12px;
      border:1px solid #E5E7EB;
      box-shadow:0 1px 3px rgba(0,0,0,0.04);
      transition:box-shadow .2s,transform .2s;
    }
    .card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.06);transform:translateY(-1px)}

    .stat-card{
      background:#fff;
      border-radius:12px;border:1px solid #E5E7EB;
      padding:16px 18px;transition:all .2s;cursor:pointer;
    }
    .stat-card:hover{border-color:#D1D5DB;box-shadow:0 4px 12px rgba(0,0,0,0.06);transform:translateY(-2px)}

    .pill-btn{
      padding:7px 16px;border-radius:999px;border:1.5px solid #C4B5FD;
      background:transparent;color:#7C3AED;font-size:12px;font-weight:700;
      cursor:pointer;transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif;
    }
    .pill-btn:hover{background:#7C3AED;color:#fff;border-color:#7C3AED}
    .pill-btn.active{background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;border-color:transparent;
      box-shadow:0 4px 14px rgba(124,58,237,.4)}

    .primary-btn{
      background:linear-gradient(135deg,#7C3AED,#6D28D9);color:#fff;
      border:none;border-radius:12px;padding:11px 22px;font-weight:700;font-size:13px;
      cursor:pointer;transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif;
      box-shadow:0 4px 16px rgba(124,58,237,.35);
    }
    .primary-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.5)}
    .primary-btn:active{transform:translateY(0)}

    .ghost-btn{
      background:#F5F3FF;color:#7C3AED;border:1.5px solid #C4B5FD;
      border-radius:12px;padding:10px 20px;font-weight:700;font-size:13px;
      cursor:pointer;transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif;
    }
    .ghost-btn:hover{background:#EDE9FE}

    .member-row{
      display:flex;align-items:center;gap:12px;padding:10px 14px;
      border-radius:12px;cursor:pointer;transition:all .2s;
    }
    .member-row:hover{background:#F5F3FF}

    .notif-item{
      display:flex;gap:10px;padding:12px 16px;cursor:pointer;transition:background .15s;
    }
    .notif-item:hover{background:#F5F3FF}

    .dropdown{
      position:absolute;right:0;top:calc(100% + 10px);z-index:200;
      background:#fff;border:1.5px solid #EDE9FE;border-radius:18px;
      box-shadow:0 20px 60px rgba(109,40,217,.18);
      animation:pop .22s cubic-bezier(.22,1,.36,1);
    }

    .badge{
      display:inline-block;font-size:10px;font-weight:700;padding:2px 9px;border-radius:999px;
    }

    .modal-overlay{
      position:fixed;inset:0;background:rgba(17,24,39,0.5);backdrop-filter:blur(4px);
      z-index:999;display:flex;align-items:center;justify-content:center;
      animation:fadeIn .2s ease;
    }
    .modal-content{
      background:#fff;border-radius:16px;padding:24px;width:100%;max-width:400px;
      box-shadow:0 10px 40px rgba(0,0,0,0.1);
      animation:pop .3s cubic-bezier(.22,1,.36,1);
    }

    .action-card{
      border-radius:14px;padding:14px 16px;border:1.5px solid;
      transition:all .2s;cursor:pointer;
    }
    .action-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}

    .ai-typing::after{
      content:'|';animation:pulse .8s infinite;color:#7C3AED;font-weight:300;
    }

    .spinner{
      width:16px;height:16px;border:2px solid #EDE9FE;border-top-color:#7C3AED;
      border-radius:50%;animation:spin .7s linear infinite;display:inline-block;
    }

    .shimmer-text{
      background:linear-gradient(90deg,#7C3AED,#06B6D4,#7C3AED);
      background-size:200% auto;
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      animation:shimmer 2.5s linear infinite;
    }

    .risk-badge-high{background:#FEE2E2;color:#DC2626}
    .risk-badge-mod {background:#FEF3C7;color:#D97706}
    .risk-badge-low {background:#D1FAE5;color:#059669}
  `;

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F0F2FF", minHeight:"100vh", display:"flex", position:"relative" }}>
      <style>{STYLE}</style>

      {/* ══════ SIDEBAR ══════════════════════════════════════════════════════ */}
      <div style={{
        width: sidebar ? 240 : 68, flexShrink:0,
        height:"100vh", position:"sticky", top:0, zIndex:50,
        background:"#111827",
        display:"flex", flexDirection:"column",
        transition:"width .3s cubic-bezier(.22,1,.36,1)",
        overflow:"hidden", boxShadow:"4px 0 24px rgba(109,40,217,.25)",
      }}>
        {/* Logo */}
        <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid rgba(255,255,255,.12)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, overflow:"hidden" }}>
            <div style={{ width:38, height:38, borderRadius:12, background:"rgba(255,255,255,.2)", border:"1.5px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, backdropFilter:"blur(8px)" }}>
              <IcoShield />
            </div>
            {sidebar && (
              <div style={{ animation:"fadeIn .25s ease", overflow:"hidden" }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#fff", letterSpacing:"-0.02em", whiteSpace:"nowrap" }}>HealthGuard AI</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,.55)", letterSpacing:"0.18em", fontFamily:"'DM Mono',monospace" }}>HEALTH RISK PLATFORM</div>
              </div>
            )}
          </div>
          <button onClick={() => setSidebar(!sidebar)} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#fff", flexShrink:0 }}>
            <IcoMenu />
          </button>
        </div>

        {/* User Profile in Sidebar */}
        {sidebar && (
          <div style={{ padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,.1)", animation:"fadeIn .3s ease" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:14, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.18)" }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#C4B5FD,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0, fontFamily:"'DM Mono',monospace" }}>
                {USER.avatar}
              </div>
              <div style={{ flex:1, overflow:"hidden" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{USER.name}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,.55)" }}>{USER.plan} Plan</div>
              </div>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#34D399", boxShadow:"0 0 6px #34D399", flexShrink:0 }}/>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
          {sidebar && <div style={{ fontSize:9, color:"rgba(255,255,255,.35)", letterSpacing:"0.15em", fontFamily:"'DM Mono',monospace", marginBottom:8, paddingLeft:4 }}>NAVIGATION</div>}
          {NAV_ITEMS.map((item, i) => (
            <div key={item.id}
              className={`nav-link ${nav === item.id ? "active" : ""} fu d${i+1}`}
              style={{ justifyContent: sidebar ? "flex-start" : "center", color: nav === item.id ? "#fff" : "rgba(255,255,255,.6)", marginBottom:4 }}
              onClick={() => setNav(item.id)}
              title={!sidebar ? item.label : ""}>
              <span style={{ flexShrink:0 }}>{item.icon}</span>
              {sidebar && <span style={{ animation:"fadeIn .2s ease" }}>{item.label}</span>}
              {sidebar && nav === item.id && (
                <span style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,.8)", animation:"pulse 2s infinite" }}/>
              )}
            </div>
          ))}

          {sidebar && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.35)", letterSpacing:"0.15em", fontFamily:"'DM Mono',monospace", marginBottom:8, paddingLeft:4 }}>COMMUNITY</div>
              <div className="nav-link" style={{ color:"rgba(255,255,255,.6)", marginBottom:4 }} onClick={() => setNav("members")}>
                <IcoMembers />
                {sidebar && <><span style={{ animation:"fadeIn .2s ease" }}>Connected</span>
                <span style={{ marginLeft:"auto", fontSize:10, background:"rgba(255,255,255,.2)", color:"#fff", borderRadius:999, padding:"1px 7px", fontFamily:"'DM Mono',monospace" }}>{MEMBERS.length}</span></>}
              </div>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,.1)" }}>
          <div className="nav-link" style={{ color:"rgba(255,255,255,.5)", justifyContent: sidebar ? "flex-start" : "center" }} onClick={() => navigate("/")}>
            <IcoLogout />
            {sidebar && <span style={{ animation:"fadeIn .2s ease" }}>Sign Out</span>}
          </div>
        </div>
      </div>

      {/* ══════ MAIN AREA ═════════════════════════════════════════════════════ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:"100vh", overflow:"auto" }}>

        {/* ── TOPBAR ── */}
        <header style={{
          position:"sticky", top:0, zIndex:40, height:64,
          background:"rgba(240,242,255,.92)", backdropFilter:"blur(20px)",
          borderBottom:"1.5px solid #EDE9FE",
          padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          <div>
            <div style={{ fontSize:17, fontWeight:800, color:"#1E1B4B", letterSpacing:"-0.03em" }}>
              {nav==="dashboard"?"Dashboard":nav==="risk"?"Risk Score":nav==="whatif"?"What-If Simulator":nav==="ai"?"AI Insights":nav==="members"?"Members":"Reports"}
            </div>
            <div style={{ fontSize:11, color:"#9CA3AF", fontFamily:"'DM Mono',monospace" }}>
              {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Health Credit Score badge */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:999, background:"linear-gradient(135deg,#7C3AED15,#06B6D415)", border:"1.5px solid #C4B5FD" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:riskColor(score), boxShadow:`0 0 6px ${riskColor(score)}` }}/>
              <span style={{ fontSize:12, fontWeight:700, color:"#1E1B4B" }}>Health Score: </span>
              <span style={{ fontSize:14, fontWeight:800, color:riskColor(score), fontFamily:"'DM Mono',monospace" }}>{score}</span>
            </div>

            {/* Notifications */}
            <div style={{ position:"relative" }} ref={notifRef}>
              <button onClick={() => { setShowNotif(!showNotif); setShowProf(false); }}
                style={{ position:"relative", background:"#fff", border:"1.5px solid #EDE9FE", borderRadius:12, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#7C3AED", transition:"all .2s", boxShadow:"0 2px 8px rgba(109,40,217,.08)" }}>
                <IcoNotif />
                {unread > 0 && <span style={{ position:"absolute", top:7, right:7, width:8, height:8, borderRadius:"50%", background:"#EF4444", border:"2px solid #F0F2FF", boxShadow:"0 0 6px #EF4444" }}/>}
              </button>

              {showNotif && (
                <div className="dropdown" style={{ width:330 }}>
                  <div style={{ padding:"14px 16px 12px", borderBottom:"1px solid #EDE9FE", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#1E1B4B" }}>Notifications</div>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      {unread > 0 && <span className="badge" style={{ background:"#FEE2E2", color:"#DC2626" }}>{unread} new</span>}
                      <button onClick={() => setNotifs(p => p.map(n=>({...n,unread:false})))} style={{ fontSize:11, color:"#7C3AED", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>Mark all read</button>
                    </div>
                  </div>
                  <div style={{ maxHeight:320, overflowY:"auto" }}>
                    {notifs.map(n => (
                      <div key={n.id} className="notif-item" onClick={() => setNotifs(p => p.map(x => x.id===n.id?{...x,unread:false}:x))}>
                        <div style={{ width:34, height:34, borderRadius:10, background:`${n.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{n.icon}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight: n.unread?600:400, color: n.unread?"#1E1B4B":"#6B7280", lineHeight:1.4 }}>{n.text}</div>
                          <div style={{ fontSize:10, color:"#9CA3AF", marginTop:3, fontFamily:"'DM Mono',monospace" }}>{n.time}</div>
                        </div>
                        {n.unread && <div style={{ width:7, height:7, borderRadius:"50%", background:"#7C3AED", flexShrink:0, marginTop:4 }}/>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ position:"relative" }} ref={profRef}>
              <div onClick={() => { setShowProf(!showProf); setShowNotif(false); }}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px 6px 6px", borderRadius:999, background:"#fff", border:"1.5px solid #EDE9FE", cursor:"pointer", boxShadow:"0 2px 8px rgba(109,40,217,.08)" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#7C3AED,#6D28D9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff", fontFamily:"'DM Mono',monospace" }}>{USER.avatar}</div>
                <span style={{ fontSize:13, fontWeight:700, color:"#1E1B4B" }}>{USER.name.split(" ")[0]}</span>
                <IcoChev />
              </div>

              {showProf && (
                <div className="dropdown" style={{ width:270 }}>
                  <div style={{ padding:"16px", borderBottom:"1px solid #EDE9FE", display:"flex", gap:12, alignItems:"center" }}>
                    <div style={{ width:48, height:48, borderRadius:"50%", background:"linear-gradient(135deg,#7C3AED,#6D28D9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", fontFamily:"'DM Mono',monospace" }}>{USER.avatar}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:"#1E1B4B" }}>{USER.name}</div>
                      <div style={{ fontSize:11, color:"#9CA3AF" }}>{USER.email}</div>
                      <span className="badge" style={{ marginTop:5, background:"linear-gradient(135deg,#7C3AED,#6D28D9)", color:"#fff", fontSize:10, display:"inline-block" }}>✦ {USER.plan} Plan</span>
                    </div>
                  </div>
                  <div style={{ padding:"10px 8px" }}>
                    {["Settings", "My Reports", "Upgrade"].map((label) => (
                      <button key={label} style={{ width:"100%", textAlign:"left", background:"none", border:"none", cursor:"pointer", padding:"9px 12px", borderRadius:10, fontSize:13, color:"#374151", display:"flex", alignItems:"center", gap:8, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:500, transition:"all .15s" }}
                        onMouseEnter={e=>{e.currentTarget.style.background="#F5F3FF";e.currentTarget.style.color="#7C3AED"}}
                        onMouseLeave={e=>{e.currentTarget.style.background="none";e.currentTarget.style.color="#374151"}}>
                        {label}
                      </button>
                    ))}
                    <div style={{ height:1, background:"#EDE9FE", margin:"6px 0" }}/>
                    <button onClick={()=>navigate("/")} style={{ width:"100%", textAlign:"left", background:"none", border:"none", cursor:"pointer", padding:"9px 12px", borderRadius:10, fontSize:13, color:"#EF4444", display:"flex", alignItems:"center", gap:8, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}
                      onMouseEnter={e=>e.currentTarget.style.background="#FEE2E2"}
                      onMouseLeave={e=>e.currentTarget.style.background="none"}>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main style={{ flex:1, padding:"24px 28px", overflowY:"auto" }}>

          {/* ═══════════════ DASHBOARD ═════════════════════════════════ */}
          {nav === "dashboard" && (
            <div>
              {/* Greeting */}
              <div className="fu d1" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
                <div>
                  <h1 style={{ fontSize:26, fontWeight:800, color:"#1E1B4B", letterSpacing:"-0.03em", marginBottom:4 }}>
                    Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {USER.name.split(" ")[0]}
                  </h1>
                  <p style={{ fontSize:13, color:"#6B7280" }}>
                    Your health credit score is <span style={{ fontWeight:700, color:riskColor(score) }}>{score}/100</span> today.
                    {score >= 70 ? " Take action — your risk is high." : score >= 50 ? " Small changes can move you to healthy." : " Great work maintaining healthy habits!"}
                  </p>
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button className="ghost-btn fu d2" onClick={() => { 
                    setTempSleep(sleep); setTempStress(stress); setTempActivity(activity);
                    setTempWorkHrs(workHrs); setTempWater(water); setTempSmoking(smoking); setTempAlcohol(alcohol);
                    setShowUpdateModal(true); 
                  }}>
                    Log Today's Data
                  </button>
                  <button className="primary-btn fu d2" onClick={() => setNav("whatif")}>
                    Run What-If Sim →
                  </button>
                </div>
              </div>

              {/* TOP ROW */}
              <div style={{ display:"grid", gridTemplateColumns:"300px 1fr 1fr", gap:16, marginBottom:16 }}>

                {/* ── USP 2: THE DAILY RISK NUMBER ── */}
                <div className="card fu d2" style={{ padding:24, display:"flex", flexDirection:"column", alignItems:"center", background:"#1F2937", border:"none", boxShadow:"0 4px 12px rgba(0,0,0,.1)", position:"relative", overflow:"hidden" }}>
                  {/* BG pattern */}
                  <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 80% 20%, rgba(255,255,255,.08) 0%,transparent 50%), radial-gradient(circle at 20% 80%, rgba(6,182,212,.15) 0%,transparent 50%)" }}/>
                  <div style={{ position:"relative", zIndex:1, width:"100%", textAlign:"center" }}>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,.6)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.15em", marginBottom:14 }}>YOUR HEALTH CREDIT SCORE™</div>
                    <RiskRing score={score} size={160} strokeW={12} />
                    <div style={{ marginTop:16, padding:"10px 14px", borderRadius:12, background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", backdropFilter:"blur(8px)" }}>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,.8)", fontWeight:500 }}>
                        {score>=70?"Higher than 82% of users today":score>=50?"Average range — room to improve":"Better than 71% of users today"}
                      </div>
                    </div>
                    {/* Streak */}
                    <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:10 }}>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,.5)" }}>3-day improvement streak</span>
                    </div>
                  </div>
                </div>

                {/* Vital Stats */}
                <div className="fu d3" style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {[
                    { label:"Sleep",    icon:<IcoRisk/>, val:sleep,            unit:"hrs",   color:"#8B5CF6", min:0, max:12, target:"7–9 hrs",  bad: sleep<7  },
                    { label:"Stress",   icon:<IcoTrend/>, val:stress,           unit:"%",     color:"#EF4444", min:0, max:100, target:"<50%",    bad: stress>60 },
                    { label:"Activity", icon:<IcoStar/>, val:Math.round(activity/100)/10, unit:"k steps", color:"#10B981", min:0, max:15, target:"10k steps", bad: activity<6000 },
                  ].map(v => (
                    <div key={v.label} className="stat-card" onClick={() => setNav("whatif")}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:20 }}>{v.icon}</span>
                          <div>
                            <div style={{ fontSize:10, color:"#9CA3AF", fontWeight:600, letterSpacing:"0.08em" }}>{v.label.toUpperCase()}</div>
                            <div style={{ fontSize:22, fontWeight:800, color:v.color, lineHeight:1, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                              {v.val}<span style={{ fontSize:12, fontWeight:600, opacity:.7 }}>{v.unit}</span>
                            </div>
                          </div>
                        </div>
                        <span className="badge" style={{ background: v.bad?"#FEE2E2":"#D1FAE5", color: v.bad?"#DC2626":"#059669" }}>
                          {v.bad ? "Below target" : "On target"}
                        </span>
                      </div>
                      <div style={{ height:5, borderRadius:3, background:"#EDE9FE", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg,${v.color}66,${v.color})`, width:`${Math.min(100,(v.val/v.max)*100)}%`, transition:"width .3s", boxShadow:`0 0 8px ${v.color}44` }}/>
                      </div>
                      <div style={{ fontSize:10, color:"#9CA3AF", marginTop:5 }}>Target: {v.target} · Tap to simulate</div>
                    </div>
                  ))}
                </div>

                {/* 7-day chart */}
                <div className="card fu d4" style={{ padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#1E1B4B" }}>7-Day Risk Trend</div>
                    <span className="badge" style={{ background:"#EDE9FE", color:"#7C3AED" }}>LAST WEEK</span>
                  </div>
                  <div style={{ fontSize:12, color:"#9CA3AF", marginBottom:14 }}>
                    Avg: <strong style={{ color:"#7C3AED" }}>{Math.round(WEEK.reduce((a,b)=>a+b.v,0)/WEEK.length)}/100</strong>
                  </div>
                  <Sparkline data={WEEK} color="#7C3AED" h={80} />
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                    {WEEK.map((d,i) => (
                      <div key={i} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:9, fontWeight:700, color: i===6?"#7C3AED":"#9CA3AF", fontFamily:"'DM Mono',monospace" }}>{d.d}</div>
                        <div style={{ fontSize:9, color: i===6?"#7C3AED":"#9CA3AF", fontFamily:"'DM Mono',monospace", fontWeight: i===6?700:400 }}>{d.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:14, padding:"8px 12px", borderRadius:10, background:"#F5F3FF", border:"1px solid #EDE9FE", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"#6B7280" }}>vs last week</span>
                    <span style={{ fontSize:12, fontWeight:700, color:"#EF4444" }}>▲ +4.2 pts risk</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

                {/* ── USP 1: WHAT-IF PREVIEW ── */}
                <div className="card fu d5" style={{ padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:"#1E1B4B" }}>What-If Simulator</div>
                      <div style={{ fontSize:11, color:"#9CA3AF" }}>Drag to simulate risk changes in real time</div>
                    </div>
                    <button className="pill-btn" onClick={() => setNav("whatif")}>Full Sim →</button>
                  </div>
                  <Slider label="Sleep Duration" icon={<IcoRisk/>} value={sleep} min={0} max={12} step={0.1} unit=" hrs" color="#8B5CF6" onChange={setSleep} description="WHO recommends 7–9 hrs" />
                  <Slider label="Stress Level"   icon={<IcoTrend/>} value={stress} min={0} max={100} unit="%" color="#EF4444" onChange={setStress} description="Cortisol impact on health" />
                  <Slider label="Daily Activity" icon={<IcoStar/>} value={activity} min={0} max={15000} step={100} unit=" steps" color="#10B981" onChange={setActivity} description="Steps toward 10k daily goal" />
                  <div style={{ marginTop:8, padding:"12px 16px", borderRadius:14, background: score>=70?"#FEE2E2":score>=50?"#FEF3C7":"#D1FAE5", border:`1.5px solid ${riskColor(score)}44`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:11, color:"#6B7280", fontWeight:600 }}>SIMULATED SCORE</div>
                      <div style={{ fontSize:11, color:riskColor(score), marginTop:2 }}>{riskLabel(score)} Risk Level</div>
                    </div>
                    <div style={{ fontSize:36, fontWeight:800, color:riskColor(score), fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1 }}>
                      {score}
                      {scoreDelta !== 0 && (
                        <span style={{ fontSize:14, fontWeight:700, color: scoreDelta < 0 ? "#10B981" : "#EF4444", display:"block", textAlign:"right" }}>
                          {scoreDelta > 0 ? `▲+${scoreDelta}` : `▼${scoreDelta}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── USP 3: AI EXPLAINABILITY ── */}
                <div className="card fu d6" style={{ padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:800, color:"#1E1B4B" }}>AI Health Reasoning</div>
                      <div style={{ fontSize:11, color:"#9CA3AF" }}>Claude explains your risk chain</div>
                    </div>
                    {!aiLoading && !aiText && (
                      <button className="primary-btn" style={{ fontSize:12, padding:"8px 16px" }} onClick={runAI}>Explain My Risk</button>
                    )}
                  </div>

                  {/* Factor breakdown bars — always visible */}
                  <div style={{ marginBottom:14 }}>
                    {[
                      { label:"Sleep factor",    pts: Math.round(Math.max(0,(8-sleep)/8)*100*0.35), color:"#8B5CF6", max:35 },
                      { label:"Stress factor",   pts: Math.round(stress*0.40),                     color:"#EF4444", max:40 },
                      { label:"Activity factor", pts: Math.round(Math.max(0,(10000-activity)/10000)*100*0.25), color:"#10B981", max:25 },
                    ].map(f => (
                      <div key={f.label} style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                          <span style={{ fontSize:12, color:"#6B7280", fontWeight:500 }}>{f.label}</span>
                          <span style={{ fontSize:12, fontWeight:800, color:f.color, fontFamily:"'DM Mono',monospace" }}>+{f.pts} pts</span>
                        </div>
                        <div style={{ height:6, borderRadius:3, background:"#EDE9FE", overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:3, background:f.color, width:`${(f.pts/f.max)*100}%`, transition:"width .4s", boxShadow:`0 0 8px ${f.color}44` }}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI output */}
                  {(aiLoading || aiText) && (
                    <div style={{ padding:"12px 14px", borderRadius:12, background:"#F5F3FF", border:"1.5px solid #EDE9FE", marginBottom:12, minHeight:70 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                        {aiLoading && <span className="spinner"/>}
                        <span style={{ fontSize:11, fontWeight:700, color:"#7C3AED", fontFamily:"'DM Mono',monospace" }}>CLAUDE AI REASONING</span>
                      </div>
                      <div style={{ fontSize:12, color:"#374151", lineHeight:1.7 }} className={aiLoading && aiText.length < 200 ? "ai-typing" : ""}>{aiText}</div>
                    </div>
                  )}

                  {/* Action cards */}
                  {showActions && (
                    <div style={{ display:"flex", flexDirection:"column", gap:8, animation:"fadeUp .4s ease" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:"0.08em", marginBottom:2 }}>TODAY'S PRIORITY ACTIONS</div>
                      {AI_ACTIONS.map(a => (
                        <div key={a.title} className="action-card" style={{ borderColor:`${a.color}33`, background:`${a.color}08`, display:"flex", alignItems:"center", gap:12 }}>
                          <span style={{ fontSize:20 }}>{a.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:12, fontWeight:700, color:"#1E1B4B" }}>{a.title}</div>
                            <div style={{ fontSize:11, color:"#6B7280", marginTop:1 }}>{a.desc}</div>
                          </div>
                          <div style={{ fontSize:13, fontWeight:800, color:a.color, fontFamily:"'DM Mono',monospace", whiteSpace:"nowrap" }}>{a.impact}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!aiText && !aiLoading && (
                    <div style={{ textAlign:"center", padding:"16px 0", color:"#9CA3AF", fontSize:12 }}>
                      Click "Explain My Risk" to get AI reasoning powered by Claude →
                    </div>
                  )}
                </div>
              </div>

              {/* Members Row */}
              <div className="card fu d7" style={{ padding:22, marginTop:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:"#1E1B4B" }}>Connected Members</div>
                  <button className="pill-btn" onClick={() => setNav("members")}>View All</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                  {MEMBERS.map(m => (
                    <div key={m.name} style={{ padding:"14px 16px", borderRadius:14, background:`${m.color}0a`, border:`1.5px solid ${m.color}33`, textAlign:"center", transition:"all .2s", cursor:"pointer" }}
                      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 8px 24px ${m.color}22`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                      <div style={{ width:40, height:40, borderRadius:"50%", background:m.avatar_color, border:`2px solid ${m.color}55`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px", fontSize:13, fontWeight:800, color:m.color, fontFamily:"'DM Mono',monospace" }}>{m.av}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#1E1B4B", marginBottom:2 }}>{m.name.split(" ")[0]}</div>
                      <div style={{ fontSize:22, fontWeight:800, color:m.color, fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1 }}>{m.score}</div>
                      <div style={{ fontSize:10, color: m.trend.startsWith("+")?"#EF4444":"#10B981", fontWeight:700, marginTop:2, fontFamily:"'DM Mono',monospace" }}>{m.trend} this week</div>
                      <span className="badge" style={{ marginTop:6, background:`${m.color}18`, color:m.color, display:"inline-block" }}>{m.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ WHAT-IF FULL PAGE ════════════════════════════ */}
          {nav === "whatif" && (
            <div>
              <p className="fu d1" style={{ fontSize:14, color:"#6B7280", marginBottom:20 }}>Simulate lifestyle changes and see exactly how they affect your health risk score in real time.</p>
              <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:20 }}>
                <div className="card fu d2" style={{ padding:28 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:22 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"#1F2937", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18 }}><IcoWhatIf /></div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:800, color:"#1E1B4B" }}>Behavioral Risk Simulator</div>
                      <div style={{ fontSize:12, color:"#9CA3AF" }}>Adjust your habits — watch the score change live</div>
                    </div>
                  </div>
                  <Slider label="Sleep Duration" icon={<IcoRisk/>} value={sleep} min={0} max={12} step={0.1} unit=" hrs" color="#8B5CF6" onChange={setSleep} description="WHO recommends 7–9 hrs per night" />
                  <Slider label="Stress Level" icon={<IcoTrend/>} value={stress} min={0} max={100} unit="%" color="#EF4444" onChange={setStress} description="Chronic stress is the #1 risk driver" />
                  <Slider label="Daily Steps" icon={<IcoStar/>} value={activity} min={0} max={15000} step={100} unit=" steps" color="#10B981" onChange={setActivity} description="10,000 steps = optimal activity" />
                  <div style={{ padding:"16px", borderRadius:14, background:"linear-gradient(135deg,#F5F3FF,#EDE9FE)", border:"1.5px solid #C4B5FD", display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
                    <div>
                      <div style={{ fontSize:11, color:"#7C3AED", fontWeight:700, letterSpacing:"0.08em" }}>SIMULATED RISK SCORE</div>
                      <div style={{ fontSize:12, color:riskColor(score), fontWeight:600, marginTop:2 }}>{riskLabel(score)} — {scoreDelta < 0 ? `improved ${Math.abs(scoreDelta)} pts from baseline` : scoreDelta > 0 ? `worse ${scoreDelta} pts from baseline` : "same as baseline"}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:48, fontWeight:800, color:riskColor(score), fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1 }}>{score}</div>
                      {scoreDelta !== 0 && <div style={{ fontSize:14, fontWeight:700, color: scoreDelta<0?"#10B981":"#EF4444" }}>{scoreDelta<0?`▼ ${Math.abs(scoreDelta)}`:`▲ +${scoreDelta}`} pts</div>}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div className="card fu d3" style={{ padding:24, display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ fontSize:11, color:"#9CA3AF", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", marginBottom:14 }}>BEFORE → AFTER</div>
                    <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontSize:42, fontWeight:800, color:"#EF4444", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{baseScore}</div>
                        <div style={{ fontSize:11, color:"#9CA3AF", marginTop:4 }}>Baseline</div>
                      </div>
                      <div style={{ fontSize:28, color:"#C4B5FD" }}>→</div>
                      <div style={{ textAlign:"center" }}>
                        <RiskRing score={score} size={110} strokeW={9} />
                        <div style={{ fontSize:11, color:"#9CA3AF", marginTop:4 }}>Simulated</div>
                      </div>
                    </div>
                  </div>
                  <div className="card fu d4" style={{ padding:20 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:"#1E1B4B", marginBottom:12 }}>Best Case Tonight</div>
                    <div style={{ padding:"12px 14px", borderRadius:12, background:"#D1FAE5", border:"1.5px solid #6EE7B7", marginBottom:10 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"#059669" }}>If you sleep 7.5 hrs + reduce stress 20%</div>
                      <div style={{ fontSize:22, fontWeight:800, color:"#059669", fontFamily:"'Plus Jakarta Sans',sans-serif", marginTop:4 }}>Score → {Math.max(20, score - 18)} <span style={{ fontSize:13 }}>(-{Math.min(score-20, 18)} pts)</span></div>
                    </div>
                    <button className="primary-btn" style={{ width:"100%", fontSize:13 }} onClick={runAI}>Get AI Action Plan →</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ AI INSIGHTS PAGE ══════════════════════════════ */}
          {nav === "ai" && (
            <div>
              <p className="fu d1" style={{ fontSize:14, color:"#6B7280", marginBottom:20 }}>Claude AI analyzes your health data and explains exactly why your risk is what it is — with actionable steps.</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                <div className="card fu d2" style={{ padding:24 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:"#1E1B4B", marginBottom:14 }}>Risk Factor Breakdown</div>
                  {[
                    { label:"Sleep", icon:<IcoRisk/>, pts:Math.round(Math.max(0,(8-sleep)/8)*100*0.35), weight:"35%", color:"#8B5CF6", desc:`${sleep}hrs of ${8} target hrs` },
                    { label:"Stress", icon:<IcoTrend/>, pts:Math.round(stress*0.40), weight:"40%", color:"#EF4444", desc:`${stress}% stress level` },
                    { label:"Activity", icon:<IcoStar/>, pts:Math.round(Math.max(0,(10000-activity)/10000)*100*0.25), weight:"25%", color:"#10B981", desc:`${activity.toLocaleString()} of 10,000 steps` },
                  ].map(f => (
                    <div key={f.label} style={{ marginBottom:16, padding:"14px 16px", borderRadius:14, background:"#FAFAFF", border:"1.5px solid #EDE9FE" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:18 }}>{f.icon}</span>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:"#1E1B4B" }}>{f.label}</div>
                            <div style={{ fontSize:11, color:"#9CA3AF" }}>{f.desc} · Weight: {f.weight}</div>
                          </div>
                        </div>
                        <div style={{ fontSize:22, fontWeight:800, color:f.color, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>+{f.pts}</div>
                      </div>
                      <div style={{ height:8, borderRadius:4, background:"#EDE9FE", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:4, background:`linear-gradient(90deg,${f.color}66,${f.color})`, width:`${Math.min(100,f.pts)}%`, boxShadow:`0 0 10px ${f.color}44` }}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card fu d3" style={{ padding:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#1E1B4B" }}>AI Explains Your Risk</div>
                    <button className="primary-btn" style={{ fontSize:12, padding:"8px 14px" }} onClick={runAI}>
                      {aiLoading ? <><span className="spinner" style={{ marginRight:6 }}/>Analyzing...</> : "Explain Now"}
                    </button>
                  </div>
                  {(aiText || aiLoading) && (
                    <div style={{ padding:"14px", borderRadius:14, background:"#F5F3FF", border:"1.5px solid #EDE9FE", marginBottom:14, minHeight:100 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"#7C3AED", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", marginBottom:8 }}>CLAUDE AI · LIVE ANALYSIS</div>
                      <div style={{ fontSize:13, color:"#374151", lineHeight:1.75 }} className={aiLoading && aiText.length<200?"ai-typing":""}>{aiText || " "}</div>
                    </div>
                  )}
                  {showActions && (
                    <div style={{ animation:"fadeUp .4s ease" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#6B7280", letterSpacing:"0.08em", marginBottom:10 }}>PRIORITY ACTIONS — TODAY</div>
                      {AI_ACTIONS.map((a,i) => (
                        <div key={a.title} className="action-card" style={{ borderColor:`${a.color}44`, background:`${a.color}08`, marginBottom:8, display:"flex", alignItems:"center", gap:12, animation:`fadeUp .4s ${i*.1}s both` }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:`${a.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{a.icon}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:700, color:"#1E1B4B" }}>{a.title}</div>
                            <div style={{ fontSize:11, color:"#6B7280" }}>{a.desc}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:16, fontWeight:800, color:a.color }}>{a.impact}</div>
                            <div style={{ fontSize:9, color:"#9CA3AF" }}>pts today</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!aiText && !aiLoading && (
                    <div style={{ textAlign:"center", padding:"24px 0", color:"#9CA3AF" }}>
                      <div style={{ display:"flex", justifyContent:"center", color:"#7C3AED", marginBottom:10 }}><IcoAI size={32} /></div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#1E1B4B", marginBottom:6 }}>Ready to explain your health risk</div>
                      <div style={{ fontSize:12 }}>Click "Explain Now" to get your personalized AI reasoning</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ RISK PAGE ══════════════════════════════════════ */}
          {nav === "risk" && (
            <div>
              <p className="fu d1" style={{ fontSize:14, color:"#6B7280", marginBottom:20 }}>Your health credit score — one number that tells your complete health story.</p>
              <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20 }}>
                <div className="card fu d2" style={{ padding:28, background:"linear-gradient(160deg,#4C1D95,#7C3AED)", border:"none", display:"flex", flexDirection:"column", alignItems:"center" }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,.6)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.15em", marginBottom:16 }}>HEALTH CREDIT SCORE™</div>
                  <RiskRing score={score} size={180} strokeW={14} />
                  <div style={{ marginTop:20, width:"100%", padding:"12px", borderRadius:12, background:"rgba(255,255,255,.12)", textAlign:"center" }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.7)" }}>Better than</div>
                    <div style={{ fontSize:28, fontWeight:800, color:"#fff" }}>{score>=70?"18":score>=50?"45":"71"}%</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.7)" }}>of users today</div>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {[
                    { label:"Sleep Impact",    pts:Math.round(Math.max(0,(8-sleep)/8)*100*0.35), weight:35, color:"#8B5CF6", icon:<IcoRisk/>, desc:`${sleep}hrs — ${sleep<7?"Below":"At"} WHO recommended 7–9hrs` },
                    { label:"Stress Impact",   pts:Math.round(stress*0.40),                     weight:40, color:"#EF4444", icon:<IcoTrend/>, desc:`${stress}% stress — ${stress>60?"High cortisol detected":"Within normal range"}` },
                    { label:"Activity Impact", pts:Math.round(Math.max(0,(10000-activity)/10000)*100*0.25), weight:25, color:"#10B981", icon:<IcoStar/>, desc:`${activity.toLocaleString()} steps — ${activity<6000?"Below":"Approaching"} 10k goal` },
                  ].map((f,i) => (
                    <div key={f.label} className="card fu" style={{ padding:20, animationDelay:`${i*.08+.1}s` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:40, height:40, borderRadius:12, background:`${f.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{f.icon}</div>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700, color:"#1E1B4B" }}>{f.label}</div>
                            <div style={{ fontSize:11, color:"#9CA3AF" }}>{f.desc}</div>
                          </div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:28, fontWeight:800, color:f.color, fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1 }}>+{f.pts}</div>
                          <div style={{ fontSize:11, color:"#9CA3AF" }}>of {f.weight} max pts</div>
                        </div>
                      </div>
                      <div style={{ height:8, borderRadius:4, background:"#EDE9FE", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:4, background:`linear-gradient(90deg,${f.color}77,${f.color})`, width:`${(f.pts/f.weight)*100}%`, boxShadow:`0 0 12px ${f.color}55` }}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ MEMBERS PAGE ══════════════════════════════════ */}
          {nav === "members" && (
            <div>
              <p className="fu d1" style={{ fontSize:14, color:"#6B7280", marginBottom:20 }}>Monitor health risk across your connected circle. Support each other's health journey.</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
                {MEMBERS.map((m,i) => (
                  <div key={m.name} className="card fu" style={{ padding:22, animationDelay:`${i*.07}s` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
                      <div style={{ width:52, height:52, borderRadius:"50%", background:m.avatar_color, border:`2.5px solid ${m.color}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:800, color:m.color, fontFamily:"'DM Mono',monospace" }}>{m.av}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:15, fontWeight:800, color:"#1E1B4B" }}>{m.name}</div>
                        <span className="badge" style={{ background:`${m.color}18`, color:m.color, marginTop:4, display:"inline-block" }}>{m.status}</span>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:38, fontWeight:800, color:m.color, fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1 }}>{m.score}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:m.trend.startsWith("+")?"#EF4444":"#10B981", fontFamily:"'DM Mono',monospace" }}>{m.trend} this week</div>
                      </div>
                    </div>
                    <div style={{ height:8, borderRadius:4, background:"#EDE9FE", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:4, background:`linear-gradient(90deg,${m.color}66,${m.color})`, width:`${m.score}%`, boxShadow:`0 0 10px ${m.color}44` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════ REPORTS PAGE ══════════════════════════════════ */}
          {nav === "report" && (
            <div className="card fu d1" style={{ padding:48, textAlign:"center", maxWidth:480, margin:"0 auto" }}>
              <div style={{ display:"flex", justifyContent:"center", color:"#7C3AED", marginBottom:16 }}><IcoReport /></div>
              <div style={{ fontSize:20, fontWeight:800, color:"#1E1B4B", marginBottom:8 }}>Daily Health Reports</div>
              <div style={{ fontSize:14, color:"#6B7280", marginBottom:24 }}>PDF export with your full health breakdown, risk score, and AI action plan. Coming next!</div>
              <button className="primary-btn" onClick={() => setNav("dashboard")}>← Back to Dashboard</button>
            </div>
          )}

        </main>
      </div>

      {/* UPDATE MODAL */}
      {showUpdateModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:"#1E1B4B" }}>Update Today's Data</h2>
              <button onClick={() => setShowUpdateModal(false)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:24, color:"#9CA3AF" }}>&times;</button>
            </div>
            <Slider label="Sleep Duration" icon={<IcoRisk/>} value={tempSleep} min={0} max={12} step={0.1} unit=" hrs" color="#8B5CF6" onChange={setTempSleep} />
            <Slider label="Stress Level" icon={<IcoTrend/>} value={tempStress} min={0} max={100} unit="%" color="#EF4444" onChange={setTempStress} />
            <Slider label="Daily Steps" icon={<IcoStar/>} value={tempActivity} min={0} max={15000} step={100} unit=" steps" color="#10B981" onChange={setTempActivity} />
            <Slider label="Working Hours" icon={<IcoTrend/>} value={tempWorkHrs} min={0} max={20} step={0.5} unit=" hrs" color="#F59E0B" onChange={setTempWorkHrs} />
            <Slider label="Water Intake" icon={<IcoRisk/>} value={tempWater} min={0} max={8} step={0.5} unit=" L" color="#06B6D4" onChange={setTempWater} />
            <Slider label="Smoking" icon={<IcoTrend/>} value={tempSmoking} min={0} max={40} step={1} unit=" cigs" color="#6B7280" onChange={setTempSmoking} />
            <Slider label="Alcohol" icon={<IcoRisk/>} value={tempAlcohol} min={0} max={20} step={1} unit=" drinks" color="#EF4444" onChange={setTempAlcohol} />
            <div style={{ display:"flex", gap:10, marginTop:24 }}>
              <button className="ghost-btn" style={{ flex:1 }} onClick={() => setShowUpdateModal(false)}>Cancel</button>
              <button className="primary-btn" style={{ flex:1 }} onClick={() => {
                setSleep(tempSleep); setStress(tempStress); setActivity(tempActivity);
                setWorkHrs(tempWorkHrs); setWater(tempWater); setSmoking(tempSmoking); setAlcohol(tempAlcohol);
                const newScore = Math.min(100, Math.round(tempStress * 0.40 + Math.max(0, (8 - tempSleep) / 8) * 100 * 0.35 + Math.max(0, (10000 - tempActivity) / 10000) * 100 * 0.25));
                setBaseScore(newScore);
                setShowUpdateModal(false);
              }}>Save Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
