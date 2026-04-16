import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function MicroGoals({ isGuest }) {
  const [goals, setGoals] = React.useState([
    { id: 1, text: 'Drink 2 liters of water', completed: false, pts: '+5' },
    { id: 2, text: '15-minute walk after lunch', completed: false, pts: '+8' },
    { id: 3, text: 'Sleep by 10:30 PM', completed: false, pts: '+12' },
  ]);

  React.useEffect(() => {
    if (isGuest) {
      setGoals(prev => prev.map(g => ({ ...g, completed: false })));
    }
  }, [isGuest]);

  const toggleGoal = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const completedCount = goals.filter(g => g.completed).length;

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Daily Micro-Goals</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Small actions, compounding impact</p>
        </div>
        <div className="badge info">
          {completedCount} / {goals.length} Completed
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {goals.map(goal => (
          <div key={goal.id} 
            onClick={() => toggleGoal(goal.id)}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 'var(--radius-sm)',
              background: goal.completed ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              border: `1px solid ${goal.completed ? 'var(--border-color)' : 'var(--border-color)'}`,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {goal.completed ? 
                <CheckCircle2 color="var(--color-success)" size={20} /> : 
                <Circle color="var(--text-muted)" size={20} />
              }
              <span style={{ 
                fontSize: 13, fontWeight: 500, 
                color: goal.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: goal.completed ? 'line-through' : 'none'
              }}>
                {goal.text}
              </span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: goal.completed ? 'var(--text-muted)' : 'var(--color-accent)' }}>
              {goal.pts} pts
            </div>
          </div>
        ))}
      </div>
      
      {completedCount === goals.length && (
        <div style={{ marginTop: 16, padding: '10px', background: '#D1FAE5', borderRadius: 'var(--radius-sm)', fontSize: 12, color: '#059669', textAlign: 'center', fontWeight: 600 }}>
          All goals completed! Excellent work today.
        </div>
      )}
    </div>
  );
}
