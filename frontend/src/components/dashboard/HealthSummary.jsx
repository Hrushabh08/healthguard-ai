import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function HealthSummary({ score }) {
  // New requirement: replace single percentage with ranges
  const getRange = (score) => {
    if (score <= 5) return '0-10';
    if (score >= 95) return '90-100';
    return `${Math.floor(score/10)*10}-${Math.ceil(score/10)*10}`;
  };

  const getRiskInfo = (score) => {
    if (score >= 70) return { label: 'High Risk', color: 'var(--color-danger)', bg: '#FEE2E2', icon: <ShieldAlert size={24} color="var(--color-danger)" /> };
    if (score >= 50) return { label: 'Moderate Risk', color: 'var(--color-warning)', bg: '#FEF3C7', icon: <ShieldAlert size={24} color="var(--color-warning)" /> };
    return { label: 'Healthy Range', color: 'var(--color-success)', bg: '#D1FAE5', icon: <ShieldCheck size={24} color="var(--color-success)" /> };
  };

  const risk = getRiskInfo(score);
  const range = getRange(score);

  return (
    <div className="card fade-in" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'linear-gradient(145deg, var(--bg-secondary), var(--bg-tertiary))' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '8px 16px', background: risk.bg, borderRadius: '999px' }}>
        {risk.icon}
        <span style={{ fontSize: 13, fontWeight: 700, color: risk.color }}>{risk.label}</span>
      </div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        {/* Subtle background glow */}
        <div style={{ position: 'absolute', inset: 0, background: risk.color, filter: 'blur(40px)', opacity: 0.15, borderRadius: '50%' }} />
        
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Estimated Risk Window
        </div>
        
        <div style={{ fontSize: 72, fontWeight: 800, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {range}<span style={{ fontSize: 32, color: 'var(--text-muted)' }}>%</span>
        </div>
      </div>

      <div style={{ maxWidth: 280, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Based on your behavioral data and clinical markers, your health volatility is currently within the {risk.label.toLowerCase()} quadrant. 
      </div>

      <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)' }} />
        High Confidence Interval (±2%)
      </div>
    </div>
  );
}
