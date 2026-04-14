import React, { useState } from 'react';
import {
  Users, Plus, X, ChevronDown, ChevronUp, Droplets, Moon, Footprints,
  Wine, Cigarette, UtensilsCrossed, Heart, Edit3, Trash2, UserPlus, Calendar, Activity,
  Scale, Ruler, Cake
} from 'lucide-react';

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

function getMemberScore(data) {
  if (!data) return null;
  const base =
    (data.stress || 0) * 0.30 +
    Math.max(0, (8 - (data.sleep || 0)) / 8) * 100 * 0.25 +
    Math.max(0, (10000 - (data.steps || 0)) / 10000) * 100 * 0.15 +
    Math.max(0, (3 - (data.water || 0)) / 3) * 100 * 0.10;
  const penalty =
    (data.alcohol ? 8 : 0) +
    (data.smoking ? 10 : 0) +
    (!data.mealsOnTime ? 5 : 0);
  return Math.min(100, Math.round(base + penalty));
}

const todayStr = () => new Date().toISOString().slice(0, 10);

const DEFAULT_DAILY = {
  sleep: 7, stress: 30, steps: 5000, water: 2.0,
  alcohol: false, smoking: false, mealsOnTime: true
};

export default function FamilyMembers() {
  const [members, setMembers] = useState([
    {
      id: 1, name: 'Rahul Mehta', relation: 'Spouse', dob: '1992-03-15', weight: 74, height: 175,
      dailyLogs: {
        [todayStr()]: { sleep: 6.5, stress: 45, steps: 3200, water: 1.5, alcohol: false, smoking: false, mealsOnTime: true }
      }
    },
    {
      id: 2, name: 'Ananya Sharma', relation: 'Mother', dob: '1968-08-22', weight: 62, height: 158,
      dailyLogs: {
        [todayStr()]: { sleep: 5, stress: 60, steps: 1800, water: 1.0, alcohol: false, smoking: false, mealsOnTime: false }
      }
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [editDataId, setEditDataId] = useState(null);

  // Add member form
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Spouse');
  const [newDob, setNewDob] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const maxDate = new Date().toISOString().split('T')[0];

  const resetForm = () => {
    setNewName(''); setNewRelation('Spouse'); setNewDob(''); setNewWeight(''); setNewHeight('');
    setFormErrors({});
  };

  const addMember = () => {
    const errs = {};
    if (!newName.trim()) errs.name = 'Name is required';
    if (!newDob) errs.dob = 'Date of birth is required';
    if (!newWeight || parseFloat(newWeight) < 10 || parseFloat(newWeight) > 300) errs.weight = 'Valid weight required (10–300 kg)';
    if (!newHeight || parseFloat(newHeight) < 50 || parseFloat(newHeight) > 250) errs.height = 'Valid height required (50–250 cm)';
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    const member = {
      id: Date.now(),
      name: newName.trim(),
      relation: newRelation,
      dob: newDob,
      weight: parseFloat(newWeight),
      height: parseFloat(newHeight),
      dailyLogs: {}
    };
    setMembers([...members, member]);
    resetForm();
    setShowAddModal(false);
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateDailyData = (memberId, field, value) => {
    setMembers(members.map(m => {
      if (m.id !== memberId) return m;
      const today = todayStr();
      const existing = m.dailyLogs[today] || { ...DEFAULT_DAILY };
      return {
        ...m,
        dailyLogs: { ...m.dailyLogs, [today]: { ...existing, [field]: value } }
      };
    }));
  };

  const getTodayData = (member) => member.dailyLogs[todayStr()] || null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

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
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{member.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center', marginTop: 2, flexWrap: 'wrap' }}>
                    <span>{member.relation}</span>
                    {member.dob && <><span style={{ color: 'var(--border-color)' }}>•</span><span>{calculateAge(member.dob)} yrs</span></>}
                    {member.weight && <><span style={{ color: 'var(--border-color)' }}>•</span><span>{member.weight} kg</span></>}
                    {member.height && <><span style={{ color: 'var(--border-color)' }}>•</span><span>{member.height} cm</span></>}
                    {member.weight && member.height && <><span style={{ color: 'var(--border-color)' }}>•</span><span>BMI {calculateBMI(member.weight, member.height)}</span></>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {score !== null ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Today's Score</div>
                    <span style={{
                      fontSize: 22, fontWeight: 800,
                      color: score > 70 ? 'var(--color-danger)' : score > 50 ? 'var(--color-warning)' : 'var(--color-success)'
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

            {/* Expanded Section */}
            {isExpanded && (
              <div style={{
                borderTop: '1px solid var(--border-color)',
                padding: '20px 24px',
                background: 'var(--bg-primary)',
                animation: 'fadeIn 0.25s ease forwards'
              }}>
                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
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
                          // Initialize today's data if not present
                          if (!todayData) {
                            updateDailyData(member.id, 'sleep', DEFAULT_DAILY.sleep);
                          }
                          setEditDataId(member.id);
                        }
                      }}
                    >
                      <Edit3 size={13} /> {isEditing ? 'Done' : todayData ? 'Edit Data' : 'Log Today'}
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

                {/* Data Display / Edit */}
                {todayData || isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {/* Slider Fields */}
                    <DailySlider icon={Moon} iconColor="#8B5CF6" label="Sleep" value={(todayData || DEFAULT_DAILY).sleep}
                      unit=" hrs" min={0} max={12} step={0.5} editing={isEditing}
                      onChange={v => updateDailyData(member.id, 'sleep', v)} />
                    <DailySlider icon={Activity} iconColor="#EF4444" label="Stress" value={(todayData || DEFAULT_DAILY).stress}
                      unit="%" min={0} max={100} step={5} editing={isEditing}
                      onChange={v => updateDailyData(member.id, 'stress', v)} />
                    <DailySlider icon={Footprints} iconColor="#F59E0B" label="Steps" value={(todayData || DEFAULT_DAILY).steps}
                      unit="" min={0} max={15000} step={500} editing={isEditing}
                      onChange={v => updateDailyData(member.id, 'steps', v)} />
                    <DailySlider icon={Droplets} iconColor="#0EA5E9" label="Water" value={(todayData || DEFAULT_DAILY).water}
                      unit=" L" min={0} max={5} step={0.1} editing={isEditing}
                      onChange={v => updateDailyData(member.id, 'water', v)} />

                    {/* Toggle Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
                      <HabitPill icon={UtensilsCrossed} label="Meals On Time" active={(todayData || DEFAULT_DAILY).mealsOnTime}
                        color="#10B981" editing={isEditing}
                        onClick={() => isEditing && updateDailyData(member.id, 'mealsOnTime', !(todayData || DEFAULT_DAILY).mealsOnTime)} />
                      <HabitPill icon={Wine} label="Alcohol" active={(todayData || DEFAULT_DAILY).alcohol}
                        color="#8B5CF6" editing={isEditing} invert
                        onClick={() => isEditing && updateDailyData(member.id, 'alcohol', !(todayData || DEFAULT_DAILY).alcohol)} />
                      <HabitPill icon={Cigarette} label="Smoking" active={(todayData || DEFAULT_DAILY).smoking}
                        color="#F59E0B" editing={isEditing} invert
                        onClick={() => isEditing && updateDailyData(member.id, 'smoking', !(todayData || DEFAULT_DAILY).smoking)} />
                    </div>
                  </div>
                ) : (
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

            {/* Relation + DOB row */}
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

            {/* Age preview from DOB */}
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

            {/* Weight + Height row */}
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
                style={{ flex: 1, opacity: newName.trim() && newDob && newWeight && newHeight ? 1 : 0.5 }}
                onClick={addMember}
                disabled={!newName.trim()}
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

function DailySlider({ icon: Icon, iconColor, label, value, unit, min, max, step, editing, onChange }) {
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
        width: 70, textAlign: 'right', flexShrink: 0
      }}>
        {typeof value === 'number' && step < 1 ? value.toFixed(1) : value}{unit}
      </span>
    </div>
  );
}

function HabitPill({ icon: Icon, label, active, color, editing, invert, onClick }) {
  const isGood = invert ? !active : active;
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
        borderRadius: 'var(--radius-sm)', cursor: editing ? 'pointer' : 'default',
        border: `1px solid ${isGood ? color + '40' : 'var(--border-color)'}`,
        background: isGood ? color + '0A' : 'var(--bg-secondary)',
        transition: 'all 0.2s'
      }}
    >
      <Icon size={14} color={isGood ? color : 'var(--text-muted)'} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: isGood ? color : 'var(--text-muted)', marginTop: 1 }}>
          {invert ? (active ? 'Yes' : 'No') : (active ? 'Yes' : 'No')}
        </div>
      </div>
    </div>
  );
}
