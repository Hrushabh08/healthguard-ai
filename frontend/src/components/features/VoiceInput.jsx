import React, { useState } from 'react';
import { Mic, MicOff, Check, ArrowRight, Lock } from 'lucide-react';

export default function VoiceInput({ isGuest, navigate }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleRecording = () => {
    if (isGuest) return; // Locked for guests
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTranscript('');
      // Simulate transcription
      const phrases = [
        "I slept for 6 hours...",
        "I slept for 6 hours and feel stressed.",
        "I slept for 6 hours and feel stressed. I also walked 5000 steps today."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setTranscript(phrases[i]);
        i++;
        if (i === phrases.length) {
          clearInterval(interval);
          setTimeout(() => setIsRecording(false), 800);
        }
      }, 800);
    }
  };

  return (
    <div className="card fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
           <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Voice Logging</h3>
           <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Log symptoms or habits via speech</p>
        </div>
        <button 
          onClick={toggleRecording}
          disabled={isGuest}
          style={{ 
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: isRecording ? '#FEE2E2' : 'var(--bg-tertiary)',
            color: isRecording ? 'var(--color-danger)' : (isGuest ? 'var(--text-muted)' : 'var(--text-primary)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isGuest ? 'default' : 'pointer', transition: 'all 0.2s',
            boxShadow: isRecording ? '0 0 0 4px rgba(239,68,68,0.2)' : 'none',
            opacity: isGuest ? 0.6 : 1
          }}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      <div style={{ 
        minHeight: 60, padding: 12, 
        background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center',
        filter: isGuest ? 'blur(1.5px)' : 'none',
        opacity: isGuest ? 0.5 : 1
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {isGuest ? 'Voice logging is disabled in guest mode...' : 'Tap the microphone and say "I slept 8 hours..."'}
        </p>
      </div>

      {isGuest && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column', gap: 12, zIndex: 10
        }}>
          <div style={{ 
            background: 'var(--bg-primary)', padding: '12px 20px', borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)', textAlign: 'center', border: '1px solid var(--border-color)'
          }}>
            <Lock size={20} style={{ color: 'var(--color-accent)', marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Login Required</div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 12px' }}>Personalized voice logging requires an account.</p>
            <button 
              className="primary-btn" 
              onClick={() => navigate('/login')}
              style={{ padding: '6px 16px', fontSize: 12, width: '100%' }}
            >
              Sign In to Unlock
            </button>
          </div>
        </div>
      )}

      {!isRecording && transcript && !isGuest && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, animation: 'fadeIn 0.3s ease' }}>
          <button 
            className="primary-btn" 
            onClick={() => { setTranscript(''); alert("Data updated!"); }}
            style={{ width: '100%', padding: 10, display: 'flex', justifyContent: 'center', gap: 8 }}
          >
            <ArrowRight size={14} /> Update Data
          </button>
          <button className="ghost-btn" style={{ padding: 8, fontSize: 12 }} onClick={() => setTranscript('')}>Retry</button>
        </div>
      )}
    </div>
  );
}
