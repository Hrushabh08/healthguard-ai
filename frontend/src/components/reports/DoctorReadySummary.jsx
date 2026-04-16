import React from 'react';
import { FileText, Download, AlertCircle, CheckCircle, Lock } from 'lucide-react';

export default function DoctorReadySummary({ score, sleep, stress, activity, water, todayLog, isGuest, hideData, navigate }) {
  const riskLabel = score >= 70 ? "High Risk" : score >= 50 ? "Moderate Risk" : "Low Risk";
  const riskColor = score >= 70 ? "var(--color-danger)" : score >= 50 ? "var(--color-warning)" : "var(--color-success)";

  // Extract real data from daily log
  const vitals = todayLog?.vitals || {};
  const ls = todayLog?.lifestyle || {};
  const notes = todayLog?.notes || {};
  const hasLog = !!todayLog;

  // Normalize values
  const sleepHrs = typeof sleep === 'number' && sleep <= 14 ? sleep : (sleep || 0) / 10;
  const stressVal = stress > 10 ? stress : (stress || 0) * 10;
  const steps = activity || 0;

  // Build dynamic report bullets
  let bullets = [];

  if (hideData) {
    if (isGuest) {
      bullets = [
        "No health data has been logged for this guest session.",
        "Login to record your vitals, habits, and symptoms to generate a clinical-grade summary for your physician.",
        "The current analysis shows a baseline <strong>0/100</strong> Risk Score."
      ];
    } else {
      bullets = [
        "No health data has been logged for today.",
        "Go to the <strong>Daily Log</strong> section to record your vitals and habits.",
        "Once recorded, this report will provide a clinical-grade summary for your physician.",
        "The current analysis shows a baseline <strong>0/100</strong> Risk Score."
      ];
    }
  } else {
    // Overall score
    bullets.push(
      `Patient's current risk score is <strong>${score}/100</strong> (${riskLabel}), computed from daily self-reported lifestyle metrics and vitals.`
    );

    // Sleep
    if (sleepHrs < 7) {
      bullets.push(
        `Sleep logged at <strong>${sleepHrs} hrs</strong>, below the recommended 7-8 hour threshold. Chronic sleep deficit correlates with elevated cortisol and metabolic risk.`
      );
    } else {
      bullets.push(
        `Sleep duration adequate at <strong>${sleepHrs} hrs/night</strong>. No sleep-related risk flags.`
      );
    }

    // Vitals
    if (vitals.heartRate || vitals.bpSys) {
      let vitalStr = "Self-reported vitals: ";
      const vitalParts = [];
      if (vitals.heartRate) {
        const hrStatus = vitals.heartRate < 60 || vitals.heartRate > 100 ? " (outside normal)" : " (normal)";
        vitalParts.push(`HR ${vitals.heartRate} bpm${hrStatus}`);
      }
      if (vitals.bpSys) {
        const bpStatus = vitals.bpSys > 130 || vitals.bpDia > 85 ? " (elevated)" : " (within range)";
        vitalParts.push(`BP ${vitals.bpSys}/${vitals.bpDia} mmHg${bpStatus}`);
      }
      if (vitals.spo2) {
        const spStatus = vitals.spo2 < 95 ? " (low — monitor)" : " (normal)";
        vitalParts.push(`SpO₂ ${vitals.spo2}%${spStatus}`);
      }
      if (vitals.temperature) {
        const tempStatus = vitals.temperature > 37.5 ? " (elevated)" : " (normal)";
        vitalParts.push(`Temp ${vitals.temperature}°C${tempStatus}`);
      }
      bullets.push(vitalStr + vitalParts.join(", ") + ".");
    }

    // Activity
    if (steps < 5000) {
      bullets.push(
        `Daily activity is <strong>${steps.toLocaleString()} steps</strong>, significantly below the 8,000-step target. Recommend structured exercise or post-meal walking.`
      );
    } else {
      bullets.push(
        `Daily activity at <strong>${steps.toLocaleString()} steps</strong>. ${steps >= 8000 ? "Meeting recommended target." : "Slightly below optimal; minor improvement suggested."}`
      );
    }

    // Hydration
    if (water && water < 2) {
      bullets.push(
        `Hydration logged at <strong>${water.toFixed(1)}L</strong>, below recommended 2.5L. Dehydration impacts cognitive function and metabolic processes.`
      );
    }

    // Symptoms & medications
    if (notes.symptoms?.length > 0) {
      bullets.push(
        `Patient reported symptoms: <strong>${notes.symptoms.join(", ")}</strong>. These should be evaluated in clinical context.`
      );
    }
    if (notes.medicines) {
      bullets.push(
        `Current medications: <strong>${notes.medicines}</strong>.`
      );
    }
    if (notes.bloodSugar) {
      const bsStatus = notes.bloodSugar > 100 ? " (elevated — prediabetic range)" : notes.bloodSugar < 70 ? " (low)" : " (normal)";
      bullets.push(
        `Fasting blood sugar: <strong>${notes.bloodSugar} mg/dL</strong>${bsStatus}.`
      );
    }

    // Recommendation
    if (score >= 70) {
      bullets.push(
        "Recommended intervention: Behavioral adjustment targeting stress reduction and 7+ hours of sleep. Consider cardiovascular assessment if elevated vitals persist."
      );
    } else if (score >= 50) {
      bullets.push(
        "Recommended intervention: Lifestyle optimization focusing on identified weak areas. Follow-up assessment in 2 weeks recommended."
      );
    } else {
      bullets.push(
        "No acute interventions required. Continue current health maintenance program. Routine follow-up recommended."
      );
    }
  }

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <FileText size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Export to Physician</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Auto-generated from your daily log data</p>
          </div>
        </div>
        {isGuest ? (
          <div className="guest-overlay-container">
            <button className="primary-btn" onClick={() => navigate('/login')} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', padding: '8px 14px' }}>
              <Lock size={14} /> Login to Export
            </button>
            <div className="guest-tooltip">Please login to export reports</div>
          </div>
        ) : (
          <button className="primary-btn" style={{ padding: '8px 14px' }}>
            <Download size={14} /> Export
          </button>
        )}
      </div>

      {/* Data source indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 12, fontWeight: 500,
        background: (hasLog && !hideData) ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
        border: `1px solid ${(hasLog && !hideData) ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
        color: (hasLog && !hideData) ? '#059669' : '#D97706'
      }}>
        {(hasLog && !hideData) ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
        {hideData ? "No data logged today — showing preview state" : (hasLog ? "Report generated from today's daily log" : "No daily log found — using default values")}
      </div>

      {/* Risk Score Badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
        borderRadius: 'var(--radius-sm)', marginBottom: 16,
        background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)'
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: riskColor,
          border: `2px solid ${riskColor}`, background: `${riskColor}10`
        }}>
          {score}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{riskLabel} Profile</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Clinical Brief */}
      <div style={{ padding: 16, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', fontFamily: 'var(--font-sans)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          Clinical Brief — Active
        </div>
        
        <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13, color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: 10, lineHeight: 1.6 }}>
          {bullets.map((b, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
          ))}
        </ul>
      </div>
    </div>
  );
}
