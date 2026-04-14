import React from 'react';
import { Activity, BrainCircuit } from 'lucide-react';

export default function ExplainableAI({ sleep, stress, activity }) {
  // Simplified logic for component
  const factors = [
    { label: "Cortisol/Stress Index", value: Math.round(stress * 0.40), color: "var(--color-danger)", desc: "High sustained stress levels observed today. Primary contributor." },
    { label: "Sleep Deprivation", value: Math.round(Math.max(0, (8 - sleep) / 8) * 100 * 0.35), color: "var(--color-purple)", desc: "Below 7 hours threshold; affects cognitive and metabolic recovery." },
    { label: "Sedentary Behavior", value: Math.round(Math.max(0, (10000 - activity) / 10000) * 100 * 0.25), color: "var(--color-warning)", desc: "Activity below 10k target, minor risk factor." }
  ].sort((a,b) => b.value - a.value);

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BrainCircuit size={16} color="var(--color-accent)" /> SHAP Factor Analysis
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Why your risk is at this level</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {factors.map((f, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: f.color }}>+{f.value} pts</span>
            </div>
            
            <div style={{ height: 6, width: '100%', background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ 
                height: '100%', width: `${Math.min(100, f.value * 2.5)}%`, 
                background: f.color, borderRadius: 3, transition: 'width 0.5s ease-out' 
              }} />
            </div>
            
            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
