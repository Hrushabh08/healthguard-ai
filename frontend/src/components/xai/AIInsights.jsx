import React, { useState } from 'react';
import { Brain, Target } from 'lucide-react';

export default function AIInsights({ score, sleep, stress, activity }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [showActions, setShowActions] = useState(false);
  
  const runAI = () => {
    if (aiLoading) return;
    setAiLoading(true); 
    setAiText(""); 
    setShowActions(false);
    
    const sleepImpact = Math.round(Math.max(0,(8-sleep)/8)*100*0.35);
    const stressImpact = Math.round(stress*0.4);
    const activityImpact = Math.round(Math.max(0,(10000-activity)/10000)*100*0.25);

    const msg = `Your clinical health risk score is ${score}/100. Current factors: Sleep (${sleep}hrs), Stress (${stress}%), Activity (${activity} steps). Sleep contributes ${sleepImpact} pts, Stress contributes ${stressImpact} pts, and Activity contributes ${activityImpact} pts. ${score >= 70 ? "Your primary driver is stress combined with insufficient sleep. High cortisol from sustained stress is compounding the impact of reduced recovery quality. Based on clinical guidelines, immediate behavioral interventions are required." : "Your risk profile is presently moderate. Small, consistent changes in your environment and habits will move you to the healthy range within 7 days."} Here are your priority evidence-based actions for today.`;
    
    let i = 0;
    const interval = setInterval(() => {
      if (i >= msg.length) { 
        clearInterval(interval); 
        setAiLoading(false); 
        setShowActions(true); 
        return; 
      }
      setAiText(prev => msg.slice(0, prev.length + 2));
      i += 2;
    }, 15);
  };

  const AI_ACTIONS = [
    { title: "Optimize Sleep Window", desc: "Target 10:30 PM bedtime to reduce cortisol.", impact: "-18 pts" },
    { title: "Breathing Exercise", desc: "Two sessions of 5-min box breathing to manage systemic stress.", impact: "-12 pts" },
    { title: "Post-meal Walk", desc: "15-min walk after lunch to accelerate metabolic rate.", impact: "-8 pts" },
  ];

  return (
    <div className="card fade-in" style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Brain size={20} color="var(--color-purple)" /> AI Clinical Insights
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Live generative logic identifying your most urgent health factors.</p>
        </div>
        <button className="primary-btn" onClick={runAI} disabled={aiLoading} style={{ background: 'var(--color-purple)' }}>
          {aiLoading ? "Analyzing..." : "Generate Insights"}
        </button>
      </div>

      <div style={{ minHeight: 140, padding: 24, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: 28 }}>
        {!aiText && !aiLoading && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 28, fontSize: 13, fontWeight: 500 }}>
            Click "Generate Insights" to receive a personalized AI breakdown of your vitals.
          </div>
        )}
        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, fontWeight: 500 }}>
          {aiText}
          {aiLoading && <span style={{ opacity: 0.5, animation: 'fadeIn 0.5s infinite alternate', color: 'var(--color-purple)' }}>|</span>}
        </p>
      </div>

      {showActions && (
        <div className="fade-in">
          <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Priority AI Interventions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AI_ACTIONS.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-purple)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#F3E8FF', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{a.desc}</div>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>
                  {a.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
