import React, { useState } from 'react';
import { Brain, Target, Activity, Wind, Heart, Moon, Droplets, Utensils } from 'lucide-react';

export default function AIInsights({ score, sleep, stress, activity, water, alcohol, smoking, mealsOnTime, todayLog }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [showActions, setShowActions] = useState(false);
  
  // Compute factor contributions
  const sleepHrs = typeof sleep === 'number' && sleep <= 14 ? sleep : sleep / 10; // handle both raw and *10 values
  const stressVal = stress > 10 ? stress : stress * 10; // normalize to 0-100
  
  const sleepImpact = Math.round(Math.max(0, (8 - sleepHrs) / 8) * 100 * 0.25);
  const stressImpact = Math.round(stressVal * 0.30);
  const activityImpact = Math.round(Math.max(0, (10000 - activity) / 10000) * 100 * 0.15);
  const waterImpact = Math.round(Math.max(0, (3 - (water || 0)) / 3) * 100 * 0.10);

  // Extract vitals from daily log if available
  const vitals = todayLog?.vitals || {};
  const notes = todayLog?.notes || {};
  const hasVitals = !!(vitals.heartRate || vitals.bpSys || vitals.spo2);
  const hasSymptoms = notes.symptoms?.length > 0;

  const runAI = () => {
    if (aiLoading) return;
    setAiLoading(true); 
    setAiText(""); 
    setShowActions(false);

    // Build a richer analysis message using all available data
    let msg = `Your clinical health risk score is ${score}/100. `;

    // Core factors
    msg += `Current factors: Sleep (${sleepHrs}hrs, contributing +${sleepImpact} pts), `;
    msg += `Stress level (${stressVal}%, contributing +${stressImpact} pts), `;
    msg += `Activity (${activity} steps, contributing +${activityImpact} pts), `;
    msg += `Hydration (${water?.toFixed(1) || '0'}L, contributing +${waterImpact} pts). `;

    // Habits analysis
    const habits = [];
    if (alcohol) habits.push("alcohol consumption (+8 pts)");
    if (smoking) habits.push("smoking (+10 pts)");
    if (!mealsOnTime) habits.push("irregular meals (+5 pts)");
    if (habits.length > 0) {
      msg += `Habit penalties: ${habits.join(", ")}. `;
    } else {
      msg += `All lifestyle habits are positive today — no penalties applied. `;
    }

    // Vitals commentary
    if (hasVitals) {
      msg += "Vitals recorded today: ";
      if (vitals.heartRate) msg += `Heart Rate ${vitals.heartRate} bpm${vitals.heartRate < 60 || vitals.heartRate > 100 ? " (outside normal range)" : " (normal)"}, `;
      if (vitals.bpSys) msg += `Blood Pressure ${vitals.bpSys}/${vitals.bpDia} mmHg${vitals.bpSys > 130 ? " (elevated)" : " (normal)"}, `;
      if (vitals.spo2) msg += `SpO₂ ${vitals.spo2}%${vitals.spo2 < 95 ? " (low — monitor closely)" : " (normal)"}, `;
      if (vitals.temperature) msg += `Temperature ${vitals.temperature}°C${vitals.temperature > 37.5 ? " (elevated)" : " (normal)"}, `;
      msg = msg.replace(/, $/, ". ");
    }

    // Symptoms
    if (hasSymptoms) {
      msg += `Reported symptoms: ${notes.symptoms.join(", ")}. These should be monitored and reported to your physician if persistent. `;
    }

    // Overall recommendation
    if (score >= 70) {
      msg += "Your risk profile is currently HIGH. Primary drivers are elevated stress combined with insufficient sleep and low activity. Immediate behavioral interventions are recommended: prioritize 7+ hours of sleep tonight, take a 20-minute walk, and practice stress-reduction techniques. Consider consulting your physician.";
    } else if (score >= 50) {
      msg += "Your risk profile is MODERATE. Focus on improving your weakest areas — the factors above are ordered by severity. Consistent small changes over the next 7 days can move you into the healthy range.";
    } else {
      msg += "Your risk profile is in the HEALTHY range. Continue maintaining your current habits. Focus on consistency rather than perfection.";
    }

    msg += " Here are your priority evidence-based actions for today.";
    
    let i = 0;
    const interval = setInterval(() => {
      if (i >= msg.length) { 
        clearInterval(interval); 
        setAiLoading(false); 
        setShowActions(true); 
        return; 
      }
      setAiText(prev => msg.slice(0, prev.length + 3));
      i += 3;
    }, 12);
  };

  // Generate dynamic actions based on actual data
  const getActions = () => {
    const actions = [];
    
    if (sleepHrs < 7) {
      actions.push({
        title: "Optimize Sleep Window",
        desc: `You logged ${sleepHrs}hrs — aim for 7-8hrs. Target a 10:30 PM bedtime.`,
        impact: `-${sleepImpact} pts`,
        icon: <Moon size={20} />
      });
    }
    if (stressVal > 50) {
      actions.push({
        title: "Stress Reduction Protocol",
        desc: "Two sessions of 5-min box breathing to manage cortisol levels.",
        impact: `-${Math.round(stressImpact * 0.4)} pts`,
        icon: <Wind size={20} />
      });
    }
    if (activity < 8000) {
      actions.push({
        title: "Increase Daily Movement",
        desc: `Currently ${activity.toLocaleString()} steps. A 15-min post-meal walk adds ~2,000 steps.`,
        impact: `-${activityImpact} pts`,
        icon: <Activity size={20} />
      });
    }
    if ((water || 0) < 2.5) {
      actions.push({
        title: "Hydration Boost",
        desc: `${water?.toFixed(1) || '0'}L logged — target 2.5-3L. Set hourly water reminders.`,
        impact: `-${waterImpact} pts`,
        icon: <Droplets size={20} />
      });
    }
    if (!mealsOnTime) {
      actions.push({
        title: "Regulate Meal Timing",
        desc: "Complete all 3 meals at consistent times for metabolic stability.",
        impact: "-5 pts",
        icon: <Utensils size={20} />
      });
    }
    
    // Always show at least 3 actions
    if (actions.length < 3) {
      actions.push({
        title: "Maintain Current Habits",
        desc: "Your health metrics are looking good. Keep up the consistency.",
        impact: "—",
        icon: <Heart size={20} />
      });
    }

    return actions.slice(0, 5);
  };

  // Factor bars for the breakdown section
  const factors = [
    { label: "Stress / Cortisol", value: stressImpact, max: 30, color: "var(--color-danger)", icon: <Wind size={16} /> },
    { label: "Sleep Deprivation", value: sleepImpact, max: 25, color: "var(--color-purple)", icon: <Moon size={16} /> },
    { label: "Sedentary Behavior", value: activityImpact, max: 15, color: "var(--color-warning)", icon: <Activity size={16} /> },
    { label: "Dehydration", value: waterImpact, max: 10, color: "#0EA5E9", icon: <Droplets size={16} /> },
  ].sort((a, b) => b.value - a.value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900, margin: "0 auto" }}>

      {/* Factor Breakdown Card */}
      <div className="card fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={16} color="var(--color-accent)" /> Risk Factor Breakdown
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>How each factor contributes to your score — sourced from your daily log</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {factors.map((f, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {f.icon} {f.label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: f.color }}>+{f.value} pts</span>
              </div>
              <div style={{ height: 6, width: '100%', background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ 
                  height: '100%', width: `${Math.min(100, (f.value / f.max) * 100)}%`, 
                  background: f.color, borderRadius: 3, transition: 'width 0.6s ease-out' 
                }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>max {f.max} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Card */}
      <div className="card fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={20} color="var(--color-purple)" /> AI Clinical Analysis
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Personalized analysis using your daily log data — vitals, lifestyle, and habits.
            </p>
          </div>
          <button className="primary-btn" onClick={runAI} disabled={aiLoading} style={{ background: 'var(--color-purple)' }}>
            {aiLoading ? "Analyzing..." : "Generate Analysis"}
          </button>
        </div>

        <div style={{ minHeight: 120, padding: 24, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: 28 }}>
          {!aiText && !aiLoading && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: 28, fontSize: 13, fontWeight: 500 }}>
              Click "Generate Analysis" to receive a personalized AI breakdown based on your logged data.
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
              Priority Interventions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {getActions().map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-purple)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#F3E8FF', color: 'var(--color-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {a.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{a.desc}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-success)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                    {a.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
