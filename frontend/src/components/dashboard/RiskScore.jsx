import React, { useState, useEffect } from 'react';
import { Activity, Wind, Heart } from 'lucide-react';

function RiskRing({ score, size = 220, strokeW = 16 }) {
  const [cur, setCur] = useState(0);
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (cur / 100) * circ;
  
  const riskColor = score >= 70 ? 'var(--color-danger)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-success)';

  useEffect(() => {
    let raf, n = 0;
    const t = setTimeout(() => {
      const go = () => { 
        n += 1.5; 
        if (n >= score) { setCur(score); return; } 
        setCur(Math.round(n)); 
        raf = requestAnimationFrame(go); 
      };
      raf = requestAnimationFrame(go);
    }, 100);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [score]);

  return (
    <div style={{ position: "relative", width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={strokeW} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={riskColor} strokeWidth={strokeW}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .05s linear", filter: `drop-shadow(0 0 10px ${riskColor}33)` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: riskColor, lineHeight: 1, fontFamily: "var(--font-sans)", letterSpacing: "-0.03em" }}>{cur}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, letterSpacing: "0.15em", fontWeight: 700 }}>OUT OF 100</div>
      </div>
    </div>
  );
}

export default function RiskScore({ score, sleep, stress, activity, isGuest }) {
  const riskLabel = score >= 70 ? "High Risk" : score >= 50 ? "Moderate Risk" : "Healthy Range";
  const riskColor = score >= 70 ? "var(--color-danger)" : score >= 50 ? "var(--color-warning)" : "var(--color-success)";

  const factors = [
    { label: "Rest Deprivation", pts: isGuest ? 0 : Math.round(Math.max(0, (8 - sleep) / 8) * 100 * 0.35), weight: "35 pts", color: "var(--color-purple)", icon: <Wind size={18} /> },
    { label: "Stress/Cortisol Load", pts: isGuest ? 0 : Math.round(stress * 0.40), weight: "40 pts", color: "var(--color-danger)", icon: <Activity size={18} /> },
    { label: "Sedentary Behavior", pts: isGuest ? 0 : Math.round(Math.max(0, (10000 - activity) / 10000) * 100 * 0.25), weight: "25 pts", color: "var(--color-warning)", icon: <Heart size={18} /> },
  ].sort((a,b)=> b.pts - a.pts);

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) 1fr', gap: 24, alignItems: 'start' }}>
      
      <div className="card" style={{ textAlign: 'center', padding: "40px 32px" }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.1em", textTransform: 'uppercase', marginBottom: 32, fontWeight: 700 }}>
          Overall Clinical Risk Score
        </div>
        
        <RiskRing score={score} size={240} strokeW={14} />

        <div style={{ marginTop: 40, padding: '14px 24px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: riskColor, boxShadow: `0 0 10px ${riskColor}` }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{riskLabel} Profile</div>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Clinical Risk Vectors</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 32 }}>Primary driving factors contributing to your current risk score, ordered by severity.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {factors.map((f, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: `${f.color}15`, color: f.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     {f.icon}
                   </div>
                   <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: 20, fontWeight: 800, color: f.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>+{f.pts}</div>
                   <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>max {f.weight}</div>
                 </div>
              </div>
              <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                 <div style={{ height: '100%', borderRadius: 3, background: f.color, width: `${(f.pts / parseInt(f.weight)) * 100}%`, transition: 'width 0.6s cubic-bezier(.22,1,.36,1)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
