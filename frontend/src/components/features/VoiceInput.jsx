import React, { useState } from 'react';
import { Mic, MicOff, Check, ArrowRight } from 'lucide-react';

export default function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleRecording = () => {
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
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
           <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Voice Logging</h3>
           <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Log symptoms or habits via speech</p>
        </div>
        <button 
          onClick={toggleRecording}
          style={{ 
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: isRecording ? '#FEE2E2' : 'var(--bg-tertiary)',
            color: isRecording ? 'var(--color-danger)' : 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: isRecording ? '0 0 0 4px rgba(239,68,68,0.2)' : 'none'
          }}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      <div style={{ 
        minHeight: 60, padding: 12, 
        background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-color)',
        display: 'flex', alignItems: 'center'
      }}>
        {transcript ? (
          <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            "{transcript}"
            {isRecording && <span style={{ animation: 'fadeIn 1s infinite alternate', opacity: 0.5 }}>|</span>}
          </p>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Tap the microphone and say "I slept 8 hours and walked 5,000 steps..."
          </p>
        )}
      </div>

      {!isRecording && transcript && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, animation: 'fadeIn 0.3s ease' }}>
          <button className="primary-btn" style={{ flex: 1, padding: 8 }}><ArrowRight size={14} /> Update Data</button>
          <button className="ghost-btn" style={{ padding: 8 }} onClick={() => setTranscript('')}>Retry</button>
        </div>
      )}
    </div>
  );
}
