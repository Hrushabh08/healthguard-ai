import React from 'react';
import { Cloud, Thermometer, Wind } from 'lucide-react';

export default function EnvironmentalInsights({ aqi = 42, temp = 24, humidity = 45 }) {
  const getAqiStatus = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: 'var(--color-success)' };
    if (aqi <= 100) return { label: 'Moderate', color: 'var(--color-warning)' };
    return { label: 'Unhealthy', color: 'var(--color-danger)' };
  };

  const status = getAqiStatus(aqi);

  return (
    <div className="card fade-in">
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Environmental Context</h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Current external factors affecting your health</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div className="pill-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <Cloud size={16} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>AQI</span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-sans)', color: status.color }}>{aqi}</div>
            <div style={{ fontSize: 11, color: status.color, fontWeight: 600 }}>{status.label}</div>
          </div>
        </div>

        <div className="pill-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <Thermometer size={16} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Temp</span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>{temp}°C</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Optimal</div>
          </div>
        </div>

        <div className="pill-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
            <Wind size={16} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Humidity</span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>{humidity}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Comfortable</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <strong>Insight:</strong> Air quality is optimal today. It's a great time for outdoor exercises to boost your activity score.
      </div>
    </div>
  );
}
