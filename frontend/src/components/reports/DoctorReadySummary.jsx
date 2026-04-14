import React from 'react';
import { FileText, Download } from 'lucide-react';

export default function DoctorReadySummary({ score, topFactors }) {
  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <FileText size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Export to Physician</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Medical brief summary</p>
          </div>
        </div>
        <button className="primary-btn" style={{ padding: '8px 14px' }}>
          <Download size={14} /> Export
        </button>
      </div>

      <div style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Clinical Brief — Active
        </div>
        
        <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li>
            Patient's 7-day risk score average is <strong>{score}</strong> (Moderate Risk), primarily driven by elevated cortisol factors and suboptimal sleep duration.
          </li>
          <li>
            Average sleep logged at <strong>5.1 hrs/night</strong>, correlating with a +35% impact on systemic stress.
          </li>
          <li>
            Recommended intervention: Behavioral adjustment targeting 7+ hours of sleep. Vitals remain stable; no acute cardiovascular markers flagged via activity data.
          </li>
        </ul>
      </div>
    </div>
  );
}
