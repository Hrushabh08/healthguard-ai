import React, { useState, useEffect } from 'react';
import {
  Users, Plus, X, ChevronDown, ChevronUp, Droplets, Moon, Footprints,
  Wine, Cigarette, UtensilsCrossed, Heart, Edit3, Trash2, UserPlus, Calendar, Activity,
  Scale, Ruler, Cake, Wind, Save, Check, Mail, Stethoscope, Coffee, Pill
} from 'lucide-react';

const COMMON_SYMPTOMS = [
  "Headache", "Fatigue", "Nausea", "Dizziness", "Chest Pain",
  "Shortness of Breath", "Back Pain", "Fever", "Cough",
  "Joint Pain", "Anxiety", "Insomnia", "Blurred Vision", "Palpitations"
];

const MOOD_OPTIONS = [
  { id: "happy", label: "Happy" },
  { id: "neutral", label: "Neutral" },
  { id: "stressed", label: "Stressed" },
  { id: "low", label: "Low" },
  { id: "anxious", label: "Anxious" },
];
import { membersAPI } from '../../services/api';

function calculateAge(dob) {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  return (weight / ((height / 100) ** 2)).toFixed(1);
}

const RELATIONS = ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandparent', 'Other'];

const AVATAR_COLORS = [
  '#0EA5E9', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#14B8A6'
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Same score formula as Daily Log & Dashboard
function getMemberScore(ls) {
  if (!ls) return null;
  const sleep = ls.sleep || 0;
  const stress = (ls.stress || 0) * 10; // 1-10 → 0-100
  const steps = ls.steps ? Number(ls.steps) : 0;
  const water = ls.waterIntake || 0;

  const base =
    stress * 0.30 +
    Math.max(0, (8 - sleep) / 8) * 100 * 0.25 +
    Math.max(0, (10000 - steps) / 10000) * 100 * 0.15 +
    Math.max(0, (3 - water) / 3) * 100 * 0.10;
  const penalty =
    (ls.alcohol ? 8 : 0) +
    (ls.smoking ? 10 : 0) +
    (!(ls.breakfast && ls.lunch && ls.dinner) ? 5 : 0);
  return Math.min(100, Math.round(base + penalty));
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const EMPTY_LIFESTYLE = {
  sleep: 7, stress: 4, steps: "", waterIntake: 2.0,
  breakfast: false, lunch: false, dinner: false,
  smoking: false, alcohol: false,
  vitals: { heartRate: "", bpSys: "", bpDia: "", temperature: "", spo2: "" },
  notes: { mood: "neutral", medicines: "", symptoms: [], bloodSugar: "", caffeine: "" }
};

const STORAGE_KEY = "hg_family_members";

function scoreColor(s) {
  return s >= 70 ? "var(--color-danger)" : s >= 50 ? "var(--color-warning)" : "var(--color-success)";
}

function stressColor(v) {
  return v <= 3 ? "var(--color-success)" : v <= 6 ? "var(--color-warning)" : "var(--color-danger)";
}

export default function FamilyMembers() {
  const [members, setMembers] = useState([]);
  const [linkStatuses, setLinkStatuses] = useState({}); // { [memberId]: true|false|null }
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editDataId, setEditDataId] = useState(null);

  // Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRelation, setNewRelation] = useState('Spouse');
  const [newDob, setNewDob] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const maxDate = new Date().toISOString().split('T')[0];

  // Load from API
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const { data } = await membersAPI.getAll();
        if (data.members && data.members.length > 0) {
          const loaded = data.members.map(m => ({
            ...m,
            id: m._id || m.id,
            dailyLogs: m.dailyLogs || {}
          }));
          setMembers(loaded);

          // Fetch link statuses for members that have an email
          const statusMap = {};
          await Promise.all(
            loaded.map(async (m) => {
              if (m.email) {
                try {
                  const { data: ls } = await membersAPI.linkStatus(m._id || m.id);
                  statusMap[m._id || m.id] = ls.linked;
                } catch {
                  statusMap[m._id || m.id] = null;
                }
              }
            })
          );
          setLinkStatuses(statusMap);
        }
      } catch {
        // Fallback: try localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) setMembers(JSON.parse(raw));
        } catch { /* ignore */ }
      }
    };
    loadMembers();
  }, []);

  const resetForm = () => {
    setNewName(''); setNewEmail(''); setNewRelation('Spouse'); setNewDob(''); setNewWeight(''); setNewHeight('');
    setFormErrors({});
  };

  const addMember = async () => {
    const errs = {};
    if (!newName.trim()) errs.name = 'Name is required';
    if (!newEmail.trim() || !/^\S+@\S+\.\S+$/.test(newEmail.trim())) errs.email = 'A valid email is required';
    if (!newDob) errs.dob = 'Date of birth is required';
    if (!newWeight || parseFloat(newWeight) < 10 || parseFloat(newWeight) > 300) errs.weight = 'Valid weight required';
    if (!newHeight || parseFloat(newHeight) < 50 || parseFloat(newHeight) > 250) errs.height = 'Valid height required';
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const memberData = {
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      relation: newRelation,
      dob: newDob,
      weight: parseFloat(newWeight),
      height: parseFloat(newHeight),
    };

    try {
      const { data } = await membersAPI.add(memberData);
      const m = data.member;
      const newMember = { ...m, id: m._id, dailyLogs: m.dailyLogs || {} };
      setMembers(prev => [...prev, newMember]);

      // Immediately check link status if email provided
      if (m.email) {
        try {
          const { data: ls } = await membersAPI.linkStatus(m._id);
          setLinkStatuses(prev => ({ ...prev, [m._id]: ls.linked }));
        } catch { /* non-critical */ }
      }
    } catch {
      // Fallback: local only
      setMembers(prev => [...prev, { ...memberData, id: Date.now(), dailyLogs: {} }]);
    }
    resetForm();
    setShowAddModal(false);
  };

  const removeMember = async (id) => {
    try {
      await membersAPI.remove(id);
    } catch { /* continue locally */ }
    setMembers(members.filter(m => (m._id || m.id) !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateDailyData = async (memberId, field, value, nestedProp = null) => {
    // Update locally first for instant UI response
    const today = todayStr();
    let finalUpdated = null;
    
    setMembers(members.map(m => {
      if ((m._id || m.id) !== memberId) return m;
      const existing = (m.dailyLogs && m.dailyLogs[today]) ? JSON.parse(JSON.stringify(m.dailyLogs[today])) : JSON.parse(JSON.stringify(EMPTY_LIFESTYLE));
      
      let updated;
      if (nestedProp) {
         updated = { ...existing, [field]: { ...(existing[field] || {}), [nestedProp]: value } };
      } else {
         updated = { ...existing, [field]: value };
      }
      finalUpdated = updated;
      return {
        ...m,
        dailyLogs: { ...m.dailyLogs, [today]: updated }
      };
    }));
    
    // Sync to DB
    if (finalUpdated) {
      try {
        await membersAPI.updateDaily(memberId, today, finalUpdated);
      } catch { /* ignore */ }
    }
  };

  const getTodayData = (member) => (member.dailyLogs && member.dailyLogs[todayStr()]) || null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={20} color="var(--color-accent)" /> Family Members
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
            Track daily health data for your family. {members.length} member{members.length !== 1 ? 's' : ''} added.
          </p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          <UserPlus size={15} /> Add Member
        </button>
      </div>

      {/* Member Cards */}
      {members.map(member => {
        const todayData = getTodayData(member);
        const score = getMemberScore(todayData);
        const isExpanded = expandedId === member.id;
        const isEditing = editDataId === member.id;
        const color = getAvatarColor(member.name);

        return (
          <div key={member.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Member Header Row */}
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 24px', cursor: 'pointer', transition: 'background 0.15s'
              }}
              onClick={() => setExpandedId(isExpanded ? null : member.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', background: color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: color, fontWeight: 700, fontSize: 16, border: `2px solid ${color}30`
                }}>
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {member.name}
                    {/* Link status badge */}
                    {member.email && linkStatuses[member.id] === true && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                        background: 'rgba(16,185,129,0.12)', color: '#059669',
                        border: '1px solid rgba(16,185,129,0.25)',
                        display: 'flex', alignItems: 'center', gap: 3
                      }}>
                        🔗 Linked
                      </span>
                    )}
                    {member.email && linkStatuses[member.id] === false && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                        background: 'rgba(245,158,11,0.10)', color: '#D97706',
                        border: '1px solid rgba(245,158,11,0.25)',
                        display: 'flex', alignItems: 'center', gap: 3
                      }}>
                        ✉ Invite pending
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                    <span>{member.relation}</span>
                    {member.dob && <><span style={{ color: 'var(--border-color)' }}>·</span><span>{calculateAge(member.dob)} yrs</span></>}
                    {member.weight && <><span style={{ color: 'var(--border-color)' }}>·</span><span>{member.weight} kg</span></>}
                    {member.height && <><span style={{ color: 'var(--border-color)' }}>·</span><span>{member.height} cm</span></>}
                    {member.weight && member.height && <><span style={{ color: 'var(--border-color)' }}>·</span><span>BMI {calculateBMI(member.weight, member.height)}</span></>}
                    {member.email && <><span style={{ color: 'var(--border-color)' }}>·</span><span style={{ display:'flex', alignItems:'center', gap:3 }}><Mail size={10} />{member.email}</span></>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {score !== null ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Score</div>
                    <span style={{
                      fontSize: 22, fontWeight: 800,
                      color: scoreColor(score)
                    }}>{score}</span>
                  </div>
                ) : (
                  <span className="badge warning" style={{ fontSize: 10 }}>No data today</span>
                )}
                <div style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Expanded Section — inline daily log */}
            {isExpanded && (
              <div style={{
                borderTop: '1px solid var(--border-color)',
                padding: '20px 24px',
                background: 'var(--bg-primary)',
                animation: 'fadeIn 0.25s ease forwards'
              }}>
                {/* Action bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    {score !== null && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999,
                        background: scoreColor(score) + '15', color: scoreColor(score), marginLeft: 8
                      }}>
                        Risk: {score}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={isEditing ? 'primary-btn' : 'ghost-btn'}
                      style={{ padding: '6px 14px', fontSize: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isEditing) {
                          setEditDataId(null);
                        } else {
                          if (!todayData) {
                            updateDailyData(member.id, 'sleep', EMPTY_LIFESTYLE.sleep);
                          }
                          setEditDataId(member.id);
                        }
                      }}
                    >
                      {isEditing ? <><Check size={13} /> Done</> : <><Edit3 size={13} /> {todayData ? 'Edit' : 'Log Today'}</>}
                    </button>
                    <button
                      className="ghost-btn"
                      style={{ padding: '6px 14px', fontSize: 12, color: 'var(--color-danger)', borderColor: '#FEE2E2' }}
                      onClick={(e) => { e.stopPropagation(); removeMember(member.id); }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>

                {/* Daily data view / edit */}
                {todayData || isEditing ? (() => {
                  const data = todayData || EMPTY_LIFESTYLE;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {/* Sleep */}
                      <MemberSlider icon={Moon} iconColor="#8B5CF6" label="Sleep" 
                        value={data.sleep} unit="h" min={0} max={14} step={0.5} editing={isEditing}
                        valueColor={data.sleep < 6 ? "var(--color-danger)" : data.sleep < 7 ? "var(--color-warning)" : "var(--color-success)"}
                        onChange={v => updateDailyData(member.id, 'sleep', v)} />
                      
                      {/* Stress */}
                      <MemberSlider icon={Wind} iconColor="#EF4444" label="Stress" 
                        value={data.stress} unit="/10" min={1} max={10} step={1} editing={isEditing}
                        valueColor={stressColor(data.stress)}
                        onChange={v => updateDailyData(member.id, 'stress', v)} />
                      
                      {/* Steps */}
                      <MemberSlider icon={Footprints} iconColor="#F59E0B" label="Steps" 
                        value={data.steps ? Number(data.steps) : 0} unit="" min={0} max={15000} step={500} editing={isEditing}
                        onChange={v => updateDailyData(member.id, 'steps', String(v))} />
                      
                      {/* Water */}
                      <MemberSlider icon={Droplets} iconColor="#0EA5E9" label="Water" 
                        value={data.waterIntake} unit="L" min={0} max={5} step={0.1} editing={isEditing}
                        valueColor={data.waterIntake >= 2.5 ? "var(--color-success)" : data.waterIntake >= 1.5 ? "var(--color-warning)" : "var(--color-danger)"}
                        onChange={v => updateDailyData(member.id, 'waterIntake', v)} />

                      {/* Meals + Habits */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
                        {/* Meals */}
                        {["breakfast", "lunch", "dinner"].map(meal => (
                          <HabitPill key={meal} icon={UtensilsCrossed} label={meal.charAt(0).toUpperCase() + meal.slice(1)}
                            active={data[meal]} color="#10B981" editing={isEditing}
                            onClick={() => isEditing && updateDailyData(member.id, meal, !data[meal])} />
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                        <HabitPill icon={Cigarette} label="No Smoking" active={!data.smoking}
                          color="#F59E0B" editing={isEditing}
                          onClick={() => isEditing && updateDailyData(member.id, 'smoking', !data.smoking)} />
                        <HabitPill icon={Wine} label="No Alcohol" active={!data.alcohol}
                          color="#8B5CF6" editing={isEditing}
                          onClick={() => isEditing && updateDailyData(member.id, 'alcohol', !data.alcohol)} />
                      </div>

                      {/* --- VITALS SECTION --- */}
                      {(isEditing || (data.vitals && (data.vitals.heartRate || data.vitals.bpSys || data.vitals.temperature || data.vitals.spo2))) && (
                        <div style={{ marginTop: 24 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Heart size={14} color="var(--color-danger)" /> Vitals
                          </h4>
                          <div style={{ background: 'var(--bg-secondary)', padding: '0 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <VitalsField label="Heart Rate" placeholder="72" unit="bpm" value={data.vitals?.heartRate} editing={isEditing} onChange={v => updateDailyData(member.id, 'vitals', v, 'heartRate')} />
                            <VitalsField label="BP (Systolic)" placeholder="120" unit="mmHg" value={data.vitals?.bpSys} editing={isEditing} onChange={v => updateDailyData(member.id, 'vitals', v, 'bpSys')} />
                            <VitalsField label="BP (Diastolic)" placeholder="80" unit="mmHg" value={data.vitals?.bpDia} editing={isEditing} onChange={v => updateDailyData(member.id, 'vitals', v, 'bpDia')} />
                            <VitalsField label="Temperature" placeholder="36.6" unit="°C" value={data.vitals?.temperature} editing={isEditing} onChange={v => updateDailyData(member.id, 'vitals', v, 'temperature')} />
                            <VitalsField label="SpO₂" placeholder="98" unit="%" value={data.vitals?.spo2} editing={isEditing} onChange={v => updateDailyData(member.id, 'vitals', v, 'spo2')} />
                          </div>
                        </div>
                      )}

                      {/* --- HEALTH NOTES SECTION --- */}
                      {(isEditing || (data.notes && (data.notes.mood !== 'neutral' || data.notes.medicines || data.notes.symptoms?.length > 0 || data.notes.bloodSugar))) && (
                        <div style={{ marginTop: 24 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Stethoscope size={14} color="var(--color-purple)" /> Health Notes
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--bg-secondary)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            {/* Mood */}
                            {(isEditing || data.notes?.mood !== 'neutral') && (
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Mood</span>
                                {isEditing ? (
                                  <select value={data.notes?.mood || 'neutral'} onChange={e => updateDailyData(member.id, 'notes', e.target.value, 'mood')} style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: 13 }}>
                                    {MOOD_OPTIONS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                  </select>
                                ) : (
                                  <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{data.notes?.mood}</span>
                                )}
                              </div>
                            )}

                            {/* Additional Markers */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                              {(isEditing || data.notes?.bloodSugar) && (
                                <div>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Blood Sugar (mg/dL)</span>
                                  {isEditing ? (
                                    <input type="number" placeholder="90" value={data.notes?.bloodSugar || ''} onChange={e => updateDailyData(member.id, 'notes', e.target.value, 'bloodSugar')} style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: 13 }} />
                                  ) : (
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{data.notes?.bloodSugar}</span>
                                  )}
                                </div>
                              )}
                              {(isEditing || data.notes?.caffeine) && (
                                <div>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Coffee size={12}/>Caffeine (cups)</span>
                                  {isEditing ? (
                                    <input type="number" placeholder="2" value={data.notes?.caffeine || ''} onChange={e => updateDailyData(member.id, 'notes', e.target.value, 'caffeine')} style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: 13 }} />
                                  ) : (
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{data.notes?.caffeine}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Medicines */}
                            {(isEditing || data.notes?.medicines) && (
                              <div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Pill size={12}/>Medicines</span>
                                {isEditing ? (
                                  <textarea placeholder="e.g. Metformin 500mg" value={data.notes?.medicines || ''} onChange={e => updateDailyData(member.id, 'notes', e.target.value, 'medicines')} rows={2} style={{ width: '100%', padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: 13, resize: 'vertical' }} />
                                ) : (
                                  <p style={{ fontSize: 13, margin: 0 }}>{data.notes?.medicines}</p>
                                )}
                              </div>
                            )}

                            {/* Symptoms */}
                            <div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Symptoms</span>
                                {isEditing ? (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {COMMON_SYMPTOMS.map(s => {
                                      const isSel = data.notes?.symptoms?.includes(s);
                                      return (
                                        <button key={s} onClick={() => {
                                          const current = data.notes?.symptoms || [];
                                          const next = isSel ? current.filter(x => x !== s) : [...current, s];
                                          updateDailyData(member.id, 'notes', next, 'symptoms');
                                        }} style={{
                                          padding: '4px 10px', fontSize: 11, borderRadius: 12, cursor: 'pointer', border: isSel ? '1px solid var(--color-accent)' : '1px solid var(--border-color)',
                                          background: isSel ? 'var(--color-accent)' : 'var(--bg-primary)', color: isSel ? '#fff' : 'var(--text-secondary)'
                                        }}>
                                          {s}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {data.notes?.symptoms?.length > 0 ? data.notes.symptoms.map(s => (
                                      <span key={s} style={{ padding: '2px 8px', fontSize: 11, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>{s}</span>
                                    )) : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>None reported</span>}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      )}
                      </div>
                  );
                })() : (
                  <div style={{
                    padding: 24, textAlign: 'center', borderRadius: 'var(--radius-sm)',
                    border: '2px dashed var(--border-color)', color: 'var(--text-muted)'
                  }}>
                    <Heart size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <p style={{ fontSize: 13, fontWeight: 500 }}>No data logged for today</p>
                    <p style={{ fontSize: 11, marginTop: 4 }}>Click "Log Today" to start tracking</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Empty State */}
      {members.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Users size={40} color="var(--border-color)" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No family members yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Add family members to track their health alongside yours.</p>
          <button className="primary-btn" style={{ marginTop: 16 }} onClick={() => setShowAddModal(true)}>
            <UserPlus size={15} /> Add First Member
          </button>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="card" style={{
            width: 460, maxWidth: '90vw', padding: 28, position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <button
              style={{
                position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-muted)', padding: 4
              }}
              onClick={() => { setShowAddModal(false); resetForm(); }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Add Family Member
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Enter their details to start tracking their health.
            </p>

            {/* Name */}
            <ModalField label="Full Name" error={formErrors.name}>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Rahul Sharma" style={modalInputStyle(formErrors.name)} />
            </ModalField>

            {/* Email (required — links member to future account) */}
            <ModalField label="Email Address" error={formErrors.email} icon={<Mail size={11} color="var(--text-muted)" />}>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                placeholder="e.g. rahul@email.com" style={modalInputStyle(formErrors.email)} />
              <p style={{ fontSize: 11, marginTop: 5, padding: '6px 10px', borderRadius: 6,
                background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)',
                color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-accent)' }}>Required for data sync.</strong>{' '}
                When they register or log in with this email, all health data logged here will automatically sync to their personal account.
              </p>
            </ModalField>

            {/* Relation + DOB */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <ModalField label="Relation">
                <select value={newRelation} onChange={e => setNewRelation(e.target.value)}
                  style={{ ...modalInputStyle(), cursor: 'pointer' }}>
                  {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </ModalField>
              <ModalField label="Date of Birth" error={formErrors.dob}>
                <input type="date" value={newDob} onChange={e => setNewDob(e.target.value)}
                  max={maxDate} style={{ ...modalInputStyle(formErrors.dob), cursor: 'pointer' }} />
              </ModalField>
            </div>

            {/* Age preview */}
            {newDob && calculateAge(newDob) > 0 && (
              <div style={{
                padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 14,
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 12
              }}>
                <Cake size={14} color="#10B981" />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Age: {calculateAge(newDob)} years</span>
                <span style={{ color: 'var(--text-muted)' }}>— auto-calculated</span>
              </div>
            )}

            {/* Weight + Height */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <ModalField label="Weight (kg)" error={formErrors.weight} icon={<Scale size={11} color="var(--text-muted)" />}>
                <input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)}
                  placeholder="e.g. 65" style={modalInputStyle(formErrors.weight)} />
              </ModalField>
              <ModalField label="Height (cm)" error={formErrors.height} icon={<Ruler size={11} color="var(--text-muted)" />}>
                <input type="number" value={newHeight} onChange={e => setNewHeight(e.target.value)}
                  placeholder="e.g. 170" style={modalInputStyle(formErrors.height)} />
              </ModalField>
            </div>

            {/* BMI preview */}
            {newWeight && newHeight && parseFloat(newHeight) > 0 && (
              <div style={{
                padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 14,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  BMI: {calculateBMI(parseFloat(newWeight), parseFloat(newHeight))}
                </span>
                <span style={{
                  fontWeight: 600, fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  ...(() => {
                    const bmi = parseFloat(calculateBMI(parseFloat(newWeight), parseFloat(newHeight)));
                    if (bmi < 18.5) return { color: '#D97706', background: '#FEF3C7' };
                    if (bmi < 25) return { color: '#059669', background: '#D1FAE5' };
                    if (bmi < 30) return { color: '#D97706', background: '#FEF3C7' };
                    return { color: '#DC2626', background: '#FEE2E2' };
                  })()
                }}>
                  {(() => {
                    const bmi = parseFloat(calculateBMI(parseFloat(newWeight), parseFloat(newHeight)));
                    if (bmi < 18.5) return 'Underweight';
                    if (bmi < 25) return 'Normal';
                    if (bmi < 30) return 'Overweight';
                    return 'Obese';
                  })()}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="ghost-btn" style={{ flex: 1 }} onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
              <button
                className="primary-btn"
                style={{ flex: 1, opacity: newName.trim() && newEmail.trim() && newDob && newWeight && newHeight ? 1 : 0.5 }}
                onClick={addMember}
                disabled={!newName.trim() || !newEmail.trim()}
              >
                <UserPlus size={15} /> Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ---------- Modal helpers ---------- */

const modalInputStyle = (hasError) => ({
  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
  border: hasError ? '1px solid var(--color-danger)' : '1px solid var(--border-color)',
  fontSize: 13, fontFamily: 'var(--font-sans)', outline: 'none',
  background: 'var(--bg-primary)', boxSizing: 'border-box'
});

function ModalField({ label, error, icon, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.04em'
      }}>
        {icon} {label}
      </label>
      {children}
      {error && <p style={{ color: 'var(--color-danger)', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function MemberSlider({ icon: Icon, iconColor, label, value, unit, min, max, step, editing, onChange, valueColor }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0', borderBottom: '1px solid var(--border-color)'
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 6, background: iconColor + '14',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={14} color={iconColor} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', width: 50, flexShrink: 0 }}>{label}</span>
      {editing ? (
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ flex: 1 }}
        />
      ) : (
        <div style={{ flex: 1, height: 4, background: 'var(--border-color)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${Math.min(100, ((value - min) / (max - min)) * 100)}%`,
            background: iconColor, transition: 'width 0.3s ease'
          }} />
        </div>
      )}
      <span style={{
        fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)',
        width: 70, textAlign: 'right', flexShrink: 0,
        color: valueColor || 'var(--text-primary)'
      }}>
        {typeof value === 'number' && step < 1 ? value.toFixed(1) : value}{unit}
      </span>
    </div>
  );
}

function HabitPill({ icon: Icon, label, active, color, editing, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        borderRadius: 'var(--radius-sm)', cursor: editing ? 'pointer' : 'default',
        border: `1px solid ${active ? color + '40' : 'var(--border-color)'}`,
        background: active ? color + '0A' : 'var(--bg-secondary)',
        transition: 'all 0.2s'
      }}
    >
      <Icon size={14} color={active ? color : 'var(--text-muted)'} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: active ? color : 'var(--text-muted)', marginTop: 1 }}>
          {active ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
}

function VitalsField({ label, placeholder, unit, value, onChange, editing }) {
  if (!editing && !value) return null;
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      {editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="text" placeholder={placeholder} value={value || ''} onChange={e => onChange(e.target.value)}
            style={{ width: 60, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: 13, textAlign: 'right' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 34 }}>{unit}</span>
        </div>
      ) : (
        <span style={{ fontSize: 13, fontWeight: 600 }}>{value} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{unit}</span></span>
      )}
    </div>
  );
}
