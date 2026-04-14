import React from 'react';
import { Sliders } from 'lucide-react';

function SliderControl({ label, value, min, max, step, unit, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{value}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function WhatIfSimulator({ sleep, stress, activity, setSleep, setStress, setActivity, currentScore }) {
  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Sliders size={18} color="var(--color-accent)" />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>What-If Simulator</h3>
      </div>
      
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
        Adjust your daily habits to see real-time impact on your risk score.
      </p>

      <SliderControl label="Sleep Duration" value={sleep} min={0} max={12} step={0.5} unit=" hrs" onChange={setSleep} />
      <SliderControl label="Stress Level" value={stress} min={0} max={100} step={5} unit="%" onChange={setStress} />
      <SliderControl label="Daily Activity" value={activity} min={0} max={15000} step={500} unit=" steps" onChange={setActivity} />
      
      <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
         <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Projected Score</span>
         <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-sans)', color: currentScore > 70 ? 'var(--color-danger)' : currentScore > 50 ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {currentScore}
         </span>
      </div>
    </div>
  );
}
