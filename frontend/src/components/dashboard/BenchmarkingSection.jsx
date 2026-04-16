import React from 'react';
import { Users, TrendingDown } from 'lucide-react';

export default function BenchmarkingSection({ userScore, isGuest, hideData }) {
  // Mock data for demographic distribution
  const distribution = [
    { range: '0-20', count: 5, label: 'Low Risk' },
    { range: '21-40', count: 18, label: 'Low Risk' },
    { range: '41-60', count: 45, label: 'Moderate' },
    { range: '61-80', count: 22, label: 'High Risk' },
    { range: '81-100', count: 10, label: 'Severe' }
  ];

  const maxCount = Math.max(...distribution.map(d => d.count));

  // Determine user's bucket index
  const userBucketIndex = hideData ? -1 : Math.min(4, Math.floor(userScore / 20));

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Demographic Benchmark</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Compared to users aged 30-40</p>
        </div>
        <div style={{ padding: 8, background: 'var(--bg-tertiary)', borderRadius: '50%', color: 'var(--text-primary)' }}>
          <Users size={16} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 8, paddingBottom: 24, borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
        {distribution.map((d, i) => {
          const isUserBucket = !hideData && i === userBucketIndex;
          const heightPct = (d.count / maxCount) * 100;
          
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div 
                style={{ 
                  width: '100%', height: `${heightPct}%`, 
                  background: isUserBucket ? 'var(--color-accent)' : 'var(--border-color)',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  transition: 'height 0.3s'
                }} 
              />
              <div style={{ position: 'absolute', bottom: -20, fontSize: 10, color: isUserBucket ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: isUserBucket ? 700 : 500 }}>
                {d.range}
              </div>
              {isUserBucket && (
                <div style={{ position: 'absolute', top: -24, fontSize: 10, background: 'var(--text-primary)', color: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                  You
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingDown size={16} color="var(--color-success)" />
          <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
             {isGuest 
               ? "Login to compare your metrics with your demographic benchmark." 
               : hideData 
                 ? "Log your first daily entry to see demographic benchmarks."
                 : `You are in the top 35% of your demographic`}
          </span>
        </div>
      </div>
    </div>
  );
}
