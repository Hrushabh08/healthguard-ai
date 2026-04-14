import React, { useState } from 'react';
import { ShieldAlert, Plus, ToggleRight, ToggleLeft } from 'lucide-react';

export default function FamilyNotification() {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Rahul Mehta', relation: 'Spouse', active: true },
    { id: 2, name: 'Dr. Sarah Jenkins', relation: 'Primary Care', active: true },
    { id: 3, name: 'Ananya Singh', relation: 'Daughter', active: false },
  ]);

  const toggleContact = (id) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Emergency & Family Shared</h3>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Auto-notify in case of risk spikes</p>
        </div>
        <button className="ghost-btn" style={{ padding: '6px 12px' }}>
          <Plus size={14} /> Add
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {contacts.map(c => (
          <div key={c.id} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)', background: 'var(--bg-secondary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
               <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: 13 }}>
                 {c.name.charAt(0)}
               </div>
               <div>
                 <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                 <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.relation}</div>
               </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: c.active ? 'var(--color-success)' : 'var(--text-muted)' }}>
                {c.active ? 'Active' : 'Inactive'}
              </span>
              <div style={{ cursor: 'pointer', color: c.active ? 'var(--color-accent)' : 'var(--text-muted)' }} onClick={() => toggleContact(c.id)}>
                {c.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: 16, display: 'flex', gap: 8, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
        <ShieldAlert size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Active contacts will receive an SMS if your clinical risk score exceeds 80 continuously for 48 hours.
        </span>
      </div>
    </div>
  );
}
