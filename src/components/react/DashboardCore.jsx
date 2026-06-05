import React, { useState, useEffect, useRef } from 'react';

export default function DashboardCore() {
  const [activeTab, setActiveTab] = useState('recent');
  const [recentActivity, setRecentActivity] = useState([]);
  const [savedResults, setSavedResults] = useState([]);
  const [preferences, setPreferences] = useState({
    defaultCurrency: 'USD',
    measurementSystem: 'imperial'
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load data from localStorage on client mount
    try {
      const recent = localStorage.getItem('solversPro_recent');
      if (recent) setRecentActivity(JSON.parse(recent));

      const saved = localStorage.getItem('solversPro_saved');
      if (saved) setSavedResults(JSON.parse(saved));

      const prefs = localStorage.getItem('solvers_preferences');
      if (prefs) setPreferences(JSON.parse(prefs));
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
    setIsLoaded(true);
  }, []);

  const clearRecent = () => {
    localStorage.removeItem('solversPro_recent');
    setRecentActivity([]);
  };

  const deleteSavedItem = (id) => {
    const updated = savedResults.filter(item => item.id !== id);
    localStorage.setItem('solversPro_saved', JSON.stringify(updated));
    setSavedResults(updated);
  };

  const savePreferences = (newPrefs) => {
    localStorage.setItem('solvers_preferences', JSON.stringify(newPrefs));
    setPreferences(newPrefs);
  };

  const handleCurrencyChange = (e) => {
    savePreferences({ ...preferences, defaultCurrency: e.target.value });
  };

  const handleMeasurementChange = (e) => {
    savePreferences({ ...preferences, measurementSystem: e.target.value });
  };

  const exportData = () => {
    const data = {
      solversPro_recent: localStorage.getItem('solversPro_recent') || '[]',
      solversPro_saved: localStorage.getItem('solversPro_saved') || '[]',
      solvers_preferences: localStorage.getItem('solvers_preferences') || JSON.stringify({ defaultCurrency: 'USD', measurementSystem: 'imperial' })
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solverspro-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.solversPro_recent) {
          localStorage.setItem('solversPro_recent', data.solversPro_recent);
          setRecentActivity(JSON.parse(data.solversPro_recent));
        }
        if (data.solversPro_saved) {
          localStorage.setItem('solversPro_saved', data.solversPro_saved);
          setSavedResults(JSON.parse(data.solversPro_saved));
        }
        if (data.solvers_preferences) {
          localStorage.setItem('solvers_preferences', data.solvers_preferences);
          setPreferences(JSON.parse(data.solvers_preferences));
        }
        
        alert("Backup imported successfully!");
      } catch (err) {
        alert("Failed to parse backup file. Please ensure it is a valid SolversPro backup JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input so same file can be selected again
  };

  const clearAllData = () => {
    if (window.confirm("WARNING: Are you sure you want to clear ALL your data?\n\nThis will permanently delete your history, saved results, and preferences from this browser. This action cannot be undone.")) {
      localStorage.removeItem('solversPro_recent');
      localStorage.removeItem('solversPro_saved');
      localStorage.removeItem('solvers_preferences');
      setRecentActivity([]);
      setSavedResults([]);
      setPreferences({ defaultCurrency: 'USD', measurementSystem: 'imperial' });
      alert("All data has been cleared.");
    }
  };

  if (!isLoaded) {
    return <div className="animate-pulse bg-white/[0.02] h-64 rounded-xl mt-8"></div>;
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 sm:p-8 max-w-4xl mx-auto mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-white/[0.06] pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Dashboard</h2>
          <p className="text-zinc-400">View your recent calculations, saved results, and manage settings.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2 overflow-x-auto max-w-full pb-2 sm:pb-0">
          <button 
            onClick={() => setActiveTab('recent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'recent' ? 'bg-[#ff6b35] text-white' : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1]'}`}
          >
            Recent Activity
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'saved' ? 'bg-[#ff6b35] text-white' : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1]'}`}
          >
            Saved Results
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-[#ff6b35] text-white' : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.1]'}`}
          >
            Settings
          </button>
        </div>
      </div>

      {activeTab === 'recent' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Recently Visited Tools</h3>
            {recentActivity.length > 0 && (
              <button onClick={clearRecent} className="text-sm text-red-400 hover:text-red-300 transition-colors">
                Clear History
              </button>
            )}
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex items-center justify-center p-12 border border-dashed border-white/[0.1] rounded-xl bg-white/[0.01]">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-white mb-2">No Recent Activity</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto">Your recent tool usage and calculations will appear here. Start using our solvers to populate your dashboard.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentActivity.map((item, index) => (
                <a key={index} href={item.path} className="block p-4 border border-white/[0.06] rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[#2dd4bf] group-hover:text-teal-300 transition-colors">{item.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1">Visited {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <span className="text-zinc-600 group-hover:text-white transition-colors">→</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Saved Calculations</h3>
          </div>

          {savedResults.length === 0 ? (
            <div className="flex items-center justify-center p-12 border border-dashed border-white/[0.1] rounded-xl bg-white/[0.01]">
              <div className="text-center">
                <div className="text-4xl mb-4">💾</div>
                <h3 className="text-lg font-medium text-white mb-2">No Saved Results</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto">You haven't saved any calculation results yet. Look for the "Save Result" button on calculator pages.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {savedResults.map((item) => (
                <div key={item.id} className="p-5 border border-white/[0.06] rounded-xl bg-white/[0.01]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <a href={item.path} className="font-medium text-[#ff6b35] hover:text-orange-400 transition-colors text-lg inline-flex items-center gap-2">
                        {item.title}
                        <span className="text-sm opacity-50">↗</span>
                      </a>
                      <p className="text-xs text-zinc-500 mt-1">Saved on {new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => deleteSavedItem(item.id)}
                      className="text-zinc-500 hover:text-red-400 p-2 -mr-2 transition-colors"
                      title="Delete saved result"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto text-zinc-300">
                    {/* Render different payload types based on how they were saved */}
                    {item.payload.type === 'key-value' ? (
                      <div className="grid grid-cols-2 gap-y-2 max-w-sm">
                        {Object.entries(item.payload.data).map(([k, v]) => (
                          <React.Fragment key={k}>
                            <span className="text-zinc-500">{k}:</span>
                            <span className="text-[#2dd4bf]">{v}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    ) : item.payload.type === 'text' ? (
                      <div className="text-teal-400">{item.payload.data}</div>
                    ) : (
                      <pre>{JSON.stringify(item.payload.data, null, 2)}</pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="p-6 border border-white/[0.06] rounded-xl bg-white/[0.01]">
            <h3 className="text-xl font-bold text-white mb-4">Global Preferences</h3>
            <p className="text-sm text-zinc-400 mb-6">These settings will be used as the default values across all calculators.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 font-mono">
                  Default Currency
                </label>
                <select 
                  className="w-full bg-white/[0.03] border border-white/[0.1] text-white rounded-md py-2.5 px-4 focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] focus:bg-white/[0.05] transition-all font-mono"
                  value={preferences.defaultCurrency}
                  onChange={handleCurrencyChange}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 font-mono">
                  Measurement System
                </label>
                <select 
                  className="w-full bg-white/[0.03] border border-white/[0.1] text-white rounded-md py-2.5 px-4 focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] focus:bg-white/[0.05] transition-all font-mono"
                  value={preferences.measurementSystem}
                  onChange={handleMeasurementChange}
                >
                  <option value="imperial">Imperial (lbs, in, ft)</option>
                  <option value="metric">Metric (kg, cm, m)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 border border-white/[0.06] rounded-xl bg-white/[0.01]">
            <h3 className="text-xl font-bold text-white mb-4">Data Management</h3>
            <p className="text-sm text-zinc-400 mb-6">Backup your dashboard data to your device, or restore from a previous backup. All data is saved locally in your browser.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={exportData}
                className="flex items-center justify-center gap-2 bg-[#2dd4bf]/10 text-[#2dd4bf] hover:bg-[#2dd4bf]/20 border border-[#2dd4bf]/20 transition-all font-medium py-2.5 px-6 rounded-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export Backup
              </button>

              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleImportFile}
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.1] transition-all font-medium py-2.5 px-6 rounded-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                Import Backup
              </button>
            </div>

            <div className="pt-6 border-t border-red-500/20">
              <h4 className="text-red-400 font-bold mb-2">Danger Zone</h4>
              <p className="text-sm text-zinc-500 mb-4">Permanently delete all your recent activity, saved results, and preferences from this browser.</p>
              <button 
                onClick={clearAllData}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all font-medium py-2 px-6 rounded-lg text-sm"
              >
                Clear All Data
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
