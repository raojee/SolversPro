import React, { useState } from 'react';

// Helper to flatten nested objects for tabular view
const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
};

export default function JsonEditor() {
  const [input, setInput] = useState('{\n  "example": "data",\n  "nested": {\n    "value": 123\n  }\n}');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('formatted'); // 'formatted', 'table'
  const [parsedData, setParsedData] = useState(null);

  const handleFormat = (space) => {
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, space));
      setParsedData(parsed);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(input);
      setParsedData(parsed);
      setError(null);
      alert('Valid JSON!');
    } catch (e) {
      setError(e.message);
    }
  };

  const renderTable = (data) => {
    if (!data) return <p className="text-zinc-400">No valid JSON data to display.</p>;
    
    if (Array.isArray(data)) {
      if (data.length === 0) return <p className="text-zinc-400">Empty Array</p>;
      // Assume array of objects for table
      const flattenedArray = data.map(item => typeof item === 'object' && item !== null ? flattenObject(item) : { value: item });
      const allKeys = Array.from(new Set(flattenedArray.flatMap(Object.keys)));
      
      return (
        <div className="overflow-x-auto rounded-lg border border-white/[0.1]">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-[#1a1a24] text-xs uppercase font-semibold text-zinc-400">
              <tr>
                {allKeys.map(key => <th key={key} className="px-4 py-3 border-b border-white/[0.1]">{key}</th>)}
              </tr>
            </thead>
            <tbody>
              {flattenedArray.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                  {allKeys.map(key => (
                    <td key={key} className="px-4 py-3">{row[key] !== undefined ? JSON.stringify(row[key]) : '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (typeof data === 'object' && data !== null) {
      const flattened = flattenObject(data);
      return (
        <div className="overflow-x-auto rounded-lg border border-white/[0.1]">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-[#1a1a24] text-xs uppercase font-semibold text-zinc-400">
              <tr>
                <th className="px-4 py-3 border-b border-white/[0.1] w-1/3">Key</th>
                <th className="px-4 py-3 border-b border-white/[0.1]">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(flattened).map(([key, value]) => (
                <tr key={key} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[#2dd4bf]">{key}</td>
                  <td className="px-4 py-3 font-mono">{JSON.stringify(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return <p className="text-zinc-300">{String(data)}</p>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-[600px]">
      {/* Input Side */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-[#0d0d14] px-4 py-3 border border-white/[0.06] rounded-t-xl border-b-0">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Input JSON</h2>
          <div className="flex gap-2">
            <button onClick={() => handleFormat(2)} className="px-3 py-1.5 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white rounded transition-colors border border-white/[0.1]">Format 2 Spaces</button>
            <button onClick={() => handleFormat(4)} className="px-3 py-1.5 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white rounded transition-colors border border-white/[0.1]">Format 4 Spaces</button>
            <button onClick={() => handleFormat(0)} className="px-3 py-1.5 text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-white rounded transition-colors border border-white/[0.1]">Minify</button>
            <button onClick={handleValidate} className="px-3 py-1.5 text-xs font-semibold bg-[#2dd4bf]/20 hover:bg-[#2dd4bf]/30 text-[#2dd4bf] rounded transition-colors border border-[#2dd4bf]/30">Validate</button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            try {
              setParsedData(JSON.parse(e.target.value));
              setError(null);
            } catch(e) {
              setError(e.message);
            }
          }}
          className="flex-1 w-full p-4 bg-[#1a1a24] border border-white/[0.06] rounded-b-xl focus:ring-1 focus:ring-[#ff6b35] focus:outline-none font-mono text-sm text-zinc-300 resize-none"
          spellCheck="false"
        />
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            Invalid JSON: {error}
          </div>
        )}
      </div>

      {/* Output Side */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex bg-[#0d0d14] px-2 py-2 border border-white/[0.06] rounded-t-xl border-b-0 gap-2">
          <button 
            onClick={() => setActiveTab('formatted')}
            className={`px-4 py-1.5 text-sm font-semibold rounded transition-colors ${activeTab === 'formatted' ? 'bg-[#ff6b35] text-white' : 'text-zinc-400 hover:bg-white/[0.05]'}`}
          >
            Formatted Output
          </button>
          <button 
            onClick={() => setActiveTab('table')}
            className={`px-4 py-1.5 text-sm font-semibold rounded transition-colors ${activeTab === 'table' ? 'bg-[#ff6b35] text-white' : 'text-zinc-400 hover:bg-white/[0.05]'}`}
          >
            Table View
          </button>
        </div>
        <div className="flex-1 w-full p-4 bg-[#1a1a24] border border-white/[0.06] rounded-b-xl overflow-y-auto">
          {activeTab === 'formatted' ? (
             <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap">{input}</pre>
          ) : (
            renderTable(parsedData)
          )}
        </div>
      </div>
    </div>
  );
}
