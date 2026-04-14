import React from 'react';
import { Sliders, Droplets, Wine, Cigarette, UtensilsCrossed } from 'lucide-react';

function SliderControl({ label, value, min, max, step, unit, onChange, icon: Icon, iconColor }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon && <Icon size={14} color={iconColor || 'var(--text-secondary)'} />}
          {label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{value}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function ToggleControl({ label, checked, onChange, icon: Icon, iconColor, description }) {
  return (
    <div className="toggle-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div className="toggle-icon" style={{ background: checked ? (iconColor || 'var(--color-success)') + '18' : 'var(--bg-tertiary)' }}>
          {Icon && <Icon size={16} color={checked ? (iconColor || 'var(--color-success)') : 'var(--text-muted)'} />}
        </div>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{label}</span>
          {description && <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, display: 'block' }}>{description}</span>}
        </div>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}

export default function WhatIfSimulator({
  sleep, stress, activity,
  setSleep, setStress, setActivity,
  water, setWater,
  alcohol, setAlcohol,
  smoking, setSmoking,
  mealsOnTime, setMealsOnTime,
  currentScore
}) {
  const scoreColor = currentScore > 70 ? 'var(--color-danger)' : currentScore > 50 ? 'var(--color-warning)' : 'var(--color-success)';
  
  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Sliders size={18} color="var(--color-accent)" />
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>What-If Simulator</h3>
      </div>
      
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
        Adjust your daily habits to see real-time impact on your risk score.
      </p>

      {/* Slider Controls */}
      <SliderControl label="Sleep Duration" value={sleep} min={0} max={12} step={0.5} unit=" hrs" onChange={setSleep} />
      <SliderControl label="Stress Level" value={stress} min={0} max={100} step={5} unit="%" onChange={setStress} />
      <SliderControl label="Daily Activity" value={activity} min={0} max={15000} step={500} unit=" steps" onChange={setActivity} />
      <SliderControl label="Water Intake" value={water} min={0} max={5} step={0.1} unit=" L" onChange={setWater} icon={Droplets} iconColor="#0EA5E9" />

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-color)', margin: '8px 0 16px' }} />

      {/* Toggle Controls */}
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
        Today's Habits
      </p>

      <ToggleControl
        label="Meals On Time"
        description="Had all meals at regular hours"
        checked={mealsOnTime}
        onChange={setMealsOnTime}
        icon={UtensilsCrossed}
        iconColor="#10B981"
      />
      <ToggleControl
        label="No Alcohol"
        description="No alcoholic drinks today"
        checked={!alcohol}
        onChange={(v) => setAlcohol(!v)}
        icon={Wine}
        iconColor="#8B5CF6"
      />
      <ToggleControl
        label="No Smoking"
        description="Smoke-free today"
        checked={!smoking}
        onChange={(v) => setSmoking(!v)}
        icon={Cigarette}
        iconColor="#F59E0B"
      />

      {/* Projected Score */}
      <div style={{
        marginTop: 20, padding: 16, background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', border: '1px solid var(--border-color)'
      }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block' }}>Projected Score</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lower is healthier</span>
        </div>
        <span style={{
          fontSize: 28, fontWeight: 800,
          fontFamily: 'var(--font-sans)', color: scoreColor,
          transition: 'color 0.3s ease'
        }}>
          {currentScore}
        </span>
      </div>
    </div>
  );
}
