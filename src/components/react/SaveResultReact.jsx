import React, { useState, useEffect } from 'react';

export default function SaveResultReact({ 
  toolName, 
  toolPath, 
  payloadGenerator, // function returning { type: 'text'|'key-value', data: any }
  className = '' 
}) {
  const [status, setStatus] = useState('idle'); // idle, saved

  useEffect(() => {
    if (status === 'saved') {
      const timer = setTimeout(() => setStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSave = () => {
    if (typeof window.saveToDashboard === 'function' && payloadGenerator) {
      const payload = payloadGenerator();
      if (!payload) return;
      
      const success = window.saveToDashboard(toolName, toolPath, payload);
      if (success) {
        setStatus('saved');
      }
    }
  };

  const isSaved = status === 'saved';

  return (
    <button 
      type="button"
      onClick={handleSave}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 mt-4 rounded-lg text-sm font-medium transition-all ${
        isSaved 
          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
          : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1] border-white/[0.1] hover:border-white/[0.2]'
      } border ${className}`}
    >
      {!isSaved ? (
        <svg className="icon-save" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
      ) : (
        <svg className="icon-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
      <span className="btn-text">{isSaved ? 'Saved!' : 'Save Result'}</span>
    </button>
  );
}
